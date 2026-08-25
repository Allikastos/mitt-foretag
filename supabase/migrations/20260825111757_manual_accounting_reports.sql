-- Manual bookkeeping and account-catalog activation for the Hub.
-- Additive except for widening the existing event-type check constraint.

alter table public.business_events
  drop constraint if exists business_events_event_type_check;

alter table public.business_events
  add constraint business_events_event_type_check check (event_type in (
    'paid_domestic_service_sale_25_vat',
    'paid_domestic_service_sale_no_vat',
    'paid_domestic_purchase_25_vat',
    'purchase_without_deductible_vat',
    'owner_deposit',
    'owner_withdrawal',
    'transfer_between_own_accounts',
    'manual_journal_entry'
  ));

create or replace function public.activate_accounting_account(
  target_organization_id uuid,
  target_account_number text,
  target_name text,
  target_kind text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_account_id uuid;
begin
  if not public.can_manage_org_settings(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  if target_account_number !~ '^[0-9]{4}$'
     or char_length(trim(target_name)) not between 2 and 120
     or target_kind not in ('asset', 'liability', 'equity', 'income', 'expense') then
    raise exception 'Account input is invalid';
  end if;

  insert into public.accounting_accounts (
    organization_id, account_number, name, kind, is_active, source,
    review_required, updated_at
  ) values (
    target_organization_id, target_account_number, trim(target_name),
    target_kind, true, 'hub_account_catalog', true, timezone('utc', now())
  )
  on conflict (organization_id, account_number) do update set
    is_active = true,
    updated_at = timezone('utc', now())
  returning id into target_account_id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'accounting_account', target_account_id,
    'accounting_account_activated',
    jsonb_build_object('accountNumber', target_account_number, 'source', 'hub_account_catalog')
  );

  return target_account_id;
end;
$$;

create or replace function public.save_manual_bookkeeping_draft(
  target_organization_id uuid,
  target_client_request_key text,
  target_happened_on date,
  target_amount_minor bigint,
  target_description text,
  target_lines jsonb,
  target_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_event_id uuid := gen_random_uuid();
  target_draft_id uuid := gen_random_uuid();
  calculated_request_hash text;
  existing_event public.business_events%rowtype;
  existing_draft_id uuid;
  debit_total bigint;
  credit_total bigint;
begin
  if not public.can_manage_org_data(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  if not exists (
    select 1 from public.company_accounting_settings
    where organization_id = target_organization_id
      and accounting_enabled
      and reporting_currency = 'SEK'
  ) then
    raise exception 'Accounting is not enabled for organization';
  end if;

  if target_client_request_key is null
     or char_length(trim(target_client_request_key)) not between 8 and 200
     or target_happened_on is null
     or target_amount_minor is null or target_amount_minor <= 0
     or char_length(trim(target_description)) not between 1 and 500
     or char_length(coalesce(target_note, '')) > 500
     or jsonb_typeof(target_lines) <> 'array'
     or jsonb_array_length(target_lines) not between 2 and 50 then
    raise exception 'Manual bookkeeping input is invalid';
  end if;

  if not exists (
    select 1
    from public.fiscal_years fiscal_year
    join public.accounting_periods period
      on period.organization_id = fiscal_year.organization_id
     and period.fiscal_year_id = fiscal_year.id
    where fiscal_year.organization_id = target_organization_id
      and target_happened_on between fiscal_year.starts_on and fiscal_year.ends_on
      and target_happened_on between period.starts_on and period.ends_on
      and fiscal_year.status = 'open'
      and period.status = 'open'
  ) then
    raise exception 'No open fiscal year and period covers the event date';
  end if;

  if exists (
    select 1 from jsonb_array_elements(target_lines) line
    where coalesce(line->>'side', '') not in ('debit', 'credit')
      or coalesce(line->>'accountNumber', '') !~ '^[0-9]{4}$'
      or coalesce(line->>'amountMinor', '') !~ '^[0-9]+$'
      or (line->>'amountMinor')::bigint <= 0
      or char_length(coalesce(line->>'description', '')) > 200
  ) then
    raise exception 'Manual bookkeeping contains an invalid line';
  end if;

  if exists (
    select 1 from jsonb_array_elements(target_lines) line
    where not exists (
      select 1 from public.accounting_accounts account
      where account.organization_id = target_organization_id
        and account.account_number = line->>'accountNumber'
        and account.is_active
    )
  ) then
    raise exception 'Manual bookkeeping references an unavailable account';
  end if;

  select
    coalesce(sum(case when line->>'side' = 'debit' then (line->>'amountMinor')::bigint else 0 end), 0),
    coalesce(sum(case when line->>'side' = 'credit' then (line->>'amountMinor')::bigint else 0 end), 0)
  into debit_total, credit_total
  from jsonb_array_elements(target_lines) line;

  if debit_total <> credit_total or debit_total <> target_amount_minor then
    raise exception 'Debit and credit do not balance';
  end if;

  calculated_request_hash := md5(concat_ws('|',
    target_happened_on::text,
    target_amount_minor::text,
    trim(target_description),
    target_lines::text,
    coalesce(trim(target_note), '')
  ));

  perform pg_advisory_xact_lock(
    hashtextextended(target_organization_id::text || ':' || trim(target_client_request_key), 0)
  );

  select * into existing_event
  from public.business_events
  where organization_id = target_organization_id
    and client_request_key = trim(target_client_request_key);

  if found then
    if existing_event.request_hash <> calculated_request_hash then
      raise exception 'The request key has already been used for different bookkeeping data';
    end if;
    select id into existing_draft_id
    from public.bookkeeping_drafts
    where organization_id = target_organization_id
      and business_event_id = existing_event.id;
    if existing_draft_id is null then
      raise exception 'The existing bookkeeping request is incomplete';
    end if;
    return existing_draft_id;
  end if;

  insert into public.business_events (
    id, organization_id, event_type, status, happened_on, amount_minor,
    currency, facts, created_by, client_request_key, request_hash
  ) values (
    target_event_id, target_organization_id, 'manual_journal_entry',
    'needs_review', target_happened_on, target_amount_minor, 'SEK',
    jsonb_build_object(
      'description', trim(target_description),
      'note', nullif(trim(coalesce(target_note, '')), ''),
      'entryMode', 'manual'
    ),
    auth.uid(), trim(target_client_request_key), calculated_request_hash
  );

  insert into public.bookkeeping_drafts (
    id, organization_id, business_event_id, status, posting_rule_id,
    posting_rule_version, explanation, lines_json, warnings, created_by
  ) values (
    target_draft_id, target_organization_id, target_event_id, 'needs_review',
    'manual_journal_entry', 1, trim(target_description), target_lines,
    array['Manuell kontering måste granskas före bokföring.'], auth.uid()
  );

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'bookkeeping_draft', target_draft_id,
    'manual_bookkeeping_draft_created',
    jsonb_build_object('businessEventId', target_event_id, 'lineCount', jsonb_array_length(target_lines))
  );

  return target_draft_id;
end;
$$;

revoke all on function public.activate_accounting_account(uuid, text, text, text)
  from public, anon, authenticated;
grant execute on function public.activate_accounting_account(uuid, text, text, text)
  to authenticated;

revoke all on function public.save_manual_bookkeeping_draft(uuid, text, date, bigint, text, jsonb, text)
  from public, anon, authenticated;
grant execute on function public.save_manual_bookkeeping_draft(uuid, text, date, bigint, text, jsonb, text)
  to authenticated;
