import "server-only";

import { notFound } from "next/navigation";
import { hasAccountingCapability } from "./hub/accounting/access.ts";
import { hasDocumentCapability } from "./hub/documents/access.ts";
import { hubFeatureFlags } from "./hub/feature-flags.ts";
import { SupabaseStorageProvider } from "./hub/providers/supabase-storage-provider.ts";
import { requireHubContext } from "./hub-server.ts";

type QueryError = {
  code?: string;
  message?: string;
} | null;

const missingDocumentSchemaCodes = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

function isMissingDocumentSchema(error: QueryError) {
  return Boolean(error?.code && missingDocumentSchemaCodes.has(error.code));
}

export async function getDocumentReviewSummaries(documentIds: string[]) {
  const { supabase, organization } = await requireHubContext();
  const runtimeEnabled =
    hubFeatureFlags.documentProcessing && hubFeatureFlags.safeMutations;

  if (!runtimeEnabled || !documentIds.length) {
    return {
      runtimeEnabled,
      databaseReady: false,
      summaries: {} as Record<
        string,
        { reviewStatus: string; ocrStatus: string; linked: boolean }
      >,
    };
  }

  const sourceResult = await supabase
    .from("source_documents")
    .select("id, document_id, business_event_id, processing_status")
    .eq("organization_id", organization.id)
    .in("document_id", documentIds);

  if (sourceResult.error) {
    if (isMissingDocumentSchema(sourceResult.error)) {
      return { runtimeEnabled, databaseReady: false, summaries: {} };
    }
    throw sourceResult.error;
  }

  const sources = sourceResult.data ?? [];
  const sourceIds = sources.map((source) => source.id);
  const factsResult = sourceIds.length
    ? await supabase
        .from("document_facts")
        .select("source_document_id, review_status, ocr_status")
        .eq("organization_id", organization.id)
        .in("source_document_id", sourceIds)
    : { data: [], error: null };

  if (factsResult.error) {
    if (isMissingDocumentSchema(factsResult.error)) {
      return { runtimeEnabled, databaseReady: false, summaries: {} };
    }
    throw factsResult.error;
  }

  const factsBySourceId = new Map(
    (factsResult.data ?? []).map((facts) => [facts.source_document_id, facts]),
  );
  const summaries: Record<
    string,
    { reviewStatus: string; ocrStatus: string; linked: boolean }
  > = {};

  for (const source of sources) {
    const facts = factsBySourceId.get(source.id);
    summaries[source.document_id] = {
      reviewStatus: facts?.review_status ?? "incomplete",
      ocrStatus: facts?.ocr_status ?? "not_requested",
      linked: Boolean(source.business_event_id),
    };
  }

  return { runtimeEnabled, databaseReady: true, summaries };
}

export async function getDocumentWorkspace(documentId: string) {
  const { supabase, organization, membership } = await requireHubContext();
  const documentRuntimeEnabled =
    hubFeatureFlags.documentProcessing && hubFeatureFlags.safeMutations;
  const accountingRuntimeEnabled =
    documentRuntimeEnabled && hubFeatureFlags.accounting;
  const permissions = {
    canEditFacts: hasDocumentCapability(membership.role, "edit_facts"),
    canCreateAccountingDraft:
      hasDocumentCapability(membership.role, "create_accounting_draft") &&
      hasAccountingCapability(membership.role, "create_draft"),
  };
  const documentResult = await supabase
    .from("documents")
    .select(
      "id, organization_id, customer_id, invoice_id, file_name, file_path, mime_type, size_bytes, category, notes, uploaded_by, created_at, updated_at",
    )
    .eq("organization_id", organization.id)
    .eq("id", documentId)
    .maybeSingle();

  if (documentResult.error) throw documentResult.error;
  if (!documentResult.data) notFound();

  const document = documentResult.data;
  const storage = new SupabaseStorageProvider(supabase);
  const signedUrl = await storage
    .getAuthorizedUrl({
      organizationId: organization.id,
      key: document.file_path,
      expiresInSeconds: 60 * 30,
    })
    .catch(() => null);
  const emptyWorkspace = {
    organization,
    role: membership.role,
    document: { ...document, signedUrl },
    documentRuntimeEnabled,
    accountingRuntimeEnabled,
    databaseReady: false,
    accountingConfigured: false,
    permissions,
    sourceDocument: null,
    facts: null,
    linkedDraft: null,
    linkedEvent: null,
  };

  if (!documentRuntimeEnabled) return emptyWorkspace;

  const sourceResult = await supabase
    .from("source_documents")
    .select(
      "id, organization_id, document_id, business_event_id, processing_status, created_by, created_at, updated_at",
    )
    .eq("organization_id", organization.id)
    .eq("document_id", document.id)
    .maybeSingle();

  if (sourceResult.error) {
    if (isMissingDocumentSchema(sourceResult.error)) return emptyWorkspace;
    throw sourceResult.error;
  }

  const sourceDocument = sourceResult.data;
  const factsResult = sourceDocument
    ? await supabase
        .from("document_facts")
        .select(
          "id, organization_id, source_document_id, document_kind, review_status, extraction_method, ocr_status, ocr_provider, supplier_name, supplier_org_number, document_number, document_date, payment_date, total_minor, vat_minor, currency, description, suggested_event_type, payment_account, revision, created_by, updated_by, created_at, updated_at",
        )
        .eq("organization_id", organization.id)
        .eq("source_document_id", sourceDocument.id)
        .maybeSingle()
    : { data: null, error: null };

  if (factsResult.error) {
    if (isMissingDocumentSchema(factsResult.error)) return emptyWorkspace;
    throw factsResult.error;
  }

  const settingsResult = accountingRuntimeEnabled
    ? await supabase
        .from("company_accounting_settings")
        .select("accounting_enabled, company_form, accounting_method, reporting_currency")
        .eq("organization_id", organization.id)
        .maybeSingle()
    : { data: null, error: null };

  if (settingsResult.error) {
    if (isMissingDocumentSchema(settingsResult.error)) return emptyWorkspace;
    throw settingsResult.error;
  }

  const accountingConfigured = Boolean(
    settingsResult.data?.accounting_enabled &&
      settingsResult.data.company_form === "sole_trader" &&
      settingsResult.data.accounting_method === "cash_basis" &&
      settingsResult.data.reporting_currency === "SEK",
  );
  const eventResult = sourceDocument?.business_event_id
    ? await supabase
        .from("business_events")
        .select("id, event_type, status, happened_on, amount_minor, currency, facts")
        .eq("organization_id", organization.id)
        .eq("id", sourceDocument.business_event_id)
        .maybeSingle()
    : { data: null, error: null };

  if (eventResult.error) throw eventResult.error;

  const draftResult = sourceDocument?.business_event_id
    ? await supabase
        .from("bookkeeping_drafts")
        .select("id, business_event_id, status, posting_rule_id, posting_rule_version, explanation, warnings")
        .eq("organization_id", organization.id)
        .eq("business_event_id", sourceDocument.business_event_id)
        .maybeSingle()
    : { data: null, error: null };

  if (draftResult.error) throw draftResult.error;

  return {
    ...emptyWorkspace,
    databaseReady: true,
    accountingConfigured,
    sourceDocument,
    facts: factsResult.data,
    linkedDraft: draftResult.data,
    linkedEvent: eventResult.data,
  };
}
