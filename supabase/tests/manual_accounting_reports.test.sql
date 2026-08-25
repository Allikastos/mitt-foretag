begin;

select plan(7);

select ok(
  to_regprocedure('public.save_manual_bookkeeping_draft(uuid,text,date,bigint,text,jsonb,text)') is not null,
  'manual bookkeeping draft RPC exists'
);
select ok(
  to_regprocedure('public.activate_accounting_account(uuid,text,text,text)') is not null,
  'account activation RPC exists'
);
select ok(
  has_function_privilege('authenticated', 'public.save_manual_bookkeeping_draft(uuid,text,date,bigint,text,jsonb,text)', 'EXECUTE'),
  'authenticated users may call manual draft RPC'
);
select ok(
  not has_function_privilege('anon', 'public.save_manual_bookkeeping_draft(uuid,text,date,bigint,text,jsonb,text)', 'EXECUTE'),
  'anonymous users cannot call manual draft RPC'
);
select ok(
  not has_function_privilege('anon', 'public.activate_accounting_account(uuid,text,text,text)', 'EXECUTE'),
  'anonymous users cannot activate accounts'
);
select matches(
  pg_get_constraintdef(oid),
  'manual_journal_entry',
  'business events allow manual journal entries'
)
from pg_constraint
where conname = 'business_events_event_type_check'
  and conrelid = 'public.business_events'::regclass;
select ok(
  not has_table_privilege('authenticated', 'public.journal_entries', 'INSERT'),
  'manual workflow does not grant direct journal inserts'
);

select * from finish();
rollback;
