"use server";

import { revalidatePath } from "next/cache";
import {
  requireAccountingCapability,
} from "@/src/lib/hub/accounting/access";
import {
  buildManualDocumentReview,
  requireDocumentCapability,
} from "@/src/lib/hub/documents";
import { hubFeatureFlags } from "@/src/lib/hub/feature-flags";
import { normalizeIdempotencyKey } from "@/src/lib/hub/idempotency";
import { logHubActivity, requireHubContext } from "@/src/lib/hub-server";

function requireString(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} måste fyllas i.`);
  }

  return value.trim();
}

function optionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requireDocumentRuntime() {
  if (!hubFeatureFlags.documentProcessing || !hubFeatureFlags.safeMutations) {
    throw new Error("Dokumentgranskning är fortfarande i förhandsläge.");
  }
}

function minorToSekInput(amountMinor: number) {
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Dokumentet innehåller ett ogiltigt belopp.");
  }

  return (amountMinor / 100).toFixed(2);
}

export async function saveDocumentFactsAction(formData: FormData) {
  requireDocumentRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireDocumentCapability(membership.role, "edit_facts");
  const documentId = requireString(formData.get("document_id"), "Dokument");
  const documentResult = await supabase
    .from("documents")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("id", documentId)
    .maybeSingle();

  if (documentResult.error || !documentResult.data) {
    throw documentResult.error ?? new Error("Dokumentet tillhör inte det aktiva företaget.");
  }

  const review = buildManualDocumentReview({
    documentId,
    organizationId: organization.id,
    documentKind: requireString(formData.get("document_kind"), "Dokumenttyp"),
    supplierName: requireString(formData.get("supplier_name"), "Leverantör"),
    supplierOrgNumber: optionalString(formData.get("supplier_org_number")) ?? "",
    documentNumber: optionalString(formData.get("document_number")) ?? "",
    documentDate: requireString(formData.get("document_date"), "Dokumentdatum"),
    paymentDate: requireString(formData.get("payment_date"), "Betaldatum"),
    totalSek: requireString(formData.get("total_sek"), "Totalbelopp"),
    vatSek: requireString(formData.get("vat_sek"), "Momsbelopp"),
    description: requireString(formData.get("description"), "Beskrivning"),
    suggestedEventType: requireString(
      formData.get("suggested_event_type"),
      "Affärshändelse",
    ),
  });
  const { facts } = review;
  const { data, error } = await supabase.rpc("save_document_facts", {
    target_organization_id: organization.id,
    target_document_id: documentId,
    target_document_kind: facts.documentKind,
    target_supplier_name: facts.supplierName,
    target_supplier_org_number: facts.supplierOrgNumber,
    target_document_number: facts.documentNumber,
    target_document_date: facts.documentDate,
    target_payment_date: facts.paymentDate,
    target_total_minor: facts.totalMinor,
    target_vat_minor: facts.vatMinor,
    target_description: facts.description,
    target_suggested_event_type: facts.suggestedEventType,
    target_payment_account: facts.paymentAccount,
  });

  if (error || !data) {
    throw error ?? new Error("Dokumentuppgifterna kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "document_facts_saved",
    entityType: "document",
    entityId: documentId,
    description: `Manuella uppgifter sparades för ${facts.supplierName}.`,
  });
  revalidatePath("/hub/dokument");
  revalidatePath(`/hub/dokument/${documentId}`);
}

export async function createDocumentAccountingDraftAction(formData: FormData) {
  requireDocumentRuntime();

  if (!hubFeatureFlags.accounting) {
    throw new Error("Bokföringsflödet är inte aktiverat.");
  }

  const { supabase, organization, membership, user } = await requireHubContext();
  requireDocumentCapability(membership.role, "create_accounting_draft");
  requireAccountingCapability(membership.role, "create_draft");
  const documentId = requireString(formData.get("document_id"), "Dokument");
  const sourceResult = await supabase
    .from("source_documents")
    .select("id, business_event_id")
    .eq("organization_id", organization.id)
    .eq("document_id", documentId)
    .maybeSingle();

  if (sourceResult.error || !sourceResult.data) {
    throw sourceResult.error ?? new Error("Spara dokumentuppgifterna först.");
  }
  if (sourceResult.data.business_event_id) {
    throw new Error("Dokumentet är redan kopplat till ett bokföringsutkast.");
  }

  const factsResult = await supabase
    .from("document_facts")
    .select(
      "id, document_kind, review_status, supplier_name, supplier_org_number, document_number, document_date, payment_date, total_minor, vat_minor, description, suggested_event_type, revision",
    )
    .eq("organization_id", organization.id)
    .eq("source_document_id", sourceResult.data.id)
    .maybeSingle();

  if (factsResult.error || !factsResult.data) {
    throw factsResult.error ?? new Error("Dokumentet saknar granskade uppgifter.");
  }
  if (factsResult.data.review_status !== "ready_for_review") {
    throw new Error("Dokumentuppgifterna är inte redo att kopplas.");
  }

  const review = buildManualDocumentReview({
    documentId,
    organizationId: organization.id,
    documentKind: factsResult.data.document_kind,
    supplierName: factsResult.data.supplier_name,
    supplierOrgNumber: factsResult.data.supplier_org_number ?? "",
    documentNumber: factsResult.data.document_number ?? "",
    documentDate: factsResult.data.document_date,
    paymentDate: factsResult.data.payment_date,
    totalSek: minorToSekInput(factsResult.data.total_minor),
    vatSek: minorToSekInput(factsResult.data.vat_minor),
    description: factsResult.data.description,
    suggestedEventType: factsResult.data.suggested_event_type,
  });

  if (review.posting.confidence === "red" || !review.posting.lines.length) {
    throw new Error("Dokumentet kunde inte skapa ett säkert konteringsutkast.");
  }

  const clientRequestKey = normalizeIdempotencyKey(
    `document-${documentId}-revision-${factsResult.data.revision}`,
  );
  const draftResult = await supabase.rpc("save_bookkeeping_draft", {
    target_organization_id: organization.id,
    target_client_request_key: clientRequestKey,
    target_event_type: review.facts.suggestedEventType,
    target_happened_on: review.facts.paymentDate,
    target_amount_minor: review.facts.totalMinor,
    target_description: review.facts.description,
    target_facts: {
      documentId,
      sourceDocumentId: sourceResult.data.id,
      supplierName: review.facts.supplierName,
      supplierOrgNumber: review.facts.supplierOrgNumber,
      documentNumber: review.facts.documentNumber,
      documentDate: review.facts.documentDate,
      paymentDate: review.facts.paymentDate,
      totalMinor: review.facts.totalMinor,
      vatMinor: review.facts.vatMinor,
      description: review.facts.description,
      extractionMethod: "manual",
    },
    target_posting_rule_id: review.posting.ruleId,
    target_posting_rule_version: review.posting.ruleVersion,
    target_lines: review.posting.lines,
    target_warnings: [
      ...review.posting.warnings,
      "Utkastet bygger på manuellt granskade dokumentuppgifter.",
    ],
  });

  if (draftResult.error || !draftResult.data) {
    throw draftResult.error ?? new Error("Konteringsutkastet kunde inte skapas.");
  }

  const linkResult = await supabase.rpc("link_source_document_to_draft", {
    target_organization_id: organization.id,
    target_document_id: documentId,
    target_draft_id: draftResult.data,
  });

  if (linkResult.error) throw linkResult.error;

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "document_linked_to_bookkeeping_draft",
    entityType: "bookkeeping_draft",
    entityId: draftResult.data,
    description: `Dokument från ${review.facts.supplierName} kopplades till ett konteringsutkast.`,
  });
  revalidatePath("/hub/dokument");
  revalidatePath(`/hub/dokument/${documentId}`);
  revalidatePath("/hub/bokforing");
}
