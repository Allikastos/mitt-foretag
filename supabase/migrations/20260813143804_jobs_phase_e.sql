-- Generated from supabase/phase-e.sql; review before any database use.
-- Additive Phase E background-job workflow.
-- Apply after hub.sql, phase-b.sql, accounting.sql, phase-c.sql and phase-d.sql.
-- This proposal has not been executed against any Supabase environment.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;

alter table public.processing_jobs
  add column if not exists result jsonb,
  add column if not exists user_message text,
  add column if not exists last_error_code text,
  add column if not exists deduplication_key text,
  add column if not exists request_hash text,
  add column if not exists priority smallint not null default 0,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists max_attempts integer not null default 3,
  add column if not exists available_at timestamptz not null default timezone('utc', now()),
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists lease_owner text,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists heartbeat_at timestamptz,
  add column if not exists cancel_requested_at timestamptz,
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null,
  add column if not exists cancellation_reason text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'processing_jobs_priority_check'
  ) then
    alter table public.processing_jobs add constraint processing_jobs_priority_check
      check (priority between -100 and 100) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'processing_jobs_attempts_check'
  ) then
    alter table public.processing_jobs add constraint processing_jobs_attempts_check
      check (attempt_count >= 0 and max_attempts between 1 and 10) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'processing_jobs_deduplication_key_check'
  ) then
    alter table public.processing_jobs add constraint processing_jobs_deduplication_key_check
      check (
        deduplication_key is null
        or char_length(deduplication_key) between 8 and 200
      ) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'processing_jobs_request_hash_check'
  ) then
    alter table public.processing_jobs add constraint processing_jobs_request_hash_check
      check (request_hash is null or request_hash ~ '^[0-9a-f]{64}$') not valid;
  end if;
end
$$;

create unique index if not exists processing_jobs_org_deduplication_idx
  on public.processing_jobs (organization_id, type, deduplication_key)
  where deduplication_key is not null;
create index if not exists processing_jobs_claim_idx
  on public.processing_jobs (priority desc, available_at, created_at)
  where status = 'queued';
create index if not exists processing_jobs_expired_lease_idx
  on public.processing_jobs (lease_expires_at)
  where status = 'processing';

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_processing_jobs_updated_at' and not tgisinternal
  ) then
    create trigger set_processing_jobs_updated_at
      before update on public.processing_jobs
      for each row execute function public.set_updated_at();
  end if;
end
$$;

alter table public.processing_jobs enable row level security;
revoke select, insert, update, delete on public.processing_jobs from public, anon, authenticated;
grant select (
  id, organization_id, type, status, user_message, attempt_count, max_attempts,
  available_at, started_at, finished_at, cancel_requested_at, created_at, updated_at
) on public.processing_jobs to authenticated;

create or replace function private.enqueue_processing_job(
  target_organization_id uuid,
  target_created_by uuid,
  target_type text,
  target_entity_type text,
  target_entity_id uuid,
  target_payload jsonb,
  target_deduplication_key text,
  target_request_hash text,
  target_priority integer default 0,
  target_max_attempts integer default 3
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing_job public.processing_jobs%rowtype;
  target_job_id uuid := gen_random_uuid();
begin
  if target_created_by is not null and not exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = target_created_by
      and role in ('owner', 'admin', 'member')
  ) then
    raise exception 'Job creator is not authorized for organization';
  end if;

  if target_type is null
  or target_type not in (
    'document_processing', 'invoice_generation', 'sie_export',
    'report_generation', 'email_delivery', 'bank_import', 'follow_up_digest'
  )
  or not (
    (target_entity_type is null and target_entity_id is null)
    or (
      char_length(trim(coalesce(target_entity_type, ''))) between 1 and 100
      and target_entity_id is not null
    )
  )
  or char_length(trim(coalesce(target_deduplication_key, ''))) not between 8 and 200
  or target_request_hash is null
  or target_request_hash !~ '^[0-9a-f]{64}$'
  or jsonb_typeof(coalesce(target_payload, '{}'::jsonb)) <> 'object'
  or octet_length(coalesce(target_payload, '{}'::jsonb)::text) > 65536
  or target_priority is null
  or target_priority not between -100 and 100
  or target_max_attempts is null
  or target_max_attempts not between 1 and 10 then
    raise exception 'Processing job input is invalid';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      target_organization_id::text || ':' || target_type || ':' || target_deduplication_key,
      0
    )
  );

  select * into existing_job
  from public.processing_jobs
  where organization_id = target_organization_id
    and type = target_type
    and deduplication_key = target_deduplication_key
  for update;

  if found then
    if existing_job.request_hash <> target_request_hash then
      raise exception 'Deduplication key already used with another request';
    end if;
    return existing_job.id;
  end if;

  insert into public.processing_jobs (
    id, organization_id, type, status, entity_type, entity_id, payload,
    deduplication_key, request_hash, priority, max_attempts, created_by
  ) values (
    target_job_id, target_organization_id, target_type, 'queued',
    nullif(trim(coalesce(target_entity_type, '')), ''), target_entity_id,
    coalesce(target_payload, '{}'::jsonb),
    trim(target_deduplication_key), target_request_hash, target_priority,
    target_max_attempts, target_created_by
  );

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, target_created_by, 'processing_job', target_job_id,
    'processing_job_enqueued',
    jsonb_build_object('type', target_type, 'priority', target_priority)
  );

  return target_job_id;
end;
$$;

create or replace function private.cancel_processing_job(
  target_organization_id uuid,
  target_job_id uuid,
  target_reason text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs%rowtype;
  next_status text;
begin
  if not public.can_manage_org_settings(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  if char_length(trim(coalesce(target_reason, ''))) not between 1 and 300 then
    raise exception 'Cancellation reason is invalid';
  end if;

  select * into target_job
  from public.processing_jobs
  where organization_id = target_organization_id and id = target_job_id
  for update;

  if not found then
    raise exception 'Processing job was not found';
  end if;
  if target_job.status = 'succeeded' then
    raise exception 'Completed processing job cannot be cancelled';
  end if;
  if target_job.status = 'cancelled' then
    return 'cancelled';
  end if;

  next_status := case when target_job.status = 'processing' then 'processing' else 'cancelled' end;

  update public.processing_jobs
  set status = next_status,
      cancel_requested_at = timezone('utc', now()),
      cancelled_by = auth.uid(),
      cancellation_reason = trim(target_reason),
      user_message = case
        when next_status = 'processing' then 'Avbrott har begärts och slutförs säkert.'
        else 'Processen avbröts.'
      end,
      finished_at = case
        when next_status = 'cancelled' then timezone('utc', now())
        else finished_at
      end
  where organization_id = target_organization_id and id = target_job_id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'processing_job', target_job_id,
    'processing_job_cancellation_requested', jsonb_build_object('status', next_status)
  );

  return next_status;
end;
$$;

create or replace function private.retry_processing_job(
  target_organization_id uuid,
  target_job_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs%rowtype;
begin
  if not public.can_manage_org_settings(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  select * into target_job
  from public.processing_jobs
  where organization_id = target_organization_id and id = target_job_id
  for update;

  if not found then
    raise exception 'Processing job was not found';
  end if;
  if target_job.status <> 'failed' or target_job.attempt_count >= 10 then
    raise exception 'Processing job cannot be retried';
  end if;

  update public.processing_jobs
  set status = 'queued',
      available_at = timezone('utc', now()),
      max_attempts = greatest(max_attempts, attempt_count + 1),
      error_message = null,
      user_message = null,
      last_error_code = null,
      finished_at = null,
      lease_owner = null,
      lease_expires_at = null,
      heartbeat_at = null,
      cancel_requested_at = null,
      cancelled_by = null,
      cancellation_reason = null
  where organization_id = target_organization_id and id = target_job_id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'processing_job', target_job_id,
    'processing_job_retried', jsonb_build_object('attemptCount', target_job.attempt_count)
  );
end;
$$;

create or replace function public.enqueue_processing_job(
  target_organization_id uuid,
  target_created_by uuid,
  target_type text,
  target_entity_type text,
  target_entity_id uuid,
  target_payload jsonb,
  target_deduplication_key text,
  target_request_hash text,
  target_priority integer default 0,
  target_max_attempts integer default 3
)
returns uuid
language sql
set search_path = ''
as $$
  select private.enqueue_processing_job(
    target_organization_id, target_created_by, target_type, target_entity_type, target_entity_id,
    target_payload, target_deduplication_key, target_request_hash,
    target_priority, target_max_attempts
  )
$$;

create or replace function public.cancel_processing_job(
  target_organization_id uuid,
  target_job_id uuid,
  target_reason text
)
returns text
language sql
set search_path = ''
as $$
  select private.cancel_processing_job(
    target_organization_id, target_job_id, target_reason
  )
$$;

create or replace function public.retry_processing_job(
  target_organization_id uuid,
  target_job_id uuid
)
returns void
language sql
set search_path = ''
as $$
  select private.retry_processing_job(target_organization_id, target_job_id)
$$;

create or replace function private.reap_processing_jobs()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer;
  total_affected integer := 0;
begin
  with changed_jobs as (
    update public.processing_jobs
    set status = 'cancelled',
        finished_at = timezone('utc', now()),
        user_message = 'Processen avbröts.',
        lease_owner = null,
        lease_expires_at = null,
        heartbeat_at = null
    where status = 'processing'
      and lease_expires_at < timezone('utc', now())
      and cancel_requested_at is not null
    returning organization_id, id, type, attempt_count
  )
  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  )
  select organization_id, null, 'processing_job', id,
    'processing_job_cancelled_after_lease',
    jsonb_build_object('type', type, 'attemptCount', attempt_count)
  from changed_jobs;
  get diagnostics affected = row_count;
  total_affected := total_affected + affected;

  with changed_jobs as (
    update public.processing_jobs
    set status = 'failed',
        finished_at = timezone('utc', now()),
        last_error_code = 'lease_expired',
        error_message = 'Worker lease expired after maximum attempts.',
        user_message = 'Processen avbröts efter flera försök och behöver kontrolleras.',
        lease_owner = null,
        lease_expires_at = null,
        heartbeat_at = null
    where status = 'processing'
      and lease_expires_at < timezone('utc', now())
      and attempt_count >= max_attempts
    returning organization_id, id, type, attempt_count
  )
  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  )
  select organization_id, null, 'processing_job', id,
    'processing_job_lease_exhausted',
    jsonb_build_object('type', type, 'attemptCount', attempt_count)
  from changed_jobs;
  get diagnostics affected = row_count;
  total_affected := total_affected + affected;

  with changed_jobs as (
    update public.processing_jobs
    set status = 'queued',
        available_at = timezone('utc', now()) + make_interval(
          secs => least(3600, 30 * power(2, least(greatest(attempt_count - 1, 0), 7)))::integer
        ),
        last_error_code = 'lease_expired',
        error_message = 'Worker lease expired before completion.',
        user_message = 'Processen återupptas automatiskt efter ett tillfälligt avbrott.',
        lease_owner = null,
        lease_expires_at = null,
        heartbeat_at = null
    where status = 'processing'
      and lease_expires_at < timezone('utc', now())
      and attempt_count < max_attempts
    returning organization_id, id, type, attempt_count
  )
  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  )
  select organization_id, null, 'processing_job', id,
    'processing_job_requeued_after_lease',
    jsonb_build_object('type', type, 'attemptCount', attempt_count)
  from changed_jobs;
  get diagnostics affected = row_count;
  total_affected := total_affected + affected;

  return total_affected;
end;
$$;

create or replace function private.claim_processing_job(
  target_worker_id text,
  target_supported_types text[],
  target_lease_seconds integer default 60
)
returns public.processing_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs%rowtype;
begin
  if char_length(trim(coalesce(target_worker_id, ''))) not between 8 and 120
  or target_supported_types is null
  or coalesce(array_length(target_supported_types, 1), 0) = 0
  or target_lease_seconds is null
  or target_lease_seconds not between 15 and 900 then
    raise exception 'Worker claim input is invalid';
  end if;

  perform private.reap_processing_jobs();

  select * into target_job
  from public.processing_jobs
  where status = 'queued'
    and available_at <= timezone('utc', now())
    and type = any(target_supported_types)
    and attempt_count < max_attempts
    and cancel_requested_at is null
  order by priority desc, available_at, created_at
  for update skip locked
  limit 1;

  if not found then
    return null;
  end if;

  update public.processing_jobs
  set status = 'processing',
      attempt_count = attempt_count + 1,
      started_at = coalesce(started_at, timezone('utc', now())),
      finished_at = null,
      lease_owner = trim(target_worker_id),
      lease_expires_at = timezone('utc', now()) + make_interval(secs => target_lease_seconds),
      heartbeat_at = timezone('utc', now()),
      user_message = 'Processen bearbetas.'
  where id = target_job.id
  returning * into target_job;

  return target_job;
end;
$$;

create or replace function private.heartbeat_processing_job(
  target_job_id uuid,
  target_worker_id text,
  target_lease_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if char_length(trim(coalesce(target_worker_id, ''))) not between 8 and 120
  or target_lease_seconds is null
  or target_lease_seconds not between 15 and 900 then
    raise exception 'Worker lease is invalid';
  end if;

  update public.processing_jobs
  set lease_expires_at = timezone('utc', now()) + make_interval(secs => target_lease_seconds),
      heartbeat_at = timezone('utc', now())
  where id = target_job_id
    and status = 'processing'
    and lease_owner = target_worker_id
    and lease_expires_at >= timezone('utc', now())
    and cancel_requested_at is null;

  return found;
end;
$$;

create or replace function private.complete_processing_job(
  target_job_id uuid,
  target_worker_id text,
  target_status text,
  target_result jsonb default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs%rowtype;
  next_status text;
begin
  if char_length(trim(coalesce(target_worker_id, ''))) not between 8 and 120
  or target_status is null
  or target_status not in ('succeeded', 'needs_review') then
    raise exception 'Completion status is invalid';
  end if;

  select * into target_job
  from public.processing_jobs
  where id = target_job_id
  for update;

  if not found
  or target_job.status <> 'processing'
  or target_job.lease_owner <> target_worker_id
  or target_job.lease_expires_at < timezone('utc', now()) then
    raise exception 'Processing job lease is no longer valid';
  end if;

  next_status := case
    when target_job.cancel_requested_at is not null then 'cancelled'
    else target_status
  end;

  update public.processing_jobs
  set status = next_status,
      result = case when next_status = 'cancelled' then null else target_result end,
      user_message = case
        when next_status = 'cancelled' then 'Processen avbröts.'
        when next_status = 'needs_review' then 'Resultatet är klart för granskning.'
        else 'Processen slutfördes.'
      end,
      finished_at = timezone('utc', now()),
      lease_owner = null,
      lease_expires_at = null,
      heartbeat_at = null
  where id = target_job_id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_job.organization_id, null, 'processing_job', target_job_id,
    case
      when next_status = 'cancelled' then 'processing_job_cancelled'
      else 'processing_job_completed'
    end,
    jsonb_build_object('type', target_job.type, 'status', next_status, 'attemptCount', target_job.attempt_count)
  );

  return next_status;
end;
$$;

create or replace function private.fail_processing_job(
  target_job_id uuid,
  target_worker_id text,
  target_error_code text,
  target_error_message text,
  target_user_message text,
  target_retryable boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_job public.processing_jobs%rowtype;
  next_status text;
begin
  if char_length(trim(coalesce(target_worker_id, ''))) not between 8 and 120
  or char_length(trim(coalesce(target_error_code, ''))) not between 1 and 80
  or char_length(coalesce(target_error_message, '')) not between 1 and 2000
  or char_length(coalesce(target_user_message, '')) > 300
  or target_retryable is null then
    raise exception 'Processing failure input is invalid';
  end if;

  select * into target_job
  from public.processing_jobs
  where id = target_job_id
  for update;

  if not found
  or target_job.status <> 'processing'
  or target_job.lease_owner <> target_worker_id
  or target_job.lease_expires_at < timezone('utc', now()) then
    raise exception 'Processing job lease is no longer valid';
  end if;

  next_status := case
    when target_job.cancel_requested_at is not null then 'cancelled'
    when target_retryable and target_job.attempt_count < target_job.max_attempts then 'queued'
    else 'failed'
  end;

  update public.processing_jobs
  set status = next_status,
      available_at = case
        when next_status = 'queued' then timezone('utc', now()) + make_interval(
          secs => least(3600, 30 * power(2, least(greatest(attempt_count - 1, 0), 7)))::integer
        )
        else available_at
      end,
      last_error_code = trim(target_error_code),
      error_message = target_error_message,
      user_message = case
        when next_status = 'cancelled' then 'Processen avbröts.'
        when nullif(trim(coalesce(target_user_message, '')), '') is not null then trim(target_user_message)
        when next_status = 'queued' then 'Ett tillfälligt problem uppstod. Processen försöker igen automatiskt.'
        else 'Processen kunde inte slutföras och behöver kontrolleras.'
      end,
      finished_at = case when next_status in ('failed', 'cancelled') then timezone('utc', now()) else null end,
      lease_owner = null,
      lease_expires_at = null,
      heartbeat_at = null
  where id = target_job_id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_job.organization_id, null, 'processing_job', target_job_id,
    case
      when next_status = 'cancelled' then 'processing_job_cancelled'
      else 'processing_job_failed'
    end,
    jsonb_build_object(
      'type', target_job.type,
      'status', next_status,
      'errorCode', trim(target_error_code),
      'attemptCount', target_job.attempt_count
    )
  );

  return next_status;
end;
$$;

revoke all on function private.enqueue_processing_job(uuid, uuid, text, text, uuid, jsonb, text, text, integer, integer) from public, anon, authenticated;
revoke all on function private.cancel_processing_job(uuid, uuid, text) from public, anon, authenticated;
revoke all on function private.retry_processing_job(uuid, uuid) from public, anon, authenticated;
revoke all on function private.reap_processing_jobs() from public, anon, authenticated;
revoke all on function private.claim_processing_job(text, text[], integer) from public, anon, authenticated;
revoke all on function private.heartbeat_processing_job(uuid, text, integer) from public, anon, authenticated;
revoke all on function private.complete_processing_job(uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function private.fail_processing_job(uuid, text, text, text, text, boolean) from public, anon, authenticated;

grant execute on function private.enqueue_processing_job(uuid, uuid, text, text, uuid, jsonb, text, text, integer, integer) to service_role;
grant execute on function private.cancel_processing_job(uuid, uuid, text) to authenticated;
grant execute on function private.retry_processing_job(uuid, uuid) to authenticated;
grant execute on function private.reap_processing_jobs() to service_role;
grant execute on function private.claim_processing_job(text, text[], integer) to service_role;
grant execute on function private.heartbeat_processing_job(uuid, text, integer) to service_role;
grant execute on function private.complete_processing_job(uuid, text, text, jsonb) to service_role;
grant execute on function private.fail_processing_job(uuid, text, text, text, text, boolean) to service_role;

revoke all on function public.enqueue_processing_job(uuid, uuid, text, text, uuid, jsonb, text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.cancel_processing_job(uuid, uuid, text) from public, anon;
revoke all on function public.retry_processing_job(uuid, uuid) from public, anon;
grant execute on function public.enqueue_processing_job(uuid, uuid, text, text, uuid, jsonb, text, text, integer, integer) to service_role;
grant execute on function public.cancel_processing_job(uuid, uuid, text) to authenticated;
grant execute on function public.retry_processing_job(uuid, uuid) to authenticated;
