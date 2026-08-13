begin;

select plan(12);

select ok(to_regclass('public.business_events') is not null, 'business events table exists');
select ok(to_regclass('public.bookkeeping_drafts') is not null, 'bookkeeping drafts table exists');
select ok(to_regclass('public.journal_entries') is not null, 'journal entries table exists');
select ok(to_regclass('public.journal_lines') is not null, 'journal lines table exists');
select has_column('public', 'business_events', 'client_request_key', 'business events have request keys');
select has_column('public', 'business_events', 'request_hash', 'business events have request hashes');
select has_column('public', 'bookkeeping_drafts', 'approved_by', 'drafts track approvers');
select has_column('public', 'bookkeeping_drafts', 'approved_at', 'drafts track approval time');
select ok(to_regprocedure('public.initialize_accounting_mvp(uuid,date,date)') is not null, 'initialization RPC exists');
select ok(to_regprocedure('public.save_bookkeeping_draft(uuid,text,text,date,bigint,text,jsonb,text,integer,jsonb,text[])') is not null, 'draft RPC exists');
select ok(to_regprocedure('public.approve_bookkeeping_draft(uuid,uuid)') is not null, 'approval RPC exists');
select ok(not has_table_privilege('authenticated', 'public.journal_entries', 'INSERT'), 'journal entries reject direct inserts');

select * from finish();
rollback;
