-- Additive accounting foundation for Altura Nova Hub.
-- Review before applying. Install hub.sql, then phase-b.sql, then this file.
-- Move these reviewed files into timestamped Supabase migrations before launch.

create table if not exists public.company_accounting_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  company_form text not null default 'sole_trader'
    check (company_form in ('sole_trader', 'limited_company')),
  accounting_method text not null default 'cash_basis'
    check (accounting_method in ('cash_basis', 'accrual')),
  reporting_currency text not null default 'SEK',
  vat_registered boolean not null default true,
  vat_period text not null default 'quarterly'
    check (vat_period in ('monthly', 'quarterly', 'yearly')),
  fiscal_year_start_month integer not null default 1
    check (fiscal_year_start_month between 1 and 12),
  accounting_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    not accounting_enabled or (
      company_form = 'sole_trader'
      and accounting_method = 'cash_basis'
      and reporting_currency = 'SEK'
    )
  )
);

create table if not exists public.accounting_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  account_number text not null check (account_number ~ '^[0-9]{4}$'),
  name text not null,
  kind text not null check (kind in ('asset', 'liability', 'equity', 'income', 'expense')),
  is_active boolean not null default true,
  source text not null default 'manual',
  review_required boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, account_number),
  unique (organization_id, id)
);

create table if not exists public.fiscal_years (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'open' check (status in ('open', 'review', 'locked')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, starts_on),
  unique (organization_id, id),
  check (starts_on <= ends_on)
);

create table if not exists public.accounting_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fiscal_year_id uuid not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'open' check (status in ('open', 'review', 'locked')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, fiscal_year_id, starts_on),
  unique (organization_id, id),
  check (starts_on <= ends_on),
  constraint accounting_periods_org_fiscal_year_fk
    foreign key (organization_id, fiscal_year_id)
    references public.fiscal_years (organization_id, id)
    on delete cascade
);

create table if not exists public.vat_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  rate_basis_points integer not null default 0 check (rate_basis_points >= 0),
  direction text not null check (direction in ('input', 'output', 'none')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, code),
  unique (organization_id, id)
);

-- Posting rules are global, versioned reference data. Company-owned rows below
-- always carry organization_id and use composite foreign keys.
create table if not exists public.posting_rules (
  id uuid primary key default gen_random_uuid(),
  stable_rule_id text not null,
  version integer not null check (version > 0),
  description text not null,
  company_form text not null check (company_form = 'sole_trader'),
  accounting_method text not null check (accounting_method = 'cash_basis'),
  event_type text not null,
  rule_json jsonb not null default '{}'::jsonb,
  source_refs text[] not null default '{}',
  review_status text not null default 'needs_review'
    check (review_status in ('needs_review', 'reviewed', 'retired')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (stable_rule_id, version)
);

create table if not exists public.business_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null check (event_type in (
    'paid_domestic_service_sale_25_vat',
    'paid_domestic_service_sale_no_vat',
    'paid_domestic_purchase_25_vat',
    'purchase_without_deductible_vat',
    'owner_deposit',
    'owner_withdrawal',
    'transfer_between_own_accounts'
  )),
  status text not null default 'incomplete'
    check (status in ('incomplete', 'needs_review', 'ready_to_post', 'posted', 'rejected')),
  happened_on date,
  amount_minor bigint check (amount_minor > 0),
  currency text not null default 'SEK' check (currency = 'SEK'),
  facts jsonb not null default '{}'::jsonb,
  source_entity_type text,
  source_entity_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  posted_journal_entry_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id)
);

create table if not exists public.bookkeeping_drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_event_id uuid not null,
  status text not null default 'needs_review'
    check (status in ('incomplete', 'needs_review', 'ready_to_post', 'posted', 'rejected')),
  posting_rule_id text,
  posting_rule_version integer check (posting_rule_version > 0),
  explanation text,
  lines_json jsonb not null default '[]'::jsonb,
  warnings text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id),
  constraint bookkeeping_drafts_org_event_fk
    foreign key (organization_id, business_event_id)
    references public.business_events (organization_id, id)
    on delete cascade
);

-- File metadata and hashes live in public.documents. This table adds only the
-- accounting lifecycle, avoiding a second copy of file metadata.
create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid not null,
  business_event_id uuid,
  processing_status text not null default 'uploaded'
    check (processing_status in ('uploaded', 'processing', 'needs_information', 'ready', 'linked', 'failed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, document_id),
  unique (organization_id, id),
  constraint source_documents_org_document_fk
    foreign key (organization_id, document_id)
    references public.documents (organization_id, id)
    on delete restrict,
  constraint source_documents_org_event_fk
    foreign key (organization_id, business_event_id)
    references public.business_events (organization_id, id)
    on delete restrict
);

create table if not exists public.journal_series_counters (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fiscal_year_id uuid not null,
  journal_series text not null default 'A',
  next_number integer not null default 1 check (next_number > 0),
  primary key (organization_id, fiscal_year_id, journal_series),
  constraint journal_counters_org_fiscal_year_fk
    foreign key (organization_id, fiscal_year_id)
    references public.fiscal_years (organization_id, id)
    on delete cascade
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fiscal_year_id uuid not null,
  accounting_period_id uuid not null,
  business_event_id uuid not null,
  source_document_id uuid,
  idempotency_key_id uuid not null,
  journal_series text not null default 'A',
  journal_number integer not null check (journal_number > 0),
  posted_on date not null,
  description text not null,
  posting_rule_id text not null,
  posting_rule_version integer not null check (posting_rule_version > 0),
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, journal_series, journal_number),
  unique (organization_id, business_event_id),
  unique (organization_id, idempotency_key_id),
  unique (organization_id, id),
  constraint journal_entries_org_fiscal_year_fk
    foreign key (organization_id, fiscal_year_id)
    references public.fiscal_years (organization_id, id)
    on delete restrict,
  constraint journal_entries_org_period_fk
    foreign key (organization_id, accounting_period_id)
    references public.accounting_periods (organization_id, id)
    on delete restrict,
  constraint journal_entries_org_event_fk
    foreign key (organization_id, business_event_id)
    references public.business_events (organization_id, id)
    on delete restrict,
  constraint journal_entries_org_source_document_fk
    foreign key (organization_id, source_document_id)
    references public.source_documents (organization_id, id)
    on delete restrict,
  constraint journal_entries_org_idempotency_fk
    foreign key (organization_id, idempotency_key_id)
    references public.idempotency_keys (organization_id, id)
    on delete restrict
);

create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  journal_entry_id uuid not null,
  account_id uuid,
  account_number text not null check (account_number ~ '^[0-9]{4}$'),
  debit_minor bigint not null default 0 check (debit_minor >= 0),
  credit_minor bigint not null default 0 check (credit_minor >= 0),
  vat_code_id uuid,
  description text,
  customer_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id),
  check (
    (debit_minor > 0 and credit_minor = 0)
    or (credit_minor > 0 and debit_minor = 0)
  ),
  constraint journal_lines_org_entry_fk
    foreign key (organization_id, journal_entry_id)
    references public.journal_entries (organization_id, id)
    on delete restrict,
  constraint journal_lines_org_account_fk
    foreign key (organization_id, account_id)
    references public.accounting_accounts (organization_id, id)
    on delete restrict,
  constraint journal_lines_org_vat_code_fk
    foreign key (organization_id, vat_code_id)
    references public.vat_codes (organization_id, id)
    on delete restrict,
  constraint journal_lines_org_customer_fk
    foreign key (organization_id, customer_id)
    references public.customers (organization_id, id)
    on delete restrict
);

create table if not exists public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  account_label text not null,
  booked_on date not null,
  amount_minor bigint not null,
  currency text not null default 'SEK' check (currency = 'SEK'),
  description text,
  counterparty_name text,
  external_id text,
  imported_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, account_label, external_id),
  unique (organization_id, id)
);

create table if not exists public.reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  bank_transaction_id uuid not null,
  business_event_id uuid,
  journal_entry_id uuid,
  status text not null default 'needs_review'
    check (status in ('needs_review', 'accepted', 'rejected')),
  confidence text not null default 'yellow'
    check (confidence in ('green', 'yellow', 'red')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id),
  constraint reconciliation_org_bank_transaction_fk
    foreign key (organization_id, bank_transaction_id)
    references public.bank_transactions (organization_id, id)
    on delete cascade,
  constraint reconciliation_org_event_fk
    foreign key (organization_id, business_event_id)
    references public.business_events (organization_id, id)
    on delete restrict,
  constraint reconciliation_org_journal_entry_fk
    foreign key (organization_id, journal_entry_id)
    references public.journal_entries (organization_id, id)
    on delete restrict
);

create table if not exists public.correction_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  original_journal_entry_id uuid not null,
  correction_journal_entry_id uuid not null,
  reason text not null check (char_length(trim(reason)) > 0),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, original_journal_entry_id, correction_journal_entry_id),
  unique (organization_id, correction_journal_entry_id),
  unique (organization_id, id),
  check (original_journal_entry_id <> correction_journal_entry_id),
  constraint correction_links_org_original_fk
    foreign key (organization_id, original_journal_entry_id)
    references public.journal_entries (organization_id, id)
    on delete restrict,
  constraint correction_links_org_correction_fk
    foreign key (organization_id, correction_journal_entry_id)
    references public.journal_entries (organization_id, id)
    on delete restrict
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, id)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'business_events_org_posted_journal_fk'
  ) then
    alter table public.business_events
      add constraint business_events_org_posted_journal_fk
      foreign key (organization_id, posted_journal_entry_id)
      references public.journal_entries (organization_id, id)
      on delete restrict;
  end if;
end
$$;

create index if not exists accounting_accounts_org_active_idx
  on public.accounting_accounts (organization_id, is_active, account_number);
create index if not exists fiscal_years_org_status_idx
  on public.fiscal_years (organization_id, status, starts_on);
create index if not exists accounting_periods_org_status_idx
  on public.accounting_periods (organization_id, status, starts_on);
create index if not exists business_events_org_status_idx
  on public.business_events (organization_id, status, happened_on desc);
create index if not exists bookkeeping_drafts_org_status_idx
  on public.bookkeeping_drafts (organization_id, status, created_at desc);
create index if not exists journal_entries_org_date_idx
  on public.journal_entries (organization_id, posted_on desc);
create index if not exists journal_lines_org_account_idx
  on public.journal_lines (organization_id, account_number, created_at desc);
create index if not exists source_documents_org_status_idx
  on public.source_documents (organization_id, processing_status, created_at desc);
create index if not exists bank_transactions_org_date_idx
  on public.bank_transactions (organization_id, booked_on desc);
create index if not exists audit_events_org_entity_idx
  on public.audit_events (organization_id, entity_type, entity_id, created_at desc);

alter table public.company_accounting_settings enable row level security;
alter table public.accounting_accounts enable row level security;
alter table public.fiscal_years enable row level security;
alter table public.accounting_periods enable row level security;
alter table public.vat_codes enable row level security;
alter table public.posting_rules enable row level security;
alter table public.business_events enable row level security;
alter table public.bookkeeping_drafts enable row level security;
alter table public.source_documents enable row level security;
alter table public.journal_series_counters enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.reconciliation_matches enable row level security;
alter table public.correction_links enable row level security;
alter table public.audit_events enable row level security;

do $$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'company_accounting_settings', 'accounting_accounts', 'fiscal_years',
    'accounting_periods', 'vat_codes', 'business_events', 'bookkeeping_drafts',
    'source_documents', 'journal_series_counters', 'journal_entries',
    'journal_lines', 'bank_transactions', 'reconciliation_matches',
    'correction_links', 'audit_events'
  ] loop
    policy_name := 'Members can read ' || table_name;
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = table_name
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for select to authenticated using (public.is_org_member(organization_id))',
        policy_name,
        table_name
      );
    end if;
  end loop;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'posting_rules'
      and policyname = 'Authenticated can read posting rules'
  ) then
    create policy "Authenticated can read posting rules"
      on public.posting_rules for select to authenticated using (true);
  end if;

  foreach table_name in array array[
    'company_accounting_settings', 'accounting_accounts', 'fiscal_years',
    'accounting_periods', 'vat_codes'
  ] loop
    policy_name := 'Owners can manage ' || table_name;
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = table_name
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (public.can_manage_org_settings(organization_id)) with check (public.can_manage_org_settings(organization_id))',
        policy_name,
        table_name
      );
    end if;
  end loop;

  foreach table_name in array array[
    'business_events', 'bookkeeping_drafts', 'bank_transactions',
    'reconciliation_matches'
  ] loop
    policy_name := 'Managers can manage ' || table_name;
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = table_name
        and policyname = policy_name
    ) then
      execute format(
        'create policy %I on public.%I for all to authenticated using (public.can_manage_org_data(organization_id)) with check (public.can_manage_org_data(organization_id))',
        policy_name,
        table_name
      );
    end if;
  end loop;

  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'source_documents'
      and policyname = 'Managers can create source documents'
  ) then
    create policy "Managers can create source documents"
      on public.source_documents for insert to authenticated
      with check (public.can_manage_org_data(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'source_documents'
      and policyname = 'Managers can update source document status'
  ) then
    create policy "Managers can update source document status"
      on public.source_documents for update to authenticated
      using (public.can_manage_org_data(organization_id))
      with check (public.can_manage_org_data(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'correction_links'
      and policyname = 'Managers can create correction links'
  ) then
    create policy "Managers can create correction links"
      on public.correction_links for insert to authenticated
      with check (public.can_manage_org_data(organization_id));
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public'
      and tablename = 'audit_events'
      and policyname = 'Managers can create audit events'
  ) then
    create policy "Managers can create audit events"
      on public.audit_events for insert to authenticated
      with check (public.can_manage_org_data(organization_id));
  end if;
end
$$;

create or replace function public.prevent_posted_journal_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'Posted journal records are immutable; create a correction';
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'journal_entries_are_immutable' and not tgisinternal
  ) then
    create trigger journal_entries_are_immutable
      before update or delete on public.journal_entries
      for each row execute function public.prevent_posted_journal_mutation();
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgname = 'journal_lines_are_immutable' and not tgisinternal
  ) then
    create trigger journal_lines_are_immutable
      before update or delete on public.journal_lines
      for each row execute function public.prevent_posted_journal_mutation();
  end if;
end
$$;

create or replace function public.post_bookkeeping_draft(
  target_organization_id uuid,
  target_draft_id uuid,
  target_idempotency_key text,
  target_journal_series text default 'A'
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_draft public.bookkeeping_drafts%rowtype;
  target_event public.business_events%rowtype;
  target_fiscal_year public.fiscal_years%rowtype;
  target_period public.accounting_periods%rowtype;
  idempotency_result jsonb;
  idempotency_id uuid;
  journal_entry_id uuid := gen_random_uuid();
  next_journal_number integer;
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

  select * into target_draft
  from public.bookkeeping_drafts
  where organization_id = target_organization_id and id = target_draft_id
  for update;

  if not found or target_draft.status <> 'ready_to_post' then
    raise exception 'Bookkeeping draft is not ready to post';
  end if;

  select * into target_event
  from public.business_events
  where organization_id = target_organization_id
    and id = target_draft.business_event_id
  for update;

  if not found or target_event.happened_on is null then
    raise exception 'Business event is incomplete';
  end if;

  if target_event.status = 'posted' or target_event.posted_journal_entry_id is not null then
    raise exception 'Business event is already posted';
  end if;

  select * into target_fiscal_year
  from public.fiscal_years
  where organization_id = target_organization_id
    and target_event.happened_on between starts_on and ends_on
    and status = 'open'
  for update;

  if not found then
    raise exception 'No open fiscal year covers the event date';
  end if;

  select * into target_period
  from public.accounting_periods
  where organization_id = target_organization_id
    and fiscal_year_id = target_fiscal_year.id
    and target_event.happened_on between starts_on and ends_on
    and status = 'open'
  for update;

  if not found then
    raise exception 'Accounting period is locked or missing';
  end if;

  if jsonb_typeof(target_draft.lines_json) <> 'array'
     or jsonb_array_length(target_draft.lines_json) < 2 then
    raise exception 'A journal entry needs at least two lines';
  end if;

  if exists (
    select 1 from jsonb_array_elements(target_draft.lines_json) line
    where coalesce(line->>'side', '') not in ('debit', 'credit')
      or coalesce(line->>'accountNumber', '') !~ '^[0-9]{4}$'
      or coalesce(line->>'amountMinor', '') !~ '^[0-9]+$'
      or (line->>'amountMinor')::bigint <= 0
  ) then
    raise exception 'Journal draft contains an invalid line';
  end if;

  select
    coalesce(sum(case when line->>'side' = 'debit' then (line->>'amountMinor')::bigint else 0 end), 0),
    coalesce(sum(case when line->>'side' = 'credit' then (line->>'amountMinor')::bigint else 0 end), 0)
  into debit_total, credit_total
  from jsonb_array_elements(target_draft.lines_json) line;

  if debit_total <> credit_total then
    raise exception 'Debit and credit do not balance';
  end if;

  if target_draft.posting_rule_id is null or target_draft.posting_rule_version is null then
    raise exception 'Posting rule identity is required';
  end if;

  idempotency_result := public.begin_hub_idempotent_operation(
    target_organization_id,
    'post_journal_entry',
    target_idempotency_key,
    target_draft_id::text
  );

  if idempotency_result->>'outcome' = 'replay' then
    return (idempotency_result->>'resultEntityId')::uuid;
  end if;

  if idempotency_result->>'outcome' = 'in_progress' then
    raise exception 'An identical journal posting is already in progress';
  end if;

  select id into idempotency_id
  from public.idempotency_keys
  where organization_id = target_organization_id
    and operation = 'post_journal_entry'
    and key = target_idempotency_key;

  insert into public.journal_series_counters (
    organization_id, fiscal_year_id, journal_series, next_number
  ) values (
    target_organization_id, target_fiscal_year.id, target_journal_series, 2
  )
  on conflict (organization_id, fiscal_year_id, journal_series)
  do update set next_number = public.journal_series_counters.next_number + 1
  returning next_number - 1 into next_journal_number;

  insert into public.journal_entries (
    id, organization_id, fiscal_year_id, accounting_period_id,
    business_event_id, idempotency_key_id, journal_series, journal_number,
    posted_on, description, posting_rule_id, posting_rule_version,
    created_by, approved_by
  ) values (
    journal_entry_id, target_organization_id, target_fiscal_year.id,
    target_period.id, target_event.id, idempotency_id, target_journal_series,
    next_journal_number, target_event.happened_on,
    coalesce(target_draft.explanation, target_event.event_type),
    target_draft.posting_rule_id, target_draft.posting_rule_version,
    auth.uid(), auth.uid()
  );

  insert into public.journal_lines (
    organization_id, journal_entry_id, account_id, account_number,
    debit_minor, credit_minor, description
  )
  select
    target_organization_id,
    journal_entry_id,
    account.id,
    line->>'accountNumber',
    case when line->>'side' = 'debit' then (line->>'amountMinor')::bigint else 0 end,
    case when line->>'side' = 'credit' then (line->>'amountMinor')::bigint else 0 end,
    nullif(line->>'description', '')
  from jsonb_array_elements(target_draft.lines_json) line
  left join public.accounting_accounts account
    on account.organization_id = target_organization_id
   and account.account_number = line->>'accountNumber';

  update public.business_events
  set status = 'posted', posted_journal_entry_id = journal_entry_id,
      updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_event.id;

  update public.bookkeeping_drafts
  set status = 'posted', updated_at = timezone('utc', now())
  where organization_id = target_organization_id and id = target_draft.id;

  perform public.complete_hub_idempotent_operation(
    target_organization_id,
    'post_journal_entry',
    target_idempotency_key,
    'journal_entry',
    journal_entry_id
  );

  return journal_entry_id;
end;
$$;

revoke all on function public.post_bookkeeping_draft(uuid, uuid, text, text) from public;
grant execute on function public.post_bookkeeping_draft(uuid, uuid, text, text) to authenticated;
