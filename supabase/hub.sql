create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_number text,
  vat_number text,
  email text,
  phone text,
  address text,
  address_line_1 text,
  address_line_2 text,
  postal_code text,
  city text,
  country text default 'Sverige',
  website text,
  logo_url text,
  default_vat_rate numeric not null default 25,
  payment_terms_days integer not null default 30,
  invoice_prefix text not null default 'AN',
  next_invoice_number integer not null default 1,
  bankgiro text,
  plusgiro text,
  bank_account text,
  iban text,
  swift_bic text,
  swish_number text,
  invoice_footer text,
  payment_instructions text,
  late_fee_terms text,
  company_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null,
  org_number text,
  contact_name text,
  email text,
  phone text,
  address text,
  notes text,
  status text not null default 'active' check (status in ('lead', 'active', 'inactive')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  role_title text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'waiting', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_number text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date,
  currency text not null default 'SEK',
  customer_name_snapshot text,
  customer_address_snapshot text,
  customer_email_snapshot text,
  notes text,
  subtotal numeric not null default 0,
  vat_total numeric not null default 0,
  total numeric not null default 0,
  finalized_at timestamptz,
  sent_at timestamptz,
  paid_at timestamptz,
  locked_at timestamptz,
  pdf_document_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.organizations
  add column if not exists vat_number text,
  add column if not exists address_line_1 text,
  add column if not exists address_line_2 text,
  add column if not exists postal_code text,
  add column if not exists city text,
  add column if not exists country text default 'Sverige',
  add column if not exists website text,
  add column if not exists logo_url text,
  add column if not exists bankgiro text,
  add column if not exists plusgiro text,
  add column if not exists bank_account text,
  add column if not exists iban text,
  add column if not exists swift_bic text,
  add column if not exists swish_number text,
  add column if not exists invoice_footer text,
  add column if not exists payment_instructions text,
  add column if not exists late_fee_terms text,
  add column if not exists company_reference text;

alter table public.invoices
  add column if not exists finalized_at timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists paid_at timestamptz,
  add column if not exists locked_at timestamptz,
  add column if not exists pdf_document_id uuid;

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  quantity numeric not null default 1,
  unit_price numeric not null default 0,
  vat_rate numeric not null default 25,
  line_subtotal numeric not null default 0,
  line_vat numeric not null default 0,
  line_total numeric not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  file_name text not null,
  file_path text not null,
  mime_type text,
  size_bytes bigint,
  category text not null default 'other' check (category in ('receipt', 'supplier_invoice', 'contract', 'bank_statement', 'other')),
  notes text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  entity_type text,
  entity_id uuid,
  action text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null check (provider in ('gmail', 'outlook', 'imap')),
  email_address text,
  status text not null default 'not_connected' check (status in ('not_connected', 'connected', 'error')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ai_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  feature text,
  input_summary text,
  output_summary text,
  status text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists organization_members_user_idx on public.organization_members (user_id);
create index if not exists customers_organization_idx on public.customers (organization_id, created_at desc);
create index if not exists customers_status_idx on public.customers (organization_id, status);
create unique index if not exists customers_org_id_idx on public.customers (organization_id, id);
create index if not exists contacts_customer_idx on public.contacts (customer_id);
create index if not exists tasks_organization_status_idx on public.tasks (organization_id, status, due_date);
create index if not exists tasks_customer_idx on public.tasks (customer_id);
create index if not exists documents_organization_idx on public.documents (organization_id, created_at desc);
create unique index if not exists documents_org_id_idx on public.documents (organization_id, id);
create index if not exists documents_customer_idx on public.documents (customer_id);
create index if not exists documents_invoice_idx on public.documents (invoice_id);
create index if not exists invoices_organization_status_idx on public.invoices (organization_id, status, created_at desc);
create unique index if not exists invoices_org_id_idx on public.invoices (organization_id, id);
create index if not exists invoices_customer_idx on public.invoices (customer_id);
create unique index if not exists invoices_org_invoice_number_idx on public.invoices (organization_id, invoice_number) where invoice_number is not null;
create index if not exists invoice_lines_invoice_idx on public.invoice_lines (invoice_id, sort_order);
create index if not exists activity_log_organization_idx on public.activity_log (organization_id, created_at desc);
create index if not exists email_connections_organization_idx on public.email_connections (organization_id);
create index if not exists ai_events_organization_idx on public.ai_events (organization_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at before update on public.customers for each row execute function public.set_updated_at();
drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();
drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists set_documents_updated_at on public.documents;
create trigger set_documents_updated_at before update on public.documents for each row execute function public.set_updated_at();
drop trigger if exists set_invoices_updated_at on public.invoices;
create trigger set_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
drop trigger if exists set_invoice_lines_updated_at on public.invoice_lines;
create trigger set_invoice_lines_updated_at before update on public.invoice_lines for each row execute function public.set_updated_at();
drop trigger if exists set_email_connections_updated_at on public.email_connections;
create trigger set_email_connections_updated_at before update on public.email_connections for each row execute function public.set_updated_at();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'customers_organization_id_id_key'
  ) then
    alter table public.customers
      add constraint customers_organization_id_id_key unique (organization_id, id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'documents_organization_id_id_key'
  ) then
    alter table public.documents
      add constraint documents_organization_id_id_key unique (organization_id, id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoices_organization_id_id_key'
  ) then
    alter table public.invoices
      add constraint invoices_organization_id_id_key unique (organization_id, id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_org_customer_fk'
  ) then
    alter table public.tasks
      add constraint tasks_org_customer_fk
      foreign key (organization_id, customer_id)
      references public.customers (organization_id, id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoices_org_customer_fk'
  ) then
    alter table public.invoices
      add constraint invoices_org_customer_fk
      foreign key (organization_id, customer_id)
      references public.customers (organization_id, id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoice_lines_org_invoice_fk'
  ) then
    alter table public.invoice_lines
      add constraint invoice_lines_org_invoice_fk
      foreign key (organization_id, invoice_id)
      references public.invoices (organization_id, id)
      on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'documents_org_customer_fk'
  ) then
    alter table public.documents
      add constraint documents_org_customer_fk
      foreign key (organization_id, customer_id)
      references public.customers (organization_id, id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'documents_org_invoice_fk'
  ) then
    alter table public.documents
      add constraint documents_org_invoice_fk
      foreign key (organization_id, invoice_id)
      references public.invoices (organization_id, id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'invoices_pdf_document_fk'
  ) then
    alter table public.invoices
      add constraint invoices_pdf_document_fk
      foreign key (pdf_document_id)
      references public.documents (id)
      on delete set null;
  end if;
end
$$;

create or replace function public.calculate_invoice_line_totals()
returns trigger
language plpgsql
as $$
begin
  new.line_subtotal = coalesce(new.quantity, 0) * coalesce(new.unit_price, 0);
  new.line_vat = new.line_subtotal * coalesce(new.vat_rate, 0) / 100;
  new.line_total = new.line_subtotal + new.line_vat;
  return new;
end;
$$;

drop trigger if exists calculate_invoice_line_totals on public.invoice_lines;
create trigger calculate_invoice_line_totals
before insert or update on public.invoice_lines
for each row
execute function public.calculate_invoice_line_totals();

create or replace function public.refresh_invoice_totals(target_invoice_id uuid)
returns void
language plpgsql
as $$
declare
  subtotal_sum numeric;
  vat_sum numeric;
  total_sum numeric;
begin
  select
    coalesce(sum(line_subtotal), 0),
    coalesce(sum(line_vat), 0),
    coalesce(sum(line_total), 0)
  into subtotal_sum, vat_sum, total_sum
  from public.invoice_lines
  where invoice_id = target_invoice_id;

  update public.invoices
  set
    subtotal = subtotal_sum,
    vat_total = vat_sum,
    total = total_sum,
    updated_at = timezone('utc', now())
  where id = target_invoice_id;
end;
$$;

create or replace function public.sync_invoice_totals()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_invoice_totals(coalesce(new.invoice_id, old.invoice_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists sync_invoice_totals_after_write on public.invoice_lines;
create trigger sync_invoice_totals_after_write
after insert or update or delete on public.invoice_lines
for each row
execute function public.sync_invoice_totals();

create or replace function public.user_org_role(target_organization_id uuid)
returns text
language sql
stable
as $$
  select role
  from public.organization_members
  where organization_id = target_organization_id
    and user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_org_member(target_organization_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = target_organization_id
      and user_id = auth.uid()
  )
$$;

create or replace function public.can_manage_org_data(target_organization_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(public.user_org_role(target_organization_id), '') in ('owner', 'admin', 'member')
$$;

create or replace function public.can_manage_org_settings(target_organization_id uuid)
returns boolean
language sql
stable
as $$
  select coalesce(public.user_org_role(target_organization_id), '') in ('owner', 'admin')
$$;

create or replace function public.storage_object_org_id(object_name text)
returns uuid
language sql
stable
as $$
  select nullif((storage.foldername(object_name))[1], '')::uuid
$$;

create or replace function public.claim_next_invoice_number(target_organization_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_prefix text;
  current_next integer;
  current_role text;
begin
  current_role := public.user_org_role(target_organization_id);

  if current_role is null or current_role not in ('owner', 'admin', 'member') then
    raise exception 'Not allowed';
  end if;

  select invoice_prefix, next_invoice_number
  into current_prefix, current_next
  from public.organizations
  where id = target_organization_id
  for update;

  if current_next is null then
    current_next := 1;
  end if;

  update public.organizations
  set next_invoice_number = current_next + 1
  where id = target_organization_id;

  return coalesce(current_prefix, 'AN') || '-' || lpad(current_next::text, 5, '0');
end;
$$;

grant execute on function public.claim_next_invoice_number(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.customers enable row level security;
alter table public.contacts enable row level security;
alter table public.tasks enable row level security;
alter table public.documents enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.activity_log enable row level security;
alter table public.email_connections enable row level security;
alter table public.ai_events enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
for select to authenticated
using (id = auth.uid());

drop policy if exists "Users can upsert own profile" on public.profiles;
create policy "Users can upsert own profile" on public.profiles
for all to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Members can read organizations" on public.organizations;
create policy "Members can read organizations" on public.organizations
for select to authenticated
using (public.is_org_member(id));

drop policy if exists "Owners and admins can update organizations" on public.organizations;
create policy "Owners and admins can update organizations" on public.organizations
for update to authenticated
using (public.can_manage_org_settings(id))
with check (public.can_manage_org_settings(id));

drop policy if exists "Users can create organizations" on public.organizations;
create policy "Users can create organizations" on public.organizations
for insert to authenticated
with check (true);

drop policy if exists "Members can read memberships" on public.organization_members;
create policy "Members can read memberships" on public.organization_members
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Owners and admins can manage memberships" on public.organization_members;
create policy "Owners and admins can manage memberships" on public.organization_members
for all to authenticated
using (public.can_manage_org_settings(organization_id))
with check (public.can_manage_org_settings(organization_id));

drop policy if exists "Users can create initial owner membership" on public.organization_members;
create policy "Users can create initial owner membership" on public.organization_members
for insert to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
  and not exists (
    select 1
    from public.organization_members existing_members
    where existing_members.organization_id = organization_members.organization_id
  )
);

drop policy if exists "Members can read customers" on public.customers;
create policy "Members can read customers" on public.customers
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can manage customers" on public.customers;
create policy "Members can manage customers" on public.customers
for all to authenticated
using (public.can_manage_org_data(organization_id))
with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read contacts" on public.contacts;
create policy "Members can read contacts" on public.contacts
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can manage contacts" on public.contacts;
create policy "Members can manage contacts" on public.contacts
for all to authenticated
using (public.can_manage_org_data(organization_id))
with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read tasks" on public.tasks;
create policy "Members can read tasks" on public.tasks
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can manage tasks" on public.tasks;
create policy "Members can manage tasks" on public.tasks
for all to authenticated
using (public.can_manage_org_data(organization_id))
with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read documents" on public.documents;
create policy "Members can read documents" on public.documents
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can manage documents" on public.documents;
create policy "Members can manage documents" on public.documents
for all to authenticated
using (public.can_manage_org_data(organization_id))
with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read invoices" on public.invoices;
create policy "Members can read invoices" on public.invoices
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can manage invoices" on public.invoices;
create policy "Members can manage invoices" on public.invoices
for all to authenticated
using (public.can_manage_org_data(organization_id))
with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read invoice lines" on public.invoice_lines;
create policy "Members can read invoice lines" on public.invoice_lines
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can manage invoice lines" on public.invoice_lines;
create policy "Members can manage invoice lines" on public.invoice_lines
for all to authenticated
using (public.can_manage_org_data(organization_id))
with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read activity log" on public.activity_log;
create policy "Members can read activity log" on public.activity_log
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can create activity log" on public.activity_log;
create policy "Members can create activity log" on public.activity_log
for insert to authenticated
with check (public.can_manage_org_data(organization_id));

drop policy if exists "Members can read email connections" on public.email_connections;
create policy "Members can read email connections" on public.email_connections
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Owners and admins can manage email connections" on public.email_connections;
create policy "Owners and admins can manage email connections" on public.email_connections
for all to authenticated
using (public.can_manage_org_settings(organization_id))
with check (public.can_manage_org_settings(organization_id));

drop policy if exists "Members can read ai events" on public.ai_events;
create policy "Members can read ai events" on public.ai_events
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Members can create ai events" on public.ai_events;
create policy "Members can create ai events" on public.ai_events
for insert to authenticated
with check (public.can_manage_org_data(organization_id));

insert into storage.buckets (id, name, public)
values ('hub-documents', 'hub-documents', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Hub members can view documents bucket" on storage.objects;
create policy "Hub members can view documents bucket" on storage.objects
for select to authenticated
using (
  bucket_id = 'hub-documents'
  and public.is_org_member(public.storage_object_org_id(name))
);

drop policy if exists "Hub members can upload documents bucket" on storage.objects;
create policy "Hub members can upload documents bucket" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'hub-documents'
  and public.can_manage_org_data(public.storage_object_org_id(name))
);

drop policy if exists "Hub members can update documents bucket" on storage.objects;
create policy "Hub members can update documents bucket" on storage.objects
for update to authenticated
using (
  bucket_id = 'hub-documents'
  and public.can_manage_org_data(public.storage_object_org_id(name))
)
with check (
  bucket_id = 'hub-documents'
  and public.can_manage_org_data(public.storage_object_org_id(name))
);

drop policy if exists "Hub members can delete documents bucket" on storage.objects;
create policy "Hub members can delete documents bucket" on storage.objects
for delete to authenticated
using (
  bucket_id = 'hub-documents'
  and public.can_manage_org_data(public.storage_object_org_id(name))
);
