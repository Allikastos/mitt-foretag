begin;

select plan(23);

select is(
  (select count(*)::integer from public.organizations where org_number like 'TEST-%'),
  2,
  'synthetic test organizations are available'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '11000000-0000-4000-8000-000000000003',
  true
);

select is((select count(*)::integer from public.organizations), 1, 'member sees one organization');
select is((select count(*)::integer from public.customers), 1, 'assigned-only member sees own customer');
select is((select count(*)::integer from public.contacts), 1, 'customer scope applies to contacts');
select is((select count(*)::integer from public.tasks), 1, 'customer scope applies to tasks');
select is((select count(*)::integer from public.documents), 1, 'customer scope applies to document metadata');
select is((select count(*)::integer from public.invoices), 1, 'customer scope applies to invoices');
select is((select count(*)::integer from public.invoice_lines), 1, 'customer scope applies to invoice lines');
with changed as (
  update public.customers set notes = 'blocked'
  where id = '23000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*)::integer from changed),
  0,
  'manipulated cross-organization customer id changes no rows'
);
select throws_ok(
  $$insert into public.customers (
      organization_id, created_by, owner_user_id, company_name
    ) values (
      '20000000-0000-4000-8000-000000000002',
      '11000000-0000-4000-8000-000000000003',
      '11000000-0000-4000-8000-000000000003',
      'Blocked cross-organization customer'
    )$$,
  '42501',
  'new row violates row-level security policy for table "customers"',
  'member cannot forge a customer in another organization'
);
select ok(
  not public.can_access_customer(
    '10000000-0000-4000-8000-000000000001',
    '13000000-0000-4000-8000-000000000003'
  ),
  'member cannot access owners-only customer'
);
select ok(
  not has_table_privilege('authenticated', 'public.journal_entries', 'INSERT'),
  'authenticated users cannot insert journal entries directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.journal_lines', 'UPDATE'),
  'authenticated users cannot mutate journal lines directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.organizations', 'INSERT'),
  'authenticated users cannot insert organizations directly'
);
select ok(
  has_function_privilege('authenticated', 'public.create_hub_organization(text,text,text)', 'EXECUTE'),
  'authenticated users create organizations through the atomic RPC'
);
select is(
  (
    select count(*)::integer
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'authenticated'
      and privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES')
  ),
  0,
  'authenticated users have no structural or RLS-bypassing table privileges'
);
select is(
  (
    select count(*)::integer
    from information_schema.role_table_grants
    where table_schema = 'public'
      and grantee = 'anon'
  ),
  0,
  'anonymous users have no direct privileges on hub tables'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '11000000-0000-4000-8000-000000000004',
  true
);

select is((select count(*)::integer from public.customers), 0, 'assigned-only viewer has no implicit customer access');
select throws_ok(
  $$insert into public.tasks (organization_id, title)
    values ('10000000-0000-4000-8000-000000000001', 'Blocked viewer task')$$,
  '42501',
  'new row violates row-level security policy for table "tasks"',
  'viewer cannot create tasks'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '11000000-0000-4000-8000-000000000001',
  true
);

select is((select count(*)::integer from public.customers), 3, 'owner sees every customer in own organization');
select is(
  (select count(*)::integer from public.customers where organization_id = '20000000-0000-4000-8000-000000000002'),
  0,
  'owner cannot see another organization'
);
select throws_ok(
  $$update public.company_accounting_settings
    set company_form = 'limited_company', accounting_enabled = true
    where organization_id = '10000000-0000-4000-8000-000000000001'$$,
  '42501',
  'permission denied for table company_accounting_settings',
  'direct accounting configuration writes are blocked'
);

reset role;
select is(
  (select count(*)::integer from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname in (
        'Hub members can view documents bucket',
        'Hub members can upload documents bucket',
        'Hub members can update documents bucket',
        'Hub members can delete documents bucket',
        'Retained hub documents cannot be replaced',
        'Retained hub documents cannot be deleted'
      )),
  6,
  'all private document storage policies are installed'
);

select * from finish();
rollback;
