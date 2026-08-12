-- Additive accounting foundation for Altura Nova Hub.
-- Review before applying to any production database.
-- This file does not create external services and does not delete data.

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
  key text not null,
  request_hash text not null,
  status text not null default 'started' check (status in ('started', 'succeeded', 'failed')),
  result_entity_type text,
  result_entity_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, operation, key)
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
  idempotency_key_id uuid references public.idempotency_keys(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.company_accounting_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  company_form text not null default 'sole_trader' check (company_form in ('sole_trader', 'limited_company')),
  accounting_method text not null default 'cash_basis' check (accounting_method in ('cash_basis', 'accrual')),
  reporting_currency text not null default 'SEK',
  vat_registered boolean not null default true,
  vat_period text not null default 'quarterly' check (vat_period in ('monthly', 'quarterly', 'yearly')),
  fiscal_year_start_month integer not null default 1 check (fiscal_year_start_month between 1 and 12),
  accounting_enabled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.accounting_accounts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  account_number text not null,
  name text not null,
  kind text not null check (kind in ('asset', 'liability', 'equity', 'income', 'expense')),
  is_active boolean not null default true,
  source text not null default 'manual',
  review_required boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, account_number)
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
  check (starts_on <= ends_on)
);

create table if not exists public.accounting_periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fiscal_year_id uuid not null references public.fiscal_years(id) on delete cascade,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'open' check (status in ('open', 'review', 'locked')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, fiscal_year_id, starts_on),
  check (starts_on <= ends_on)
);

create table if not exists public.vat_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null,
  name text not null,
  rate_basis_points integer not null default 0,
  direction text not null check (direction in ('input', 'output', 'none')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, code)
);

create table if not exists public.posting_rules (
  id uuid primary key default gen_random_uuid(),
  stable_rule_id text not null,
  version integer not null,
  description text not null,
  company_form text not null,
  accounting_method text not null,
  event_type text not null,
  rule_json jsonb not null default '{}'::jsonb,
  source_refs text[] not null default '{}',
  review_status text not null default 'needs_review' check (review_status in ('needs_review', 'reviewed', 'retired')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (stable_rule_id, version)
);

create table if not exists public.business_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null,
  status text not null default 'incomplete' check (status in ('incomplete', 'needs_review', 'ready_to_post', 'posted', 'rejected')),
  happened_on date,
  amount_minor bigint,
  currency text not null default 'SEK',
  facts jsonb not null default '{}'::jsonb,
  source_entity_type text,
  source_entity_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  posted_journal_entry_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.bookkeeping_drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  business_event_id uuid not null references public.business_events(id) on delete cascade,
  status text not null default 'needs_review' check (status in ('incomplete', 'needs_review', 'ready_to_post', 'posted', 'rejected')),
  posting_rule_id text,
  posting_rule_version integer,
  explanation text,
  lines_json jsonb not null default '[]'::jsonb,
  warnings text[] not null default '{}',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  fiscal_year_id uuid not null references public.fiscal_years(id),
  accounting_period_id uuid not null references public.accounting_periods(id),
  business_event_id uuid references public.business_events(id) on delete restrict,
  journal_series text not null default 'A',
  journal_number integer not null,
  posted_on date not null,
  description text not null,
  posting_rule_id text,
  posting_rule_version integer,
  source_document_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, journal_series, journal_number)
);

create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  journal_entry_id uuid not null references public.journal_entries(id) on delete restrict,
  account_id uuid references public.accounting_accounts(id) on delete restrict,
  account_number text not null,
  debit_minor bigint not null default 0 check (debit_minor >= 0),
  credit_minor bigint not null default 0 check (credit_minor >= 0),
  vat_code_id uuid references public.vat_codes(id) on delete set null,
  description text,
  customer_id uuid references public.customers(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  check ((debit_minor > 0 and credit_minor = 0) or (credit_minor > 0 and debit_minor = 0))
);

create table if not exists public.source_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  document_id uuid references public.documents(id) on delete restrict,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  sha256 text,
  storage_key text not null,
  document_type text not null default 'unknown',
  processing_status text not null default 'uploaded' check (processing_status in ('uploaded', 'processing', 'needs_information', 'ready', 'linked', 'failed')),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, sha256)
);

create table if not exists public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  account_label text not null,
  booked_on date not null,
  amount_minor bigint not null,
  currency text not null default 'SEK',
  description text,
  counterparty_name text,
  external_id text,
  imported_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, account_label, external_id)
);

create table if not exists public.reconciliation_matches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  bank_transaction_id uuid not null references public.bank_transactions(id) on delete cascade,
  business_event_id uuid references public.business_events(id) on delete cascade,
  journal_entry_id uuid references public.journal_entries(id) on delete restrict,
  status text not null default 'needs_review' check (status in ('needs_review', 'accepted', 'rejected')),
  confidence text not null default 'yellow' check (confidence in ('green', 'yellow', 'red')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.correction_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  original_journal_entry_id uuid not null references public.journal_entries(id) on delete restrict,
  correction_journal_entry_id uuid not null references public.journal_entries(id) on delete restrict,
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, original_journal_entry_id, correction_journal_entry_id)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idempotency_keys_org_operation_idx on public.idempotency_keys (organization_id, operation, created_at desc);
create index if not exists processing_jobs_org_status_idx on public.processing_jobs (organization_id, status, created_at desc);
create index if not exists accounting_accounts_org_active_idx on public.accounting_accounts (organization_id, is_active, account_number);
create index if not exists fiscal_years_org_status_idx on public.fiscal_years (organization_id, status, starts_on);
create index if not exists accounting_periods_org_status_idx on public.accounting_periods (organization_id, status, starts_on);
create index if not exists business_events_org_status_idx on public.business_events (organization_id, status, happened_on desc);
create index if not exists bookkeeping_drafts_org_status_idx on public.bookkeeping_drafts (organization_id, status, created_at desc);
create index if not exists journal_entries_org_date_idx on public.journal_entries (organization_id, posted_on desc);
create index if not exists journal_lines_org_account_idx on public.journal_lines (organization_id, account_number, created_at desc);
create index if not exists source_documents_org_status_idx on public.source_documents (organization_id, processing_status, created_at desc);
create index if not exists bank_transactions_org_date_idx on public.bank_transactions (organization_id, booked_on desc);
create index if not exists audit_events_org_entity_idx on public.audit_events (organization_id, entity_type, entity_id, created_at desc);

alter table public.idempotency_keys enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.company_accounting_settings enable row level security;
alter table public.accounting_accounts enable row level security;
alter table public.fiscal_years enable row level security;
alter table public.accounting_periods enable row level security;
alter table public.vat_codes enable row level security;
alter table public.posting_rules enable row level security;
alter table public.business_events enable row level security;
alter table public.bookkeeping_drafts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;
alter table public.source_documents enable row level security;
alter table public.bank_transactions enable row level security;
alter table public.reconciliation_matches enable row level security;
alter table public.correction_links enable row level security;
alter table public.audit_events enable row level security;

-- Policies depend on helper functions from supabase/hub.sql.
drop policy if exists "Members can read accounting settings" on public.company_accounting_settings;
create policy "Members can read accounting settings" on public.company_accounting_settings
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Owners and admins can manage accounting settings" on public.company_accounting_settings;
create policy "Owners and admins can manage accounting settings" on public.company_accounting_settings
for all to authenticated
using (public.can_manage_org_settings(organization_id))
with check (public.can_manage_org_settings(organization_id));

-- Generic member read / manager write policies for company-owned accounting tables.
drop policy if exists "Members can read idempotency keys" on public.idempotency_keys;
create policy "Members can read idempotency keys" on public.idempotency_keys for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can create idempotency keys" on public.idempotency_keys;
create policy "Managers can create idempotency keys" on public.idempotency_keys for insert to authenticated with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read processing jobs" on public.processing_jobs;
create policy "Members can read processing jobs" on public.processing_jobs for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage processing jobs" on public.processing_jobs;
create policy "Managers can manage processing jobs" on public.processing_jobs for all to authenticated using (public.can_manage_org_data(organization_id)) with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read accounting accounts" on public.accounting_accounts;
create policy "Members can read accounting accounts" on public.accounting_accounts for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage accounting accounts" on public.accounting_accounts;
create policy "Managers can manage accounting accounts" on public.accounting_accounts for all to authenticated using (public.can_manage_org_settings(organization_id)) with check (public.can_manage_org_settings(organization_id));

drop policy if exists "Members can read fiscal years" on public.fiscal_years;
create policy "Members can read fiscal years" on public.fiscal_years for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage fiscal years" on public.fiscal_years;
create policy "Managers can manage fiscal years" on public.fiscal_years for all to authenticated using (public.can_manage_org_settings(organization_id)) with check (public.can_manage_org_settings(organization_id));

drop policy if exists "Members can read accounting periods" on public.accounting_periods;
create policy "Members can read accounting periods" on public.accounting_periods for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage accounting periods" on public.accounting_periods;
create policy "Managers can manage accounting periods" on public.accounting_periods for all to authenticated using (public.can_manage_org_settings(organization_id)) with check (public.can_manage_org_settings(organization_id));

drop policy if exists "Members can read vat codes" on public.vat_codes;
create policy "Members can read vat codes" on public.vat_codes for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage vat codes" on public.vat_codes;
create policy "Managers can manage vat codes" on public.vat_codes for all to authenticated using (public.can_manage_org_settings(organization_id)) with check (public.can_manage_org_settings(organization_id));

drop policy if exists "Authenticated can read posting rules" on public.posting_rules;
create policy "Authenticated can read posting rules" on public.posting_rules for select to authenticated using (true);

drop policy if exists "Members can read business events" on public.business_events;
create policy "Members can read business events" on public.business_events for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage business events" on public.business_events;
create policy "Managers can manage business events" on public.business_events for all to authenticated using (public.can_manage_org_data(organization_id)) with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read bookkeeping drafts" on public.bookkeeping_drafts;
create policy "Members can read bookkeeping drafts" on public.bookkeeping_drafts for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage bookkeeping drafts" on public.bookkeeping_drafts;
create policy "Managers can manage bookkeeping drafts" on public.bookkeeping_drafts for all to authenticated using (public.can_manage_org_data(organization_id)) with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read journal entries" on public.journal_entries;
create policy "Members can read journal entries" on public.journal_entries for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can create journal entries" on public.journal_entries;
create policy "Managers can create journal entries" on public.journal_entries for insert to authenticated with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read journal lines" on public.journal_lines;
create policy "Members can read journal lines" on public.journal_lines for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can create journal lines" on public.journal_lines;
create policy "Managers can create journal lines" on public.journal_lines for insert to authenticated with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read source documents" on public.source_documents;
create policy "Members can read source documents" on public.source_documents for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage source documents" on public.source_documents;
create policy "Managers can manage source documents" on public.source_documents for all to authenticated using (public.can_manage_org_data(organization_id)) with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read bank transactions" on public.bank_transactions;
create policy "Members can read bank transactions" on public.bank_transactions for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage bank transactions" on public.bank_transactions;
create policy "Managers can manage bank transactions" on public.bank_transactions for all to authenticated using (public.can_manage_org_data(organization_id)) with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read reconciliation matches" on public.reconciliation_matches;
create policy "Members can read reconciliation matches" on public.reconciliation_matches for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can manage reconciliation matches" on public.reconciliation_matches;
create policy "Managers can manage reconciliation matches" on public.reconciliation_matches for all to authenticated using (public.can_manage_org_data(organization_id)) with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read correction links" on public.correction_links;
create policy "Members can read correction links" on public.correction_links for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can create correction links" on public.correction_links;
create policy "Managers can create correction links" on public.correction_links for insert to authenticated with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read audit events" on public.audit_events;
create policy "Members can read audit events" on public.audit_events for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Managers can create audit events" on public.audit_events;
create policy "Managers can create audit events" on public.audit_events for insert to authenticated with check (public.can_manage_org_data(organization_id));
