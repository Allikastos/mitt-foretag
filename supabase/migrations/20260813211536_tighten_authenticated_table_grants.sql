-- Forward-only correction for cloud projects where broad default Data API
-- grants were present before the explicit privilege migration was applied.
revoke all on table
  public.profiles,
  public.organizations,
  public.organization_members,
  public.customers,
  public.contacts,
  public.tasks,
  public.invoices,
  public.invoice_lines,
  public.documents,
  public.activity_log,
  public.email_connections,
  public.ai_events,
  public.idempotency_keys,
  public.processing_jobs,
  public.company_accounting_settings,
  public.accounting_accounts,
  public.fiscal_years,
  public.accounting_periods,
  public.vat_codes,
  public.posting_rules,
  public.business_events,
  public.bookkeeping_drafts,
  public.source_documents,
  public.journal_series_counters,
  public.journal_entries,
  public.journal_lines,
  public.bank_transactions,
  public.reconciliation_matches,
  public.correction_links,
  public.audit_events,
  public.document_facts,
  public.integration_connections,
  public.external_event_receipts
from anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, update on table public.organizations to authenticated;
grant select, insert, update, delete on table
  public.organization_members,
  public.customers,
  public.contacts,
  public.tasks,
  public.invoices,
  public.invoice_lines,
  public.documents,
  public.email_connections
to authenticated;
grant select, insert on table
  public.activity_log,
  public.ai_events,
  public.idempotency_keys
to authenticated;

grant select (
  id, organization_id, type, status, user_message, attempt_count, max_attempts,
  available_at, started_at, finished_at, cancel_requested_at, created_at, updated_at
) on public.processing_jobs to authenticated;

grant select on table
  public.company_accounting_settings,
  public.accounting_accounts,
  public.fiscal_years,
  public.accounting_periods,
  public.business_events,
  public.bookkeeping_drafts,
  public.journal_entries,
  public.journal_lines,
  public.source_documents,
  public.document_facts
to authenticated;

grant select (
  id, organization_id, category, provider, status, display_name,
  configuration_version, health_status, connected_by, connected_at,
  last_health_checked_at, created_at, updated_at
) on public.integration_connections to authenticated;
