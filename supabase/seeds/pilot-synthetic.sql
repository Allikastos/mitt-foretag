-- Synthetic test data only. This file is intentionally not named seed.sql and
-- is never included automatically by Supabase reset or push commands.
do $$
begin
  if current_setting('altura.data_environment', true) not in ('local', 'test')
     or current_setting('altura.allow_synthetic_seed', true)
        <> 'SYNTHETIC_TEST_DATA_ONLY' then
    raise exception 'Synthetic seed is blocked outside an explicitly confirmed local/test session';
  end if;

  if exists (
    select 1 from public.organizations
    where id not in (
      '10000000-0000-4000-8000-000000000001'::uuid,
      '20000000-0000-4000-8000-000000000002'::uuid
    )
  ) then
    raise exception 'Synthetic seed requires an empty or already synthetic database';
  end if;
end
$$;

insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, email_confirmed_at
) values
  ('11000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'owner.alpha@example.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Alpha Ägare"}', now(), now(), now()),
  ('11000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'admin.alpha@example.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Alpha Admin"}', now(), now(), now()),
  ('11000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'member.alpha@example.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Alpha Medarbetare"}', now(), now(), now()),
  ('11000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'viewer.alpha@example.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Alpha Läsare"}', now(), now(), now()),
  ('22000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'owner.beta@example.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Beta Ägare"}', now(), now(), now()),
  ('22000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'member.beta@example.test', '{"provider":"email","providers":["email"]}', '{"full_name":"Beta Medarbetare"}', now(), now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, full_name, email) values
  ('11000000-0000-4000-8000-000000000001', 'Alpha Ägare', 'owner.alpha@example.test'),
  ('11000000-0000-4000-8000-000000000002', 'Alpha Admin', 'admin.alpha@example.test'),
  ('11000000-0000-4000-8000-000000000003', 'Alpha Medarbetare', 'member.alpha@example.test'),
  ('11000000-0000-4000-8000-000000000004', 'Alpha Läsare', 'viewer.alpha@example.test'),
  ('22000000-0000-4000-8000-000000000001', 'Beta Ägare', 'owner.beta@example.test'),
  ('22000000-0000-4000-8000-000000000002', 'Beta Medarbetare', 'member.beta@example.test')
on conflict (id) do nothing;

insert into public.organizations (
  id, name, org_number, email, employee_customer_scope, billing_status
) values
  ('10000000-0000-4000-8000-000000000001', 'Syntetiska Alpha', 'TEST-ALPHA', 'alpha@example.test', 'assigned_only', 'trialing'),
  ('20000000-0000-4000-8000-000000000002', 'Syntetiska Beta', 'TEST-BETA', 'beta@example.test', 'all_customers', 'trialing')
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role) values
  ('10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'owner'),
  ('10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000002', 'admin'),
  ('10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000003', 'member'),
  ('10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000004', 'viewer'),
  ('20000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001', 'owner'),
  ('20000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002', 'member')
on conflict (organization_id, user_id) do nothing;

insert into public.customers (
  id, organization_id, created_by, owner_user_id, visibility,
  company_name, email, status, follow_up_date
) values
  ('13000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000003', '11000000-0000-4000-8000-000000000003', 'organization', 'Alpha Kund Egen', 'egen.alpha@example.test', 'active', current_date + 2),
  ('13000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'organization', 'Alpha Kund Annan', 'annan.alpha@example.test', 'lead', current_date + 5),
  ('13000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'owners_only', 'Alpha Privat Kund', 'privat.alpha@example.test', 'active', null),
  ('23000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002', 'organization', 'Beta Kund', 'kund.beta@example.test', 'active', current_date + 3)
on conflict (id) do nothing;

insert into public.contacts (id, organization_id, customer_id, name, email) values
  ('14000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '13000000-0000-4000-8000-000000000001', 'Kontakt Alpha', 'kontakt.alpha@example.test'),
  ('24000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '23000000-0000-4000-8000-000000000001', 'Kontakt Beta', 'kontakt.beta@example.test')
on conflict (id) do nothing;

insert into public.tasks (id, organization_id, customer_id, assigned_to, title, status, priority, due_date) values
  ('15000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '13000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000003', 'Följ upp Alpha', 'todo', 'high', current_date + 2),
  ('25000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '23000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000002', 'Följ upp Beta', 'in_progress', 'medium', current_date + 4)
on conflict (id) do nothing;

insert into public.invoices (
  id, organization_id, customer_id, invoice_number, status, issue_date,
  due_date, customer_name_snapshot, subtotal, vat_total, total
) values
  ('16000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '13000000-0000-4000-8000-000000000001', null, 'draft', current_date, current_date + 30, 'Alpha Kund Egen', 1000, 250, 1250),
  ('26000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '23000000-0000-4000-8000-000000000001', 'TEST-00001', 'sent', current_date, current_date + 30, 'Beta Kund', 2000, 500, 2500)
on conflict (id) do nothing;

insert into public.invoice_lines (
  id, organization_id, invoice_id, description, quantity, unit_price,
  vat_rate, line_subtotal, line_vat, line_total
) values
  ('17000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '16000000-0000-4000-8000-000000000001', 'Syntetisk tjänst', 1, 1000, 25, 1000, 250, 1250),
  ('27000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '26000000-0000-4000-8000-000000000001', 'Syntetisk tjänst', 1, 2000, 25, 2000, 500, 2500)
on conflict (id) do nothing;

insert into public.documents (
  id, organization_id, customer_id, invoice_id, file_name, file_path,
  mime_type, size_bytes, category, uploaded_by, sha256, document_type,
  processing_status, original_storage_key, retention_locked
) values
  ('18000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '13000000-0000-4000-8000-000000000001', '16000000-0000-4000-8000-000000000001', 'alpha-kvitto.pdf', '10000000-0000-4000-8000-000000000001/synthetic/alpha-kvitto.pdf', 'application/pdf', 128, 'receipt', '11000000-0000-4000-8000-000000000003', repeat('a', 64), 'original', 'ready', '10000000-0000-4000-8000-000000000001/synthetic/alpha-kvitto.pdf', false),
  ('28000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '23000000-0000-4000-8000-000000000001', '26000000-0000-4000-8000-000000000001', 'beta-avtal.pdf', '20000000-0000-4000-8000-000000000002/synthetic/beta-avtal.pdf', 'application/pdf', 256, 'contract', '22000000-0000-4000-8000-000000000002', repeat('b', 64), 'original', 'not_required', '20000000-0000-4000-8000-000000000002/synthetic/beta-avtal.pdf', false)
on conflict (id) do nothing;

insert into public.company_accounting_settings (
  organization_id, company_form, accounting_method, reporting_currency,
  accounting_enabled
) values
  ('10000000-0000-4000-8000-000000000001', 'sole_trader', 'cash_basis', 'SEK', false),
  ('20000000-0000-4000-8000-000000000002', 'sole_trader', 'cash_basis', 'SEK', false)
on conflict (organization_id) do nothing;

insert into public.fiscal_years (id, organization_id, starts_on, ends_on, status) values
  ('19000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', date_trunc('year', current_date)::date, (date_trunc('year', current_date) + interval '1 year - 1 day')::date, 'open'),
  ('29000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', date_trunc('year', current_date)::date, (date_trunc('year', current_date) + interval '1 year - 1 day')::date, 'open')
on conflict (id) do nothing;

insert into public.accounting_periods (id, organization_id, fiscal_year_id, starts_on, ends_on, status) values
  ('19100000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '19000000-0000-4000-8000-000000000001', date_trunc('year', current_date)::date, (date_trunc('year', current_date) + interval '1 month - 1 day')::date, 'open'),
  ('29100000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '29000000-0000-4000-8000-000000000001', date_trunc('year', current_date)::date, (date_trunc('year', current_date) + interval '1 month - 1 day')::date, 'locked')
on conflict (id) do nothing;

insert into public.business_events (
  id, organization_id, event_type, status, happened_on, amount_minor,
  currency, facts, created_by, client_request_key, request_hash
) values
  ('19200000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'owner_deposit', 'needs_review', current_date, 100000, 'SEK', '{"description":"Syntetisk insättning"}', '11000000-0000-4000-8000-000000000003', 'synthetic-event-alpha', repeat('c', 64)),
  ('29200000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'owner_withdrawal', 'needs_review', current_date, 50000, 'SEK', '{"description":"Syntetiskt uttag"}', '22000000-0000-4000-8000-000000000002', 'synthetic-event-beta', repeat('d', 64))
on conflict (id) do nothing;

insert into public.bookkeeping_drafts (
  id, organization_id, business_event_id, status, posting_rule_id,
  posting_rule_version, explanation, lines_json, warnings, created_by
) values
  ('19300000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '19200000-0000-4000-8000-000000000001', 'needs_review', 'se-sole-trader-owner-deposit', 1, 'Syntetiskt utkast', '[{"accountNumber":"1930","side":"debit","amountMinor":100000},{"accountNumber":"2018","side":"credit","amountMinor":100000}]', '{}', '11000000-0000-4000-8000-000000000003'),
  ('29300000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '29200000-0000-4000-8000-000000000001', 'needs_review', 'se-sole-trader-owner-withdrawal', 1, 'Syntetiskt utkast', '[{"accountNumber":"2013","side":"debit","amountMinor":50000},{"accountNumber":"1930","side":"credit","amountMinor":50000}]', '{}', '22000000-0000-4000-8000-000000000002')
on conflict (id) do nothing;

insert into public.processing_jobs (
  id, organization_id, type, status, entity_type, entity_id, payload,
  created_by, deduplication_key, request_hash, user_message
) values
  ('19400000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'invoice_generation', 'queued', 'invoice', '16000000-0000-4000-8000-000000000001', '{}', '11000000-0000-4000-8000-000000000001', 'synthetic-job-alpha', repeat('e', 64), 'Syntetisk process väntar.'),
  ('29400000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 'report_generation', 'succeeded', 'organization', '20000000-0000-4000-8000-000000000002', '{}', '22000000-0000-4000-8000-000000000001', 'synthetic-job-beta', repeat('f', 64), 'Syntetisk process klar.')
on conflict (id) do nothing;

insert into public.audit_events (
  id, organization_id, user_id, entity_type, entity_id, action, metadata
) values
  ('19500000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'organization', '10000000-0000-4000-8000-000000000001', 'synthetic_seeded', '{"synthetic":true}'),
  ('29500000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000001', 'organization', '20000000-0000-4000-8000-000000000002', 'synthetic_seeded', '{"synthetic":true}')
on conflict (id) do nothing;
