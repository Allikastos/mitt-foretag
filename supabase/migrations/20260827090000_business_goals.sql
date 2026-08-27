-- Organization-scoped business goals for the internal Hub pilot.
create table if not exists public.business_goals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  target_value numeric not null check (target_value > 0),
  current_value numeric not null default 0 check (current_value >= 0),
  unit text not null default 'st' check (char_length(unit) between 1 and 24),
  due_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists business_goals_organization_status_idx
  on public.business_goals (organization_id, status, due_date);

drop trigger if exists set_business_goals_updated_at on public.business_goals;
create trigger set_business_goals_updated_at
before update on public.business_goals
for each row execute function public.set_updated_at();

alter table public.business_goals enable row level security;

create policy "Members can read business goals" on public.business_goals
for select to authenticated
using (public.is_org_member(organization_id));

create policy "Members can manage business goals" on public.business_goals
for all to authenticated
using (public.can_manage_org_data(organization_id))
with check (public.can_manage_org_data(organization_id));

revoke all on table public.business_goals from public, anon, authenticated;
grant select, insert, update, delete on table public.business_goals to authenticated;
grant all on table public.business_goals to service_role;
