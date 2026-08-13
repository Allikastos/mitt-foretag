begin;

select plan(21);

select ok(to_regclass('public.processing_jobs') is not null, 'processing jobs table exists');
select has_column('public', 'processing_jobs', 'deduplication_key', 'jobs have deduplication keys');
select has_column('public', 'processing_jobs', 'attempt_count', 'jobs track attempts');
select has_column('public', 'processing_jobs', 'max_attempts', 'jobs cap attempts');
select has_column('public', 'processing_jobs', 'lease_owner', 'jobs track lease owners');
select has_column('public', 'processing_jobs', 'lease_expires_at', 'jobs track lease expiry');
select has_column('public', 'processing_jobs', 'cancel_requested_at', 'jobs track cancellation requests');
select has_column('public', 'processing_jobs', 'user_message', 'jobs expose safe user messages');
select ok(to_regprocedure('public.enqueue_processing_job(uuid,uuid,text,text,uuid,jsonb,text,text,integer,integer)') is not null, 'enqueue RPC exists');
select ok(to_regprocedure('public.cancel_processing_job(uuid,uuid,text)') is not null, 'cancel RPC exists');
select ok(to_regprocedure('public.retry_processing_job(uuid,uuid)') is not null, 'retry RPC exists');
select ok(to_regprocedure('private.claim_processing_job(text,text[],integer)') is not null, 'private claim function exists');
select ok(to_regprocedure('private.heartbeat_processing_job(uuid,text,integer)') is not null, 'private heartbeat function exists');
select ok(to_regprocedure('private.complete_processing_job(uuid,text,text,jsonb)') is not null, 'private completion function exists');
select ok(to_regprocedure('private.fail_processing_job(uuid,text,text,text,text,boolean)') is not null, 'private failure function exists');
select ok(not has_table_privilege('authenticated', 'public.processing_jobs', 'INSERT'), 'jobs reject direct inserts');
select ok(not has_table_privilege('authenticated', 'public.processing_jobs', 'UPDATE'), 'jobs reject direct updates');
select ok(has_column_privilege('authenticated', 'public.processing_jobs', 'status', 'SELECT'), 'members may read safe status');
select ok(not has_column_privilege('authenticated', 'public.processing_jobs', 'payload', 'SELECT'), 'members cannot read payload');
select ok(not has_column_privilege('authenticated', 'public.processing_jobs', 'error_message', 'SELECT'), 'members cannot read internal errors');
select ok(not has_function_privilege('authenticated', 'public.enqueue_processing_job(uuid,uuid,text,text,uuid,jsonb,text,text,integer,integer)', 'EXECUTE'), 'generic enqueue is server-only');

select * from finish();
rollback;
