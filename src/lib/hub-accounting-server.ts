import "server-only";

import { hasAccountingCapability } from "./hub/accounting/access.ts";
import { hubFeatureFlags } from "./hub/feature-flags.ts";
import { requireHubContext } from "./hub-server.ts";

type QueryError = {
  code?: string;
  message?: string;
} | null;

const missingAccountingSchemaCodes = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

function isMissingAccountingSchema(errors: QueryError[]) {
  return errors.some(
    (error) => error?.code && missingAccountingSchemaCodes.has(error.code),
  );
}

export async function getAccountingOverview() {
  const { supabase, organization, membership } = await requireHubContext();
  const runtimeEnabled =
    hubFeatureFlags.accounting && hubFeatureFlags.safeMutations;
  const permissions = {
    canView: hasAccountingCapability(membership.role, "view"),
    canCreateDraft: hasAccountingCapability(membership.role, "create_draft"),
    canApproveDraft: hasAccountingCapability(membership.role, "approve_draft"),
    canPostJournal: hasAccountingCapability(membership.role, "post_journal"),
    canConfigure: hasAccountingCapability(membership.role, "configure"),
  };
  const emptyOverview = {
    organization,
    role: membership.role,
    featureFlags: {
      accounting: hubFeatureFlags.accounting,
      safeMutations: hubFeatureFlags.safeMutations,
    },
    runtimeEnabled,
    databaseReady: false,
    permissions,
    settings: null,
    accounts: [],
    fiscalYears: [],
    periods: [],
    events: [],
    drafts: [],
    journalEntries: [],
    stats: {
      needsReview: 0,
      readyToPost: 0,
      posted: 0,
      openPeriods: 0,
    },
  };

  if (!runtimeEnabled) {
    return emptyOverview;
  }

  const [
    settingsResult,
    accountsResult,
    fiscalYearsResult,
    periodsResult,
    eventsResult,
    draftsResult,
    journalEntriesResult,
    needsReviewResult,
    readyToPostResult,
    postedResult,
    openPeriodsResult,
  ] = await Promise.all([
    supabase
      .from("company_accounting_settings")
      .select(
        "organization_id, company_form, accounting_method, reporting_currency, vat_registered, vat_period, fiscal_year_start_month, accounting_enabled, created_at, updated_at",
      )
      .eq("organization_id", organization.id)
      .maybeSingle(),
    supabase
      .from("accounting_accounts")
      .select("id, organization_id, account_number, name, kind, is_active, source, review_required, created_at, updated_at")
      .eq("organization_id", organization.id)
      .eq("is_active", true)
      .order("account_number", { ascending: true })
      .limit(30),
    supabase
      .from("fiscal_years")
      .select("id, organization_id, starts_on, ends_on, status, created_at, updated_at")
      .eq("organization_id", organization.id)
      .order("starts_on", { ascending: false })
      .limit(3),
    supabase
      .from("accounting_periods")
      .select("id, organization_id, fiscal_year_id, starts_on, ends_on, status, created_at, updated_at")
      .eq("organization_id", organization.id)
      .order("starts_on", { ascending: false })
      .limit(18),
    supabase
      .from("business_events")
      .select("id, organization_id, event_type, status, happened_on, amount_minor, currency, facts, source_entity_type, source_entity_id, created_by, posted_journal_entry_id, client_request_key, request_hash, created_at, updated_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("bookkeeping_drafts")
      .select("id, organization_id, business_event_id, status, posting_rule_id, posting_rule_version, explanation, lines_json, warnings, created_by, approved_by, approved_at, created_at, updated_at")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("journal_entries")
      .select("id, organization_id, fiscal_year_id, accounting_period_id, business_event_id, source_document_id, idempotency_key_id, journal_series, journal_number, posted_on, description, posting_rule_id, posting_rule_version, created_by, approved_by, created_at")
      .eq("organization_id", organization.id)
      .order("posted_on", { ascending: false })
      .limit(25),
    supabase
      .from("bookkeeping_drafts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "needs_review"),
    supabase
      .from("bookkeeping_drafts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "ready_to_post"),
    supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id),
    supabase
      .from("accounting_periods")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("status", "open"),
  ]);

  const errors = [
    settingsResult.error,
    accountsResult.error,
    fiscalYearsResult.error,
    periodsResult.error,
    eventsResult.error,
    draftsResult.error,
    journalEntriesResult.error,
    needsReviewResult.error,
    readyToPostResult.error,
    postedResult.error,
    openPeriodsResult.error,
  ];
  const firstError = errors.find(Boolean);

  if (firstError) {
    if (isMissingAccountingSchema(errors)) {
      return emptyOverview;
    }

    throw firstError;
  }

  return {
    ...emptyOverview,
    databaseReady: true,
    settings: settingsResult.data,
    accounts: accountsResult.data ?? [],
    fiscalYears: fiscalYearsResult.data ?? [],
    periods: periodsResult.data ?? [],
    events: eventsResult.data ?? [],
    drafts: draftsResult.data ?? [],
    journalEntries: journalEntriesResult.data ?? [],
    stats: {
      needsReview: needsReviewResult.count ?? 0,
      readyToPost: readyToPostResult.count ?? 0,
      posted: postedResult.count ?? 0,
      openPeriods: openPeriodsResult.count ?? 0,
    },
  };
}
