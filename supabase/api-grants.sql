-- Explicit Data API privileges. RLS remains the row-level authorization layer.
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
from anon;

revoke insert on table public.organizations from authenticated;

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

-- Later phase migrations narrow authenticated access to workflow-safe columns
-- and functions. Service-role access is explicit for local integration workers.
grant all on table
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
to service_role;
