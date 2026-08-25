-- Safe special journal drafts and irreversible period locking.

alter table public.business_events drop constraint if exists business_events_event_type_check;
alter table public.business_events add constraint business_events_event_type_check check (
  event_type in (
    'paid_domestic_service_sale_25_vat', 'paid_domestic_service_sale_no_vat',
    'paid_domestic_purchase_25_vat', 'purchase_without_deductible_vat',
    'owner_deposit', 'owner_withdrawal', 'transfer_between_own_accounts',
    'manual_journal_entry', 'opening_balance', 'correction_entry'
  )
);

create or replace function public.save_special_bookkeeping_draft(
  target_organization_id uuid,
  target_client_request_key text,
  target_happened_on date,
  target_amount_minor bigint,
  target_description text,
  target_lines jsonb,
  target_note text,
  target_event_type text,
  target_original_journal_entry_id uuid default null,
  target_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  draft_id uuid;
  event_id uuid;
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;
  if target_event_type not in ('opening_balance', 'correction_entry') then
    raise exception 'Unsupported special journal type';
  end if;
  if target_event_type = 'opening_balance' and not exists (
    select 1 from public.fiscal_years
    where organization_id = target_organization_id
      and starts_on = target_happened_on and status = 'open'
  ) then
    raise exception 'Opening balance must use the first day of an open fiscal year';
  end if;
  if target_event_type = 'opening_balance' and exists (
    select 1 from public.business_events
    where organization_id = target_organization_id
      and event_type = 'opening_balance' and happened_on = target_happened_on
  ) then
    raise exception 'An opening balance already exists for the fiscal year';
  end if;
  if target_event_type = 'correction_entry' and (
    target_original_journal_entry_id is null
    or char_length(trim(coalesce(target_reason, ''))) not between 1 and 500
    or not exists (
      select 1 from public.journal_entries
      where organization_id = target_organization_id and id = target_original_journal_entry_id
    )
  ) then
    raise exception 'Correction reference or reason is invalid';
  end if;

  draft_id := public.save_manual_bookkeeping_draft(
    target_organization_id, target_client_request_key, target_happened_on,
    target_amount_minor, target_description, target_lines, target_note
  );
  select business_event_id into event_id from public.bookkeeping_drafts
  where organization_id = target_organization_id and id = draft_id;

  update public.business_events set
    event_type = target_event_type,
    facts = facts || jsonb_strip_nulls(jsonb_build_object(
      'originalJournalEntryId', target_original_journal_entry_id,
      'correctionReason', nullif(trim(coalesce(target_reason, '')), '')
    )),
    updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = event_id;
  return draft_id;
end;
$$;

create or replace function public.link_posted_correction()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  event_record public.business_events%rowtype;
  original_id uuid;
begin
  select * into event_record from public.business_events
  where organization_id = new.organization_id and id = new.business_event_id;
  if found and event_record.event_type = 'correction_entry' then
    original_id := nullif(event_record.facts->>'originalJournalEntryId', '')::uuid;
    insert into public.correction_links (
      organization_id, original_journal_entry_id, correction_journal_entry_id,
      reason, created_by
    ) values (
      new.organization_id, original_id, new.id,
      event_record.facts->>'correctionReason', auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists link_posted_correction_trigger on public.journal_entries;
create trigger link_posted_correction_trigger
  after insert on public.journal_entries
  for each row execute function public.link_posted_correction();

create or replace function public.lock_accounting_period(
  target_organization_id uuid,
  target_period_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_period public.accounting_periods%rowtype;
begin
  if not public.can_manage_org_settings(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;
  select * into target_period from public.accounting_periods
  where organization_id = target_organization_id and id = target_period_id for update;
  if not found then raise exception 'Accounting period was not found'; end if;
  if target_period.status = 'locked' then return; end if;
  if target_period.status <> 'open' then raise exception 'Accounting period cannot be locked'; end if;
  if exists (
    select 1 from public.bookkeeping_drafts draft
    join public.business_events event on event.organization_id = draft.organization_id
      and event.id = draft.business_event_id
    where draft.organization_id = target_organization_id
      and draft.status in ('needs_review', 'ready_to_post')
      and event.happened_on between target_period.starts_on and target_period.ends_on
  ) then
    raise exception 'Accounting period has unresolved drafts';
  end if;
  update public.accounting_periods set status = 'locked', updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_period_id;
  insert into public.audit_events (organization_id, user_id, entity_type, entity_id, action, metadata)
  values (target_organization_id, auth.uid(), 'accounting_period', target_period_id,
    'accounting_period_locked', jsonb_build_object('startsOn', target_period.starts_on, 'endsOn', target_period.ends_on));
end;
$$;

revoke all on function public.save_special_bookkeeping_draft(uuid, text, date, bigint, text, jsonb, text, text, uuid, text) from public, anon, authenticated;
revoke all on function public.lock_accounting_period(uuid, uuid) from public, anon, authenticated;
grant execute on function public.save_special_bookkeeping_draft(uuid, text, date, bigint, text, jsonb, text, text, uuid, text) to authenticated;
grant execute on function public.lock_accounting_period(uuid, uuid) to authenticated;
