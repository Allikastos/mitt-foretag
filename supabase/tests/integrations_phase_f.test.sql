begin;

select plan(23);

select ok(to_regclass('public.integration_connections') is not null, 'integration connections table exists');
select ok(to_regclass('public.external_event_receipts') is not null, 'external event receipts table exists');
select has_column('public', 'integration_connections', 'category');
select has_column('public', 'integration_connections', 'configuration_version');
select has_column('public', 'integration_connections', 'health_status');
select has_column('public', 'external_event_receipts', 'external_event_id');
select has_column('public', 'external_event_receipts', 'payload_sha256');
select has_column('public', 'external_event_receipts', 'attempt_count');
select has_column('public', 'external_event_receipts', 'failure_code');
select ok(not has_column('public', 'integration_connections', 'secret'), 'connections do not store secrets');
select ok(not has_column('public', 'external_event_receipts', 'payload'), 'receipts do not store raw payloads');
select ok(to_regprocedure('private.record_integration_connection(uuid,text,text,text,text,uuid,text)') is not null, 'private connection recorder exists');
select ok(to_regprocedure('private.begin_external_event(uuid,uuid,text,text,text,text)') is not null, 'private event begin function exists');
select ok(to_regprocedure('private.complete_external_event(uuid,text,text)') is not null, 'private event completion function exists');
select ok(not has_table_privilege('authenticated', 'public.integration_connections', 'INSERT'), 'members cannot insert connections');
select ok(not has_table_privilege('authenticated', 'public.integration_connections', 'UPDATE'), 'members cannot update connections');
select ok(not has_table_privilege('authenticated', 'public.integration_connections', 'DELETE'), 'members cannot delete connections');
select ok(has_column_privilege('authenticated', 'public.integration_connections', 'status', 'SELECT'), 'owners can receive safe connection status through RLS');
select ok(not has_table_privilege('authenticated', 'public.external_event_receipts', 'SELECT'), 'webhook receipts are server-only');
select ok(not has_table_privilege('authenticated', 'public.external_event_receipts', 'INSERT'), 'members cannot insert webhook receipts');
select ok(not has_function_privilege('authenticated', 'private.begin_external_event(uuid,uuid,text,text,text,text)', 'EXECUTE'), 'event ingestion is server-only');
select ok(not has_function_privilege('authenticated', 'private.complete_external_event(uuid,text,text)', 'EXECUTE'), 'event completion is server-only');
select ok(has_function_privilege('service_role', 'private.begin_external_event(uuid,uuid,text,text,text,text)', 'EXECUTE'), 'service role may ingest verified events');

select * from finish();
rollback;
