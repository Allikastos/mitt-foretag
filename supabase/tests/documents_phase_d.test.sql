begin;

select plan(11);

select ok(to_regclass('public.document_facts') is not null, 'document facts table exists');
select has_column('public', 'document_facts', 'extraction_method', 'facts track extraction method');
select has_column('public', 'document_facts', 'ocr_status', 'facts track OCR status');
select has_column('public', 'document_facts', 'revision', 'facts are revisioned');
select has_column('public', 'source_documents', 'business_event_id', 'source documents link to events');
select ok(to_regprocedure('public.save_document_facts(uuid,uuid,text,text,text,text,date,date,bigint,bigint,text,text,text)') is not null, 'manual facts RPC exists');
select ok(to_regprocedure('public.link_source_document_to_draft(uuid,uuid,uuid)') is not null, 'document link RPC exists');
select ok(not has_table_privilege('authenticated', 'public.document_facts', 'INSERT'), 'facts reject direct inserts');
select ok(not has_table_privilege('authenticated', 'public.source_documents', 'UPDATE'), 'source links reject direct updates');
select ok(not has_table_privilege('authenticated', 'public.journal_entries', 'INSERT'), 'journal entries remain RPC-only');
select trigger_is('public', 'documents', 'documents_retention_lock_is_one_way', 'public', 'prevent_retention_unlock');

select * from finish();
rollback;
