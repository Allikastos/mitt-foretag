-- Generated from supabase/phase-c.sql; review before any database use.
-- Phase C accounting workflow for Altura Nova Hub.
-- Apply only after hub.sql, phase-b.sql and accounting.sql have been reviewed.
-- This proposal has not been executed against any Supabase environment.

alter table public.business_events
  add column if not exists client_request_key text,
  add column if not exists request_hash text;

alter table public.bookkeeping_drafts
  add column if not exists approved_by uuid references auth.users(id) on delete set null,
  add column if not exists approved_at timestamptz;

create unique index if not exists business_events_org_request_key_idx
  on public.business_events (organization_id, client_request_key)
  where client_request_key is not null;

create or replace function public.initialize_accounting_mvp(
  target_organization_id uuid,
  target_fiscal_year_start date,
  target_fiscal_year_end date
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_fiscal_year_id uuid;
  existing_fiscal_year public.fiscal_years%rowtype;
begin
  if not public.can_manage_org_settings(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  if target_fiscal_year_start <> make_date(extract(year from target_fiscal_year_start)::integer, 1, 1)
     or target_fiscal_year_end <> make_date(extract(year from target_fiscal_year_start)::integer, 12, 31) then
    raise exception 'The accounting MVP only supports calendar fiscal years';
  end if;

  insert into public.company_accounting_settings (
    organization_id, company_form, accounting_method, reporting_currency,
    vat_registered, vat_period, fiscal_year_start_month, accounting_enabled,
    updated_at
  ) values (
    target_organization_id, 'sole_trader', 'cash_basis', 'SEK',
    true, 'quarterly', 1, true, timezone('utc', now())
  )
  on conflict (organization_id) do update set
    company_form = excluded.company_form,
    accounting_method = excluded.accounting_method,
    reporting_currency = excluded.reporting_currency,
    fiscal_year_start_month = excluded.fiscal_year_start_month,
    accounting_enabled = excluded.accounting_enabled,
    updated_at = timezone('utc', now());

  insert into public.accounting_accounts (
    organization_id, account_number, name, kind, source, review_required
  ) values
    (target_organization_id, '1930', 'Företagskonto', 'asset', 'altura_mvp_2026', true),
    (target_organization_id, '1940', 'Övriga bankkonton', 'asset', 'altura_mvp_2026', true),
    (target_organization_id, '2013', 'Övriga egna uttag', 'equity', 'altura_mvp_2026', true),
    (target_organization_id, '2018', 'Övriga egna insättningar', 'equity', 'altura_mvp_2026', true),
    (target_organization_id, '2611', 'Utgående moms 25%', 'liability', 'altura_mvp_2026', true),
    (target_organization_id, '2641', 'Ingående moms', 'asset', 'altura_mvp_2026', true),
    (target_organization_id, '3041', 'Försäljning tjänster, 25% moms', 'income', 'altura_mvp_2026', true),
    (target_organization_id, '3044', 'Försäljning tjänster, momsfri', 'income', 'altura_mvp_2026', true),
    (target_organization_id, '5460', 'Förbrukningsmaterial', 'expense', 'altura_mvp_2026', true),
    (target_organization_id, '6992', 'Övriga externa kostnader, ej avdragsgilla', 'expense', 'altura_mvp_2026', true)
  on conflict (organization_id, account_number) do nothing;

  insert into public.fiscal_years (
    organization_id, starts_on, ends_on, status
  ) values (
    target_organization_id, target_fiscal_year_start, target_fiscal_year_end, 'open'
  )
  on conflict (organization_id, starts_on) do nothing;

  select * into existing_fiscal_year
  from public.fiscal_years
  where organization_id = target_organization_id
    and starts_on = target_fiscal_year_start
  for update;

  if not found or existing_fiscal_year.ends_on <> target_fiscal_year_end then
    raise exception 'An incompatible fiscal year already exists';
  end if;

  target_fiscal_year_id := existing_fiscal_year.id;

  insert into public.accounting_periods (
    organization_id, fiscal_year_id, starts_on, ends_on, status
  )
  select
    target_organization_id,
    target_fiscal_year_id,
    month_start::date,
    (month_start + interval '1 month - 1 day')::date,
    'open'
  from generate_series(
    target_fiscal_year_start::timestamp,
    target_fiscal_year_end::timestamp,
    interval '1 month'
  ) as month_start
  on conflict (organization_id, fiscal_year_id, starts_on) do nothing;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id,
    auth.uid(),
    'fiscal_year',
    target_fiscal_year_id,
    'accounting_initialized',
    jsonb_build_object(
      'startsOn', target_fiscal_year_start,
      'endsOn', target_fiscal_year_end,
      'scope', 'sole_trader_cash_basis_sek'
    )
  );

  return target_fiscal_year_id;
end;
$$;

create or replace function public.save_bookkeeping_draft(
  target_organization_id uuid,
  target_client_request_key text,
  target_event_type text,
  target_happened_on date,
  target_amount_minor bigint,
  target_description text,
  target_facts jsonb,
  target_posting_rule_id text,
  target_posting_rule_version integer,
  target_lines jsonb,
  target_warnings text[] default '{}'
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
      and company_form = 'sole_trader'
      and accounting_method = 'cash_basis'
      and reporting_currency = 'SEK'
  ) then
    raise exception 'Accounting configuration is not supported or enabled';
  end if;

  if target_event_type not in (
    'paid_domestic_service_sale_25_vat',
    'paid_domestic_service_sale_no_vat',
    'paid_domestic_purchase_25_vat',
    'purchase_without_deductible_vat',
    'owner_deposit',
    'owner_withdrawal',
    'transfer_between_own_accounts'
  ) then
    raise exception 'Unsupported business event type';
  end if;

  if target_client_request_key is null
     or target_happened_on is null
     or target_amount_minor is null
     or target_description is null
     or target_posting_rule_id is null
     or target_posting_rule_version is null
     or target_lines is null
     or char_length(trim(target_client_request_key)) not between 8 and 200
     or target_amount_minor <= 0
     or char_length(trim(target_description)) not between 1 and 500
     or target_posting_rule_version <= 0
     or char_length(trim(target_posting_rule_id)) = 0 then
    raise exception 'Bookkeeping draft input is invalid';
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

  if jsonb_typeof(target_lines) <> 'array' or jsonb_array_length(target_lines) < 2 then
    raise exception 'A bookkeeping draft needs at least two lines';
  end if;

  if exists (
    select 1 from jsonb_array_elements(target_lines) line
    where coalesce(line->>'side', '') not in ('debit', 'credit')
      or coalesce(line->>'accountNumber', '') !~ '^[0-9]{4}$'
      or coalesce(line->>'amountMinor', '') !~ '^[0-9]+$'
      or (line->>'amountMinor')::bigint <= 0
  ) then
    raise exception 'Bookkeeping draft contains an invalid line';
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
    raise exception 'Bookkeeping draft references an unavailable account';
  end if;

  select
    coalesce(sum(case when line->>'side' = 'debit' then (line->>'amountMinor')::bigint else 0 end), 0),
    coalesce(sum(case when line->>'side' = 'credit' then (line->>'amountMinor')::bigint else 0 end), 0)
  into debit_total, credit_total
  from jsonb_array_elements(target_lines) line;

  if debit_total <> credit_total then
    raise exception 'Debit and credit do not balance';
  end if;

  calculated_request_hash := md5(concat_ws('|',
    target_event_type,
    target_happened_on::text,
    target_amount_minor::text,
    trim(target_description),
    coalesce(target_facts, '{}'::jsonb)::text,
    target_posting_rule_id,
    target_posting_rule_version::text,
    target_lines::text
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
    currency, facts, source_entity_type, source_entity_id, created_by,
    client_request_key, request_hash
  ) values (
    target_event_id, target_organization_id, target_event_type, 'needs_review',
    target_happened_on, target_amount_minor, 'SEK',
    coalesce(target_facts, '{}'::jsonb),
    case when coalesce(target_facts->>'sourceDocumentId', '') ~* '^[0-9a-f-]{36}$'
      then 'source_document' else null end,
    case when coalesce(target_facts->>'sourceDocumentId', '') ~* '^[0-9a-f-]{36}$'
      then (target_facts->>'sourceDocumentId')::uuid else null end,
    auth.uid(),
    trim(target_client_request_key), calculated_request_hash
  );

  insert into public.bookkeeping_drafts (
    id, organization_id, business_event_id, status, posting_rule_id,
    posting_rule_version, explanation, lines_json, warnings, created_by
  ) values (
    target_draft_id, target_organization_id, target_event_id, 'needs_review',
    trim(target_posting_rule_id), target_posting_rule_version,
    trim(target_description), target_lines, coalesce(target_warnings, '{}'), auth.uid()
  );

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'bookkeeping_draft', target_draft_id,
    'bookkeeping_draft_created',
    jsonb_build_object('businessEventId', target_event_id, 'ruleId', target_posting_rule_id)
  );

  return target_draft_id;
end;
$$;

create or replace function public.approve_bookkeeping_draft(
  target_organization_id uuid,
  target_draft_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_draft public.bookkeeping_drafts%rowtype;
  target_event public.business_events%rowtype;
begin
  if not public.can_manage_org_settings(target_organization_id) then
    raise exception 'Not authorized for organization';
  end if;

  select * into target_draft
  from public.bookkeeping_drafts
  where organization_id = target_organization_id and id = target_draft_id
  for update;

  if not found then
    raise exception 'Bookkeeping draft was not found';
  end if;

  if target_draft.status = 'ready_to_post' then
    return;
  end if;

  if target_draft.status <> 'needs_review' then
    raise exception 'Only drafts that need review can be approved';
  end if;

  select * into target_event
  from public.business_events
  where organization_id = target_organization_id
    and id = target_draft.business_event_id
  for update;

  if not found or target_event.happened_on is null then
    raise exception 'Business event is incomplete';
  end if;

  if not exists (
    select 1
    from public.fiscal_years fiscal_year
    join public.accounting_periods period
      on period.organization_id = fiscal_year.organization_id
     and period.fiscal_year_id = fiscal_year.id
    where fiscal_year.organization_id = target_organization_id
      and target_event.happened_on between fiscal_year.starts_on and fiscal_year.ends_on
      and target_event.happened_on between period.starts_on and period.ends_on
      and fiscal_year.status = 'open'
      and period.status = 'open'
  ) then
    raise exception 'The accounting period is no longer open';
  end if;

  update public.bookkeeping_drafts
  set status = 'ready_to_post', approved_by = auth.uid(),
      approved_at = timezone('utc', now()), updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_draft_id;

  update public.business_events
  set status = 'ready_to_post', updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_event.id;

  insert into public.audit_events (
    organization_id, user_id, entity_type, entity_id, action, metadata
  ) values (
    target_organization_id, auth.uid(), 'bookkeeping_draft', target_draft_id,
    'bookkeeping_draft_approved',
    jsonb_build_object('businessEventId', target_event.id)
  );
end;
$$;

-- Direct writes would bypass the validated workflow. Authenticated users read
-- through RLS, while all state transitions go through the functions above and
-- post_bookkeeping_draft from accounting.sql.
revoke insert, update, delete on public.business_events from anon, authenticated;
revoke insert, update, delete on public.bookkeeping_drafts from anon, authenticated;
revoke insert, update, delete on public.journal_series_counters from anon, authenticated;
revoke insert, update, delete on public.journal_entries from anon, authenticated;
revoke insert, update, delete on public.journal_lines from anon, authenticated;
revoke insert, update, delete on public.audit_events from anon, authenticated;

grant select on public.company_accounting_settings to authenticated;
grant select on public.accounting_accounts to authenticated;
grant select on public.fiscal_years to authenticated;
grant select on public.accounting_periods to authenticated;
grant select on public.business_events to authenticated;
grant select on public.bookkeeping_drafts to authenticated;
grant select on public.journal_entries to authenticated;
grant select on public.journal_lines to authenticated;

revoke all on function public.initialize_accounting_mvp(uuid, date, date) from public;
revoke all on function public.save_bookkeeping_draft(uuid, text, text, date, bigint, text, jsonb, text, integer, jsonb, text[]) from public;
revoke all on function public.approve_bookkeeping_draft(uuid, uuid) from public;
grant execute on function public.initialize_accounting_mvp(uuid, date, date) to authenticated;
grant execute on function public.save_bookkeeping_draft(uuid, text, text, date, bigint, text, jsonb, text, integer, jsonb, text[]) to authenticated;
grant execute on function public.approve_bookkeeping_draft(uuid, uuid) to authenticated;
