-- Generated from supabase/phase-b.sql; review before any database use.
-- Additive Phase B hardening for the existing hub schema.
-- Apply only after supabase/hub.sql has been reviewed and installed.
-- This proposal has not been executed against any Supabase environment.

create table if not exists public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  operation text not null check (operation in (
    'create_invoice',
    'finalize_invoice',
    'record_payment',
    'post_journal_entry',
    'upload_document',
    'start_document_processing',
    'send_email'
  )),
  key text not null check (char_length(key) between 8 and 200),
  request_hash text not null,
  status text not null default 'started' check (status in ('started', 'succeeded', 'failed')),
  result_entity_type text,
  result_entity_id uuid,
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, operation, key),
  unique (organization_id, id)
);

create table if not exists public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  type text not null check (type in (
    'document_processing',
    'invoice_generation',
    'sie_export',
    'report_generation',
    'email_delivery',
    'bank_import',
    'follow_up_digest'
  )),
  status text not null default 'queued' check (status in (
    'queued',
    'processing',
    'needs_review',
    'succeeded',
    'failed',
    'cancelled'
  )),
  entity_type text,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  idempotency_key_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id),
  constraint processing_jobs_org_idempotency_fk
    foreign key (organization_id, idempotency_key_id)
    references public.idempotency_keys (organization_id, id)
    on delete set null
);

alter table public.documents
  add column if not exists sha256 text,
  add column if not exists document_type text not null default 'original',
  add column if not exists processing_status text not null default 'not_required',
  add column if not exists original_storage_key text,
  add column if not exists retention_locked boolean not null default false,
  add column if not exists idempotency_key text;

alter table public.invoices
  add column if not exists pdf_status text not null default 'not_started',
  add column if not exists pdf_error text,
  add column if not exists pdf_storage_key text,
  add column if not exists finalization_idempotency_key text,
  add column if not exists finalization_started_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'documents_document_type_check'
  ) then
    alter table public.documents add constraint documents_document_type_check
      check (document_type in ('original', 'invoice_pdf', 'generated')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'documents_processing_status_check'
  ) then
    alter table public.documents add constraint documents_processing_status_check
      check (processing_status in ('pending', 'ready', 'failed', 'not_required')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'invoices_pdf_status_check'
  ) then
    alter table public.invoices add constraint invoices_pdf_status_check
      check (pdf_status in ('not_started', 'processing', 'ready', 'failed')) not valid;
  end if;
end
$$;

create unique index if not exists documents_org_sha256_idx
  on public.documents (organization_id, sha256)
  where sha256 is not null;
create unique index if not exists documents_org_file_path_idx
  on public.documents (organization_id, file_path);
create unique index if not exists documents_org_idempotency_idx
  on public.documents (organization_id, idempotency_key)
  where idempotency_key is not null;
create unique index if not exists invoices_org_finalization_key_idx
  on public.invoices (organization_id, finalization_idempotency_key)
  where finalization_idempotency_key is not null;
create index if not exists idempotency_keys_org_operation_idx
  on public.idempotency_keys (organization_id, operation, created_at desc);
create index if not exists processing_jobs_org_status_idx
  on public.processing_jobs (organization_id, status, created_at desc);
create index if not exists invoices_org_pdf_status_idx
  on public.invoices (organization_id, pdf_status, updated_at desc);
create unique index if not exists contacts_org_id_idx
  on public.contacts (organization_id, id);
create unique index if not exists tasks_org_id_idx
  on public.tasks (organization_id, id);
create unique index if not exists invoice_lines_org_id_idx
  on public.invoice_lines (organization_id, id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contacts_org_customer_fk'
  ) then
    alter table public.contacts
      add constraint contacts_org_customer_fk
      foreign key (organization_id, customer_id)
      references public.customers (organization_id, id)
      on delete cascade;
  end if;
end
$$;

alter table public.idempotency_keys enable row level security;
alter table public.processing_jobs enable row level security;

-- Keep employee customer scope enforceable below the UI layer. These helpers
-- run with the function owner's RLS bypass, but expose only a boolean decision.
create or replace function public.can_access_customer(
  target_organization_id uuid,
  target_customer_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organization_members membership
    join public.organizations organization
      on organization.id = membership.organization_id
    join public.customers customer
      on customer.organization_id = membership.organization_id
     and customer.id = target_customer_id
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and (
        membership.role in ('owner', 'admin')
        or (
          customer.visibility = 'organization'
          and (
            organization.employee_customer_scope = 'all_customers'
            or customer.owner_user_id = auth.uid()
            or customer.created_by = auth.uid()
          )
        )
      )
  )
$$;

create or replace function public.can_access_invoice(
  target_organization_id uuid,
  target_invoice_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.invoices invoice
    where invoice.organization_id = target_organization_id
      and invoice.id = target_invoice_id
      and (
        invoice.customer_id is null
        or public.can_access_customer(target_organization_id, invoice.customer_id)
      )
  )
  and public.is_org_member(target_organization_id)
$$;

create or replace function public.can_write_customer(
  target_organization_id uuid,
  target_visibility text,
  target_owner_user_id uuid,
  target_created_by uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organization_members membership
    join public.organizations organization
      on organization.id = membership.organization_id
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and (
        membership.role in ('owner', 'admin')
        or (
          membership.role = 'member'
          and target_visibility = 'organization'
          and (
            organization.employee_customer_scope = 'all_customers'
            or target_owner_user_id = auth.uid()
            or target_created_by = auth.uid()
          )
        )
      )
  )
$$;

revoke all on function public.can_access_customer(uuid, uuid) from public;
revoke all on function public.can_access_invoice(uuid, uuid) from public;
revoke all on function public.can_write_customer(uuid, text, uuid, uuid) from public;
grant execute on function public.can_access_customer(uuid, uuid) to authenticated;
grant execute on function public.can_access_invoice(uuid, uuid) to authenticated;
grant execute on function public.can_write_customer(uuid, text, uuid, uuid) to authenticated;

alter policy "Members can read customers" on public.customers
  using (public.can_access_customer(organization_id, id));
alter policy "Members can manage customers" on public.customers
  using (
    public.can_write_customer(
      organization_id, visibility, owner_user_id, created_by
    )
  )
  with check (
    public.can_write_customer(
      organization_id, visibility, owner_user_id, created_by
    )
  );

alter policy "Members can read contacts" on public.contacts
  using (public.can_access_customer(organization_id, customer_id));
alter policy "Members can manage contacts" on public.contacts
  using (
    public.can_manage_org_data(organization_id)
    and public.can_access_customer(organization_id, customer_id)
  )
  with check (
    public.can_manage_org_data(organization_id)
    and public.can_access_customer(organization_id, customer_id)
  );

alter policy "Members can read tasks" on public.tasks
  using (
    public.is_org_member(organization_id)
    and (
      customer_id is null
      or public.can_access_customer(organization_id, customer_id)
    )
  );
alter policy "Members can manage tasks" on public.tasks
  using (
    public.can_manage_org_data(organization_id)
    and (
      customer_id is null
      or public.can_access_customer(organization_id, customer_id)
    )
  )
  with check (
    public.can_manage_org_data(organization_id)
    and (
      customer_id is null
      or public.can_access_customer(organization_id, customer_id)
    )
  );

alter policy "Members can read documents" on public.documents
  using (
    public.is_org_member(organization_id)
    and (
      customer_id is null
      or public.can_access_customer(organization_id, customer_id)
    )
  );
alter policy "Members can manage documents" on public.documents
  using (
    public.can_manage_org_data(organization_id)
    and (
      customer_id is null
      or public.can_access_customer(organization_id, customer_id)
    )
  )
  with check (
    public.can_manage_org_data(organization_id)
    and (
      customer_id is null
      or public.can_access_customer(organization_id, customer_id)
    )
  );

alter policy "Members can read invoices" on public.invoices
  using (public.can_access_invoice(organization_id, id));
alter policy "Members can manage invoices" on public.invoices
  using (
    public.can_manage_org_data(organization_id)
    and public.can_access_invoice(organization_id, id)
  )
  with check (
    public.can_manage_org_data(organization_id)
    and (
      customer_id is null
      or public.can_access_customer(organization_id, customer_id)
    )
  );

alter policy "Members can read invoice lines" on public.invoice_lines
  using (public.can_access_invoice(organization_id, invoice_id));
alter policy "Members can manage invoice lines" on public.invoice_lines
  using (
    public.can_manage_org_data(organization_id)
    and public.can_access_invoice(organization_id, invoice_id)
  )
  with check (
    public.can_manage_org_data(organization_id)
    and public.can_access_invoice(organization_id, invoice_id)
  );

alter policy "Hub members can view documents bucket" on storage.objects
  using (
    bucket_id = 'hub-documents'
    and exists (
      select 1
      from public.documents document
      where document.organization_id = public.storage_object_org_id(name)
        and document.file_path = name
        and (
          document.customer_id is null
          or public.can_access_customer(document.organization_id, document.customer_id)
        )
    )
  );
alter policy "Hub members can update documents bucket" on storage.objects
  using (
    bucket_id = 'hub-documents'
    and public.can_manage_org_data(public.storage_object_org_id(name))
    and exists (
      select 1 from public.documents document
      where document.organization_id = public.storage_object_org_id(name)
        and document.file_path = name
        and (
          document.customer_id is null
          or public.can_access_customer(document.organization_id, document.customer_id)
        )
    )
  )
  with check (
    bucket_id = 'hub-documents'
    and public.can_manage_org_data(public.storage_object_org_id(name))
    and exists (
      select 1 from public.documents document
      where document.organization_id = public.storage_object_org_id(name)
        and document.file_path = name
        and (
          document.customer_id is null
          or public.can_access_customer(document.organization_id, document.customer_id)
        )
    )
  );
alter policy "Hub members can delete documents bucket" on storage.objects
  using (
    bucket_id = 'hub-documents'
    and public.can_manage_org_data(public.storage_object_org_id(name))
    and exists (
      select 1 from public.documents document
      where document.organization_id = public.storage_object_org_id(name)
        and document.file_path = name
        and (
          document.customer_id is null
          or public.can_access_customer(document.organization_id, document.customer_id)
        )
    )
  );

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'idempotency_keys'
      and policyname = 'Members can read idempotency keys'
  ) then
    create policy "Members can read idempotency keys"
      on public.idempotency_keys for select to authenticated
      using (public.is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'processing_jobs'
      and policyname = 'Members can read processing jobs'
  ) then
    create policy "Members can read processing jobs"
      on public.processing_jobs for select to authenticated
      using (public.is_org_member(organization_id));
  end if;
end
$$;

create or replace function public.begin_hub_idempotent_operation(
  target_organization_id uuid,
  target_operation text,
  target_key text,
  target_request_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing_key public.idempotency_keys%rowtype;
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  if char_length(trim(target_key)) not between 8 and 200 then
    raise exception 'Invalid idempotency key';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(target_organization_id::text || ':' || target_operation || ':' || target_key, 0)
  );

  select * into existing_key
  from public.idempotency_keys
  where organization_id = target_organization_id
    and operation = target_operation
    and key = target_key
  for update;

  if found then
    if existing_key.request_hash <> target_request_hash then
      raise exception 'Idempotency key already used with another request';
    end if;

    if existing_key.status = 'succeeded' then
      return jsonb_build_object(
        'outcome', 'replay',
        'resultEntityType', existing_key.result_entity_type,
        'resultEntityId', existing_key.result_entity_id
      );
    end if;

    if existing_key.status = 'started' then
      return jsonb_build_object('outcome', 'in_progress');
    end if;

    update public.idempotency_keys
    set status = 'started', error_message = null, updated_at = timezone('utc', now())
    where id = existing_key.id;

    return jsonb_build_object('outcome', 'retry');
  end if;

  insert into public.idempotency_keys (
    organization_id,
    operation,
    key,
    request_hash,
    created_by
  ) values (
    target_organization_id,
    target_operation,
    trim(target_key),
    target_request_hash,
    auth.uid()
  );

  return jsonb_build_object('outcome', 'start');
end;
$$;

create or replace function public.complete_hub_idempotent_operation(
  target_organization_id uuid,
  target_operation text,
  target_key text,
  target_result_entity_type text,
  target_result_entity_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing_key public.idempotency_keys%rowtype;
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  select * into existing_key
  from public.idempotency_keys
  where organization_id = target_organization_id
    and operation = target_operation
    and key = target_key
  for update;

  if not found then
    raise exception 'Idempotent operation was not started';
  end if;

  if existing_key.status = 'succeeded' then
    if existing_key.result_entity_type is distinct from target_result_entity_type
       or existing_key.result_entity_id is distinct from target_result_entity_id then
      raise exception 'Idempotent result cannot be replaced';
    end if;
    return;
  end if;

  if existing_key.status <> 'started' then
    raise exception 'Idempotent operation is not active';
  end if;

  update public.idempotency_keys
  set status = 'succeeded',
      result_entity_type = target_result_entity_type,
      result_entity_id = target_result_entity_id,
      error_message = null,
      updated_at = timezone('utc', now())
  where organization_id = target_organization_id
    and operation = target_operation
    and key = target_key
    and status = 'started';
end;
$$;

create or replace function public.fail_hub_idempotent_operation(
  target_organization_id uuid,
  target_operation text,
  target_key text,
  target_error_message text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  update public.idempotency_keys
  set status = 'failed',
      error_message = left(target_error_message, 1000),
      updated_at = timezone('utc', now())
  where organization_id = target_organization_id
    and operation = target_operation
    and key = target_key
    and status = 'started';
end;
$$;

create or replace function public.begin_invoice_finalization(
  target_organization_id uuid,
  target_invoice_id uuid,
  target_idempotency_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  operation_result jsonb;
  target_invoice public.invoices%rowtype;
  claimed_number text;
begin
  operation_result := public.begin_hub_idempotent_operation(
    target_organization_id,
    'finalize_invoice',
    target_idempotency_key,
    target_invoice_id::text
  );

  select * into target_invoice
  from public.invoices
  where organization_id = target_organization_id and id = target_invoice_id
  for update;

  if not found then
    raise exception 'Invoice not found in organization';
  end if;

  if operation_result->>'outcome' in ('replay', 'in_progress') then
    return operation_result || jsonb_build_object(
      'invoiceNumber', target_invoice.invoice_number,
      'pdfStatus', target_invoice.pdf_status,
      'documentId', target_invoice.pdf_document_id
    );
  end if;

  if target_invoice.status <> 'draft' or target_invoice.locked_at is not null then
    raise exception 'Invoice is not editable';
  end if;

  if target_invoice.customer_id is null or not exists (
    select 1 from public.customers
    where organization_id = target_organization_id
      and id = target_invoice.customer_id
  ) then
    raise exception 'Invoice customer not found in organization';
  end if;

  if target_invoice.finalization_idempotency_key is not null
     and target_invoice.finalization_idempotency_key <> target_idempotency_key then
    raise exception 'Invoice finalization already has another idempotency key';
  end if;

  claimed_number := coalesce(
    target_invoice.invoice_number,
    public.claim_next_invoice_number(target_organization_id)
  );

  update public.invoices invoice
  set invoice_number = claimed_number,
      customer_name_snapshot = customer.company_name,
      customer_address_snapshot = customer.address,
      customer_email_snapshot = customer.email,
      finalization_idempotency_key = target_idempotency_key,
      finalization_started_at = timezone('utc', now()),
      pdf_status = 'processing',
      pdf_error = null,
      pdf_storage_key = target_organization_id::text || '/invoices/' ||
        target_invoice_id::text || '/' || claimed_number || '.pdf'
  from public.customers customer
  where invoice.organization_id = target_organization_id
    and invoice.id = target_invoice_id
    and customer.organization_id = target_organization_id
    and customer.id = target_invoice.customer_id;

  return jsonb_build_object(
    'outcome', operation_result->>'outcome',
    'invoiceNumber', claimed_number,
    'pdfStatus', 'processing',
    'storageKey', target_organization_id::text || '/invoices/' ||
      target_invoice_id::text || '/' || claimed_number || '.pdf'
  );
end;
$$;

create or replace function public.complete_invoice_finalization(
  target_organization_id uuid,
  target_invoice_id uuid,
  target_idempotency_key text,
  target_document_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  completed_at timestamptz := timezone('utc', now());
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  if not exists (
    select 1 from public.documents
    where organization_id = target_organization_id
      and id = target_document_id
      and invoice_id = target_invoice_id
  ) then
    raise exception 'Invoice document not found in organization';
  end if;

  update public.invoices
  set status = 'sent',
      pdf_status = 'ready',
      pdf_error = null,
      pdf_document_id = target_document_id,
      finalized_at = completed_at,
      sent_at = completed_at,
      locked_at = completed_at
  where organization_id = target_organization_id
    and id = target_invoice_id
    and status = 'draft'
    and pdf_status = 'processing'
    and finalization_idempotency_key = target_idempotency_key;

  if not found then
    raise exception 'Invoice finalization is not in progress';
  end if;

  perform public.complete_hub_idempotent_operation(
    target_organization_id,
    'finalize_invoice',
    target_idempotency_key,
    'document',
    target_document_id
  );
end;
$$;

create or replace function public.fail_invoice_finalization(
  target_organization_id uuid,
  target_invoice_id uuid,
  target_idempotency_key text,
  target_error_message text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  update public.invoices
  set pdf_status = 'failed', pdf_error = left(target_error_message, 1000)
  where organization_id = target_organization_id
    and id = target_invoice_id
    and status = 'draft'
    and finalization_idempotency_key = target_idempotency_key;

  perform public.fail_hub_idempotent_operation(
    target_organization_id,
    'finalize_invoice',
    target_idempotency_key,
    target_error_message
  );
end;
$$;

revoke all on function public.begin_hub_idempotent_operation(uuid, text, text, text) from public;
revoke all on function public.complete_hub_idempotent_operation(uuid, text, text, text, uuid) from public;
revoke all on function public.fail_hub_idempotent_operation(uuid, text, text, text) from public;
revoke all on function public.begin_invoice_finalization(uuid, uuid, text) from public;
revoke all on function public.complete_invoice_finalization(uuid, uuid, text, uuid) from public;
revoke all on function public.fail_invoice_finalization(uuid, uuid, text, text) from public;

grant execute on function public.begin_hub_idempotent_operation(uuid, text, text, text) to authenticated;
grant execute on function public.complete_hub_idempotent_operation(uuid, text, text, text, uuid) to authenticated;
grant execute on function public.fail_hub_idempotent_operation(uuid, text, text, text) to authenticated;
grant execute on function public.begin_invoice_finalization(uuid, uuid, text) to authenticated;
grant execute on function public.complete_invoice_finalization(uuid, uuid, text, uuid) to authenticated;
grant execute on function public.fail_invoice_finalization(uuid, uuid, text, text) to authenticated;
