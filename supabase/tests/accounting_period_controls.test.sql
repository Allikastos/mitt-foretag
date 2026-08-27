begin;

select plan(13);

select ok(
  to_regprocedure('public.save_special_bookkeeping_draft(uuid,text,date,bigint,text,jsonb,text,text,uuid,text)') is not null,
  'special draft RPC exists'
);
select ok(
  to_regprocedure('public.lock_accounting_period(uuid,uuid)') is not null,
  'period locking RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.lock_accounting_period(uuid,uuid)', 'EXECUTE'),
  'authenticated users may call the role-checked period RPC'
);
select ok(
  not has_function_privilege('anon', 'public.lock_accounting_period(uuid,uuid)', 'EXECUTE'),
  'anonymous users cannot lock periods'
);
select ok(
  not has_function_privilege('anon', 'public.save_special_bookkeeping_draft(uuid,text,date,bigint,text,jsonb,text,text,uuid,text)', 'EXECUTE'),
  'anonymous users cannot create special drafts'
);
select matches(
  pg_get_constraintdef(oid), 'opening_balance', 'business events allow opening balances'
) from pg_constraint
where conname = 'business_events_event_type_check'
  and conrelid = 'public.business_events'::regclass;
select matches(
  pg_get_constraintdef(oid), 'correction_entry', 'business events allow correction entries'
) from pg_constraint
where conname = 'business_events_event_type_check'
  and conrelid = 'public.business_events'::regclass;
select ok(
  exists (select 1 from pg_trigger where tgname = 'link_posted_correction_trigger' and not tgisinternal),
  'posted corrections are linked by a database trigger'
);
select ok(
  not has_function_privilege('anon', 'public.link_posted_correction()', 'EXECUTE'),
  'anonymous users cannot execute the correction trigger function'
);
select ok(
  not has_function_privilege('authenticated', 'public.link_posted_correction()', 'EXECUTE'),
  'authenticated users cannot execute the correction trigger function directly'
);

insert into public.accounting_periods (id, organization_id, fiscal_year_id, starts_on, ends_on, status) values
  ('19100000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000001', '19000000-0000-4000-8000-000000000001', date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month - 1 day')::date, 'open'),
  ('19100000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000001', '19000000-0000-4000-8000-000000000001', (date_trunc('month', current_date) - interval '1 month')::date, (date_trunc('month', current_date) - interval '1 day')::date, 'open')
on conflict (organization_id, fiscal_year_id, starts_on) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11000000-0000-4000-8000-000000000003', true);
select throws_ok(
  $$select public.lock_accounting_period(
    '10000000-0000-4000-8000-000000000001',
    (select id from public.accounting_periods where organization_id = '10000000-0000-4000-8000-000000000001' limit 1)
  )$$,
  'P0001', 'Not authorized for organization',
  'members cannot lock accounting periods'
);

select set_config('request.jwt.claim.sub', '11000000-0000-4000-8000-000000000001', true);
select throws_ok(
  $$select public.lock_accounting_period(
    '10000000-0000-4000-8000-000000000001',
    '19100000-0000-4000-8000-000000000010'
  )$$,
  'P0001', 'Accounting period has unresolved drafts',
  'owners cannot lock a period with unresolved drafts'
);
select lives_ok(
  $$select public.lock_accounting_period(
    '10000000-0000-4000-8000-000000000001',
    '19100000-0000-4000-8000-000000000011'
  )$$,
  'owners can lock a period without unresolved drafts'
);

select * from finish();
rollback;
