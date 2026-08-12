-- Phase D manual document review workflow for Altura Nova Hub.
-- Apply only after hub.sql, phase-b.sql, accounting.sql and phase-c.sql.
-- This proposal has not been executed against any Supabase environment.

create table if not exists public.document_facts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_document_id uuid not null,
  document_kind text not null check (document_kind in ('receipt', 'supplier_invoice')),
  review_status text not null default 'ready_for_review'
    check (review_status in ('incomplete', 'ready_for_review', 'linked')),
  extraction_method text not null default 'manual'
    check (extraction_method in ('manual', 'ocr')),
  ocr_status text not null default 'not_requested'
    check (ocr_status in ('not_requested', 'pending', 'processing', 'completed', 'failed')),
  ocr_provider text,
  supplier_name text not null check (char_length(trim(supplier_name)) between 1 and 200),
  supplier_org_number text,
  document_number text,
  document_date date not null,
  payment_date date not null,
  total_minor bigint not null check (total_minor > 0),
  vat_minor bigint not null default 0 check (vat_minor >= 0 and vat_minor <= total_minor),
  currency text not null default 'SEK' check (currency = 'SEK'),
  description text not null check (char_length(trim(description)) between 1 and 500),
  suggested_event_type text not null check (suggested_event_type in (
    'paid_domestic_purchase_25_vat',
    'purchase_without_deductible_vat'
  )),
  payment_account text not null default '1930' check (payment_account ~ '^[0-9]{4}$'),
  revision integer not null default 1 check (revision > 0),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, source_document_id),
  unique (organization_id, id),
  check (payment_date >= document_date),
  check (
    extraction_method = 'manual'
    or (extraction_method = 'ocr' and ocr_provider is not null)
  ),
  constraint document_facts_org_source_document_fk
    foreign key (organization_id, source_document_id)
    references public.source_documents (organization_id, id)
    on delete restrict
);

create index if not exists document_facts_org_review_idx
  on public.document_facts (organization_id, review_status, updated_at desc);
create index if not exists document_facts_org_ocr_idx
  on public.document_facts (organization_id, ocr_status, updated_at desc);

create or replace function public.prevent_retention_unlock()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.retention_locked and not new.retention_locked then
    raise exception 'Retained original documents cannot be unlocked';
  end if;

  if old.retention_locked and (
    new.file_name is distinct from old.file_name
    or new.file_path is distinct from old.file_path
    or new.mime_type is distinct from old.mime_type
    or new.size_bytes is distinct from old.size_bytes
    or new.sha256 is distinct from old.sha256
    or new.original_storage_key is distinct from old.original_storage_key
    or new.document_type is distinct from old.document_type
    or new.uploaded_by is distinct from old.uploaded_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Retained original document evidence is immutable';
  end if;
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'documents_retention_lock_is_one_way' and not tgisinternal
  ) then
    create trigger documents_retention_lock_is_one_way
      before update on public.documents
      for each row execute function public.prevent_retention_unlock();
  end if;
end
$$;

alter table public.document_facts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'document_facts'
      and policyname = 'Members can read document facts'
  ) then
    create policy "Members can read document facts"
      on public.document_facts for select to authenticated
      using (public.is_org_member(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Retained hub documents cannot be replaced'
  ) then
    create policy "Retained hub documents cannot be replaced"
      on storage.objects as restrictive for update to authenticated
      using (
        bucket_id <> 'hub-documents'
        or not exists (
          select 1 from public.documents document
          where document.organization_id = public.storage_object_org_id(name)
            and document.file_path = name
            and document.retention_locked
        )
      )
      with check (
        bucket_id <> 'hub-documents'
        or not exists (
          select 1 from public.documents document
          where document.organization_id = public.storage_object_org_id(name)
            and document.file_path = name
            and document.retention_locked
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Retained hub documents cannot be deleted'
  ) then
    create policy "Retained hub documents cannot be deleted"
      on storage.objects as restrictive for delete to authenticated
      using (
        bucket_id <> 'hub-documents'
        or not exists (
          select 1 from public.documents document
          where document.organization_id = public.storage_object_org_id(name)
            and document.file_path = name
            and document.retention_locked
        )
      );
  end if;
end
$$;

grant select on public.source_documents to authenticated;
grant select on public.document_facts to authenticated;

-- Source records, facts and original-retention state are only changed through
-- tenant-checked functions. This prevents forged links and review states.
revoke insert, update, delete on public.source_documents from anon, authenticated;
revoke insert, update, delete on public.document_facts from anon, authenticated;

create or replace function public.save_document_facts(
  target_organization_id uuid,
  target_document_id uuid,
  target_document_kind text,
  target_supplier_name text,
  target_supplier_org_number text,
  target_document_number text,
  target_document_date date,
  target_payment_date date,
  target_total_minor bigint,
  target_vat_minor bigint,
  target_description text,
  target_suggested_event_type text,
  target_payment_account text default '1930'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_source_document public.source_documents%rowtype;
  target_facts public.document_facts%rowtype;
  expected_vat_minor bigint;
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(target_organization_id::text || ':' || target_document_id::text, 0)
  );

  if not exists (
    select 1 from public.documents
    where organization_id = target_organization_id and id = target_document_id
  ) then
    raise exception 'Document was not found in organization';
  end if;

  if target_document_kind not in ('receipt', 'supplier_invoice')
     or target_suggested_event_type not in (
       'paid_domestic_purchase_25_vat',
       'purchase_without_deductible_vat'
     )
     or char_length(trim(coalesce(target_supplier_name, ''))) not between 1 and 200
     or char_length(trim(coalesce(target_description, ''))) not between 1 and 500
     or target_document_date is null
     or target_payment_date is null
     or target_payment_date < target_document_date
     or target_total_minor is null
     or target_total_minor <= 0
     or target_vat_minor is null
     or target_vat_minor < 0
     or target_vat_minor > target_total_minor
     or target_payment_account !~ '^[0-9]{4}$' then
    raise exception 'Document facts are invalid';
  end if;

  if target_suggested_event_type = 'paid_domestic_purchase_25_vat' then
    expected_vat_minor := target_total_minor - round(target_total_minor * 10000.0 / 12500.0)::bigint;
    if target_vat_minor <> expected_vat_minor then
      raise exception 'VAT amount does not match 25 percent VAT included in total';
    end if;
  elsif target_vat_minor <> 0 then
    raise exception 'VAT must be zero when no VAT deduction is suggested';
  end if;

  select * into target_source_document
  from public.source_documents
  where organization_id = target_organization_id
    and document_id = target_document_id
  for update;

  if not found then
    insert into public.source_documents (
      organization_id, document_id, processing_status, created_by
    ) values (
      target_organization_id, target_document_id, 'needs_information', auth.uid()
    )
    returning * into target_source_document;
  end if;

  if target_source_document.business_event_id is not null then
    raise exception 'Linked document facts are locked';
  end if;

  insert into public.document_facts (
    organization_id, source_document_id, document_kind, review_status,
    extraction_method, ocr_status, supplier_name, supplier_org_number,
    document_number, document_date, payment_date, total_minor, vat_minor,
    currency, description, suggested_event_type, payment_account,
    created_by, updated_by
  ) values (
    target_organization_id, target_source_document.id, target_document_kind,
    'ready_for_review', 'manual', 'not_requested', trim(target_supplier_name),
    nullif(trim(coalesce(target_supplier_org_number, '')), ''),
    nullif(trim(coalesce(target_document_number, '')), ''),
    target_document_date, target_payment_date, target_total_minor,
    target_vat_minor, 'SEK', trim(target_description),
    target_suggested_event_type, target_payment_account, auth.uid(), auth.uid()
  )
  on conflict (organization_id, source_document_id) do update set
    document_kind = excluded.document_kind,
    review_status = 'ready_for_review',
    extraction_method = 'manual',
    ocr_status = 'not_requested',
    ocr_provider = null,
    supplier_name = excluded.supplier_name,
    supplier_org_number = excluded.supplier_org_number,
    document_number = excluded.document_number,
    document_date = excluded.document_date,
    payment_date = excluded.payment_date,
    total_minor = excluded.total_minor,
    vat_minor = excluded.vat_minor,
    currency = 'SEK',
    description = excluded.description,
    suggested_event_type = excluded.suggested_event_type,
    payment_account = excluded.payment_account,
    revision = public.document_facts.revision + 1,
    updated_by = auth.uid(),
    updated_at = timezone('utc', now())
  returning * into target_facts;

  update public.source_documents
  set processing_status = 'ready', updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_source_document.id;

  update public.documents
  set retention_locked = true,
      processing_status = 'ready',
      updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_document_id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'document_facts', target_facts.id,
    'document_facts_saved',
    jsonb_build_object(
      'documentId', target_document_id,
      'sourceDocumentId', target_source_document.id,
      'revision', target_facts.revision,
      'extractionMethod', 'manual'
    )
  );

  return target_facts.id;
end;
$$;

create or replace function public.link_source_document_to_draft(
  target_organization_id uuid,
  target_document_id uuid,
  target_draft_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_source_document public.source_documents%rowtype;
  target_draft public.bookkeeping_drafts%rowtype;
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  select * into target_source_document
  from public.source_documents
  where organization_id = target_organization_id
    and document_id = target_document_id
  for update;

  if not found then
    raise exception 'Source document was not found';
  end if;

  select * into target_draft
  from public.bookkeeping_drafts
  where organization_id = target_organization_id and id = target_draft_id
  for update;

  if not found or target_draft.status <> 'needs_review' then
    raise exception 'Bookkeeping draft cannot be linked';
  end if;

  if target_source_document.business_event_id is not null then
    if target_source_document.business_event_id = target_draft.business_event_id then
      return;
    end if;
    raise exception 'Source document is already linked';
  end if;

  if not exists (
    select 1 from public.document_facts
    where organization_id = target_organization_id
      and source_document_id = target_source_document.id
      and review_status = 'ready_for_review'
      and extraction_method = 'manual'
  ) then
    raise exception 'Document facts are not ready for review';
  end if;

  if not exists (
    select 1 from public.business_events
    where organization_id = target_organization_id
      and id = target_draft.business_event_id
      and source_entity_type = 'source_document'
      and source_entity_id = target_source_document.id
  ) then
    raise exception 'Draft does not reference this source document';
  end if;

  update public.source_documents
  set business_event_id = target_draft.business_event_id,
      processing_status = 'linked',
      updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_source_document.id;

  update public.document_facts
  set review_status = 'linked', updated_by = auth.uid(),
      updated_at = timezone('utc', now())
  where organization_id = target_organization_id
    and source_document_id = target_source_document.id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'source_document', target_source_document.id,
    'source_document_linked',
    jsonb_build_object(
      'documentId', target_document_id,
      'bookkeepingDraftId', target_draft_id,
      'businessEventId', target_draft.business_event_id
    )
  );
end;
$$;

revoke all on function public.save_document_facts(uuid, uuid, text, text, text, text, date, date, bigint, bigint, text, text, text) from public;
revoke all on function public.link_source_document_to_draft(uuid, uuid, uuid) from public;
grant execute on function public.save_document_facts(uuid, uuid, text, text, text, text, date, date, bigint, bigint, text, text, text) to authenticated;
grant execute on function public.link_source_document_to_draft(uuid, uuid, uuid) to authenticated;
