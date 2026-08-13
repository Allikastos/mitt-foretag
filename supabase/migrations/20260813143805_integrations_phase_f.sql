-- Generated from supabase/phase-f.sql; review before any database use.
-- Additive Phase F integration readiness and webhook idempotency.
-- Apply after hub.sql, phase-b.sql, accounting.sql and phases C-E.
-- This proposal has not been executed against any Supabase environment.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category text not null check (category in (
    'database', 'private_storage', 'document_ai', 'background_queue',
    'hub_email', 'bank_import', 'subscription_billing', 'rate_limiting',
    'observability', 'backup_restore'
  )),
  provider text not null check (
    char_length(provider) between 1 and 40
    and provider ~ '^[A-Za-z0-9][A-Za-z0-9_-]*$'
  ),
  status text not null default 'pending' check (status in (
    'pending', 'connected', 'degraded', 'error', 'disconnected'
  )),
  display_name text check (
    display_name is null or char_length(display_name) between 1 and 120
  ),
  configuration_version integer not null default 1 check (
    configuration_version between 1 and 1000000
  ),
  health_status text not null default 'unknown' check (health_status in (
    'unknown', 'healthy', 'degraded', 'error'
  )),
  connected_by uuid references auth.users(id) on delete set null,
  connected_at timestamptz,
  last_health_checked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, category),
  unique (id, organization_id)
);

create table if not exists public.external_event_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  integration_connection_id uuid,
  provider text not null check (
    char_length(provider) between 1 and 40
    and provider ~ '^[A-Za-z0-9][A-Za-z0-9_-]*$'
  ),
  external_event_id text not null check (
    char_length(external_event_id) between 8 and 255
  ),
  event_type text not null check (char_length(event_type) between 1 and 120),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  status text not null default 'processing' check (status in (
    'processing', 'succeeded', 'failed', 'ignored'
  )),
  attempt_count integer not null default 1 check (attempt_count between 1 and 100),
  failure_code text check (
    failure_code is null or char_length(failure_code) between 1 and 80
  ),
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, provider, external_event_id),
  foreign key (integration_connection_id, organization_id)
    references public.integration_connections(id, organization_id)
    on delete set null (integration_connection_id)
);

create index if not exists integration_connections_org_status_idx
  on public.integration_connections (organization_id, status, category);
create index if not exists external_event_receipts_org_received_idx
  on public.external_event_receipts (organization_id, received_at desc);
create index if not exists external_event_receipts_processing_idx
  on public.external_event_receipts (updated_at)
  where status = 'processing';

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_integration_connections_updated_at' and not tgisinternal
  ) then
    create trigger set_integration_connections_updated_at
      before update on public.integration_connections
      for each row execute function public.set_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_external_event_receipts_updated_at' and not tgisinternal
  ) then
    create trigger set_external_event_receipts_updated_at
      before update on public.external_event_receipts
      for each row execute function public.set_updated_at();
  end if;
end
$$;

alter table public.integration_connections enable row level security;
alter table public.external_event_receipts enable row level security;

create policy external_event_receipts_no_client_access
  on public.external_event_receipts
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'integration_connections'
      and policyname = 'integration_connections_owner_read'
  ) then
    create policy integration_connections_owner_read
      on public.integration_connections
      for select
      to authenticated
      using (public.can_manage_org_settings(organization_id));
  end if;
end
$$;

revoke all on public.integration_connections from public, anon, authenticated;
grant select (
  id, organization_id, category, provider, status, display_name,
  configuration_version, health_status, connected_by, connected_at,
  last_health_checked_at, created_at, updated_at
) on public.integration_connections to authenticated;

revoke all on public.external_event_receipts from public, anon, authenticated;

create or replace function private.record_integration_connection(
  target_organization_id uuid,
  target_category text,
  target_provider text,
  target_status text,
  target_display_name text,
  target_changed_by uuid,
  target_health_status text default 'unknown'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_connection_id uuid;
begin
  if target_category not in (
    'database', 'private_storage', 'document_ai', 'background_queue',
    'hub_email', 'bank_import', 'subscription_billing', 'rate_limiting',
    'observability', 'backup_restore'
  )
  or char_length(trim(coalesce(target_provider, ''))) not between 1 and 40
  or trim(target_provider) !~ '^[A-Za-z0-9][A-Za-z0-9_-]*$'
  or target_status not in ('pending', 'connected', 'degraded', 'error', 'disconnected')
  or target_health_status not in ('unknown', 'healthy', 'degraded', 'error')
  or char_length(coalesce(target_display_name, '')) > 120 then
    raise exception 'Integration connection input is invalid';
  end if;

  if target_changed_by is not null and not exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = target_changed_by
      and role in ('owner', 'admin')
  ) then
    raise exception 'Integration actor is not authorized for organization';
  end if;

  insert into public.integration_connections (
    organization_id, category, provider, status, display_name,
    health_status, connected_by, connected_at, last_health_checked_at
  ) values (
    target_organization_id, target_category, trim(target_provider),
    target_status, nullif(trim(coalesce(target_display_name, '')), ''),
    target_health_status, target_changed_by,
    case when target_status = 'connected' then timezone('utc', now()) else null end,
    case when target_health_status <> 'unknown' then timezone('utc', now()) else null end
  )
  on conflict (organization_id, category) do update
  set provider = excluded.provider,
      status = excluded.status,
      display_name = excluded.display_name,
      health_status = excluded.health_status,
      configuration_version = public.integration_connections.configuration_version + 1,
      connected_by = excluded.connected_by,
      connected_at = case
        when excluded.status = 'connected'
          then coalesce(public.integration_connections.connected_at, timezone('utc', now()))
        else null
      end,
      last_health_checked_at = excluded.last_health_checked_at
  returning id into target_connection_id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, target_changed_by, 'integration_connection',
    target_connection_id, 'integration_connection_recorded',
    jsonb_build_object(
      'category', target_category,
      'provider', trim(target_provider),
      'status', target_status,
      'healthStatus', target_health_status
    )
  );

  return target_connection_id;
end;
$$;

create or replace function private.begin_external_event(
  target_organization_id uuid,
  target_integration_connection_id uuid,
  target_provider text,
  target_external_event_id text,
  target_event_type text,
  target_payload_sha256 text
)
returns table (receipt_id uuid, receipt_status text, should_process boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_receipt public.external_event_receipts%rowtype;
begin
  if char_length(trim(coalesce(target_provider, ''))) not between 1 and 40
  or trim(target_provider) !~ '^[A-Za-z0-9][A-Za-z0-9_-]*$'
  or char_length(trim(coalesce(target_external_event_id, ''))) not between 8 and 255
  or char_length(trim(coalesce(target_event_type, ''))) not between 1 and 120
  or target_payload_sha256 is null
  or target_payload_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'External event input is invalid';
  end if;

  if target_integration_connection_id is not null and not exists (
    select 1
    from public.integration_connections
    where id = target_integration_connection_id
      and organization_id = target_organization_id
      and provider = trim(target_provider)
  ) then
    raise exception 'Integration connection does not match event';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      target_organization_id::text || ':' || trim(target_provider) || ':' ||
      trim(target_external_event_id),
      0
    )
  );

  select * into existing_receipt
  from public.external_event_receipts
  where organization_id = target_organization_id
    and provider = trim(target_provider)
    and external_event_id = trim(target_external_event_id)
  for update;

  if found then
    if existing_receipt.payload_sha256 <> target_payload_sha256
    or existing_receipt.event_type <> trim(target_event_type) then
      raise exception 'External event identity conflict';
    end if;

    if existing_receipt.status in ('succeeded', 'ignored')
    or (
      existing_receipt.status = 'processing'
      and existing_receipt.updated_at > timezone('utc', now()) - interval '15 minutes'
    ) then
      return query select existing_receipt.id, existing_receipt.status, false;
      return;
    end if;

    update public.external_event_receipts
    set status = 'processing',
        attempt_count = attempt_count + 1,
        failure_code = null,
        processed_at = null
    where id = existing_receipt.id
    returning id, status into receipt_id, receipt_status;

    should_process := true;
    return next;
    return;
  end if;

  insert into public.external_event_receipts (
    organization_id, integration_connection_id, provider,
    external_event_id, event_type, payload_sha256
  ) values (
    target_organization_id, target_integration_connection_id,
    trim(target_provider), trim(target_external_event_id),
    trim(target_event_type), target_payload_sha256
  )
  returning id, status into receipt_id, receipt_status;

  should_process := true;
  return next;
end;
$$;

create or replace function private.complete_external_event(
  target_receipt_id uuid,
  target_status text,
  target_failure_code text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if target_status not in ('succeeded', 'failed', 'ignored')
  or char_length(coalesce(target_failure_code, '')) > 80
  or (target_status = 'failed' and nullif(trim(coalesce(target_failure_code, '')), '') is null)
  or (target_status <> 'failed' and target_failure_code is not null) then
    raise exception 'External event completion input is invalid';
  end if;

  update public.external_event_receipts
  set status = target_status,
      failure_code = case
        when target_status = 'failed' then trim(target_failure_code)
        else null
      end,
      processed_at = timezone('utc', now())
  where id = target_receipt_id and status = 'processing';

  if not found then
    raise exception 'External event receipt is not processing';
  end if;
end;
$$;

revoke all on function private.record_integration_connection(uuid, text, text, text, text, uuid, text)
  from public, anon, authenticated;
revoke all on function private.begin_external_event(uuid, uuid, text, text, text, text)
  from public, anon, authenticated;
revoke all on function private.complete_external_event(uuid, text, text)
  from public, anon, authenticated;

grant execute on function private.record_integration_connection(uuid, text, text, text, text, uuid, text)
  to service_role;
grant execute on function private.begin_external_event(uuid, uuid, text, text, text, text)
  to service_role;
grant execute on function private.complete_external_event(uuid, text, text)
  to service_role;
