"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  accountingEventTypes,
  buildAccountingEventInput,
  createBookkeepingDraft,
  requireAccountingCapability,
  type SupportedBusinessEventType,
} from "@/src/lib/hub/accounting";
import { hubFeatureFlags } from "@/src/lib/hub/feature-flags";
import { normalizeIdempotencyKey } from "@/src/lib/hub/idempotency";
import { logHubActivity, requireHubContext } from "@/src/lib/hub-server";

function requireAccountingRuntime() {
  if (!hubFeatureFlags.accounting || !hubFeatureFlags.safeMutations) {
    throw new Error("Bokföring är fortfarande i förhandsläge och kan inte sparas.");
  }
}

function requireString(value: FormDataEntryValue | null, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} måste fyllas i.`);
  }

  return value.trim();
}

function parseEventType(value: FormDataEntryValue | null) {
  const eventType = requireString(value, "Händelse");

  if (!accountingEventTypes.includes(eventType as SupportedBusinessEventType)) {
    throw new Error("Händelsetypen stöds inte i den här bokföringsversionen.");
  }

  return eventType as SupportedBusinessEventType;
}

export async function initializeAccountingMvpAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "configure");

  const fiscalYear = Number(requireString(formData.get("fiscal_year"), "Räkenskapsår"));

  if (!Number.isInteger(fiscalYear) || fiscalYear < 2000 || fiscalYear > 2100) {
    throw new Error("Räkenskapsåret är ogiltigt.");
  }

  const { data, error } = await supabase.rpc("initialize_accounting_mvp", {
    target_organization_id: organization.id,
    target_fiscal_year_start: `${fiscalYear}-01-01`,
    target_fiscal_year_end: `${fiscalYear}-12-31`,
  });

  if (error || !data) {
    throw new Error("Bokföringsgrunden kunde inte skapas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "accounting_initialized",
    entityType: "fiscal_year",
    entityId: data,
    description: `Bokföringsgrunden för ${fiscalYear} skapades.`,
  });
  revalidatePath("/hub/bokforing");
}

export async function saveBookkeepingDraftAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "create_draft");

  const event = buildAccountingEventInput({
    id: randomUUID(),
    organizationId: organization.id,
    type: parseEventType(formData.get("event_type")),
    happenedAt: requireString(formData.get("happened_on"), "Datum"),
    amountSek: requireString(formData.get("amount_sek"), "Belopp"),
    description: requireString(formData.get("description"), "Beskrivning"),
    paymentAccount:
      typeof formData.get("payment_account") === "string"
        ? String(formData.get("payment_account"))
        : null,
    counterAccount:
      typeof formData.get("counter_account") === "string"
        ? String(formData.get("counter_account"))
        : null,
  });
  const draft = createBookkeepingDraft(event);

  if (draft.confidence === "red" || !draft.lines.length) {
    throw new Error("Händelsen kunde inte skapa ett säkert konteringsutkast.");
  }

  const clientRequestKey = normalizeIdempotencyKey(
    requireString(formData.get("client_request_key"), "Förfrågningsnyckel"),
  );
  const { data, error } = await supabase.rpc("save_bookkeeping_draft", {
    target_organization_id: organization.id,
    target_client_request_key: clientRequestKey,
    target_event_type: event.type,
    target_happened_on: event.happenedAt,
    target_amount_minor: event.totalAmountMinor,
    target_description: event.description,
    target_facts: {
      description: event.description,
      paymentAccount: event.paymentAccount ?? null,
      counterAccount: event.counterAccount ?? null,
      confidence: draft.confidence,
    },
    target_posting_rule_id: draft.ruleId,
    target_posting_rule_version: draft.ruleVersion,
    target_lines: draft.lines,
    target_warnings: draft.warnings,
  });

  if (error || !data) {
    throw new Error("Bokföringsutkastet kunde inte sparas.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "bookkeeping_draft_created",
    entityType: "bookkeeping_draft",
    entityId: data,
    description: "Ett konteringsutkast skapades för granskning.",
  });
  revalidatePath("/hub/bokforing");
}

export async function approveBookkeepingDraftAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "approve_draft");
  const draftId = requireString(formData.get("draft_id"), "Utkast");
  const { error } = await supabase.rpc("approve_bookkeeping_draft", {
    target_organization_id: organization.id,
    target_draft_id: draftId,
  });

  if (error) throw new Error("Bokföringsutkastet kunde inte godkännas.");

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "bookkeeping_draft_approved",
    entityType: "bookkeeping_draft",
    entityId: draftId,
    description: "Ett konteringsutkast godkändes för bokföring.",
  });
  revalidatePath("/hub/bokforing");
}

export async function postBookkeepingDraftAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "post_journal");
  const draftId = requireString(formData.get("draft_id"), "Utkast");
  const { data, error } = await supabase.rpc("post_bookkeeping_draft", {
    target_organization_id: organization.id,
    target_draft_id: draftId,
    target_idempotency_key: normalizeIdempotencyKey(`post-draft-${draftId}`),
    target_journal_series: "A",
  });

  if (error || !data) {
    throw new Error("Utkastet kunde inte bokföras.");
  }

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "journal_entry_posted",
    entityType: "journal_entry",
    entityId: data,
    description: "En verifierad verifikation bokfördes i serie A.",
  });
  revalidatePath("/hub/bokforing");
}
