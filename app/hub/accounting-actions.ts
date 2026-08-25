"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  accountingEventTypes,
  buildManualPostingResult,
  buildAccountingEventInput,
  createBookkeepingDraft,
  requireAccountingCapability,
  type SupportedBusinessEventType,
} from "@/src/lib/hub/accounting";
import { getCatalogAccount } from "@/src/lib/hub/accounting/catalog";
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

function parseManualLines(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length > 25_000) {
    throw new Error("Konteringsraderna är ogiltiga.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Konteringsraderna kunde inte läsas.");
  }

  if (!Array.isArray(parsed)) throw new Error("Konteringsraderna är ogiltiga.");
  return parsed.map((line) => {
    if (!line || typeof line !== "object") throw new Error("En konteringsrad är ogiltig.");
    const candidate = line as Record<string, unknown>;
    return {
      accountNumber: String(candidate.accountNumber ?? ""),
      side: String(candidate.side ?? "") as "debit" | "credit",
      amountSek: String(candidate.amountSek ?? ""),
      description: String(candidate.description ?? ""),
    };
  });
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

export async function saveManualBookkeepingDraftAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "create_draft");
  const postedOn = requireString(formData.get("posted_on"), "Verifikationsdatum");
  const description = requireString(formData.get("description"), "Beskrivning");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(postedOn) || description.length > 500) {
    throw new Error("Datum eller beskrivning är ogiltig.");
  }

  const { data: activeAccounts, error: accountsError } = await supabase
    .from("accounting_accounts")
    .select("account_number, name, kind, review_required")
    .eq("organization_id", organization.id)
    .eq("is_active", true)
    .limit(2_000);
  if (accountsError) throw new Error("Företagets kontoplan kunde inte läsas.");

  const draft = buildManualPostingResult(
    parseManualLines(formData.get("lines_json")),
    (activeAccounts ?? []).map((item) => ({
      number: item.account_number,
      name: item.name,
      kind: item.kind,
      reviewRequired: item.review_required,
    })),
  );
  const totalAmountMinor = draft.lines
    .filter((line) => line.side === "debit")
    .reduce((sum, line) => sum + line.amountMinor, 0);
  const clientRequestKey = normalizeIdempotencyKey(
    requireString(formData.get("client_request_key"), "Förfrågningsnyckel"),
  );
  const entryType = formData.get("entry_type") === "opening_balance" ? "opening_balance" : "manual_journal_entry";
  const rpcResult = entryType === "opening_balance"
    ? await supabase.rpc("save_special_bookkeeping_draft", {
      target_organization_id: organization.id,
      target_client_request_key: `opening-${clientRequestKey}`,
      target_happened_on: postedOn,
      target_amount_minor: totalAmountMinor,
      target_description: description,
      target_lines: draft.lines,
      target_note: typeof formData.get("note") === "string" ? String(formData.get("note")).trim().slice(0, 500) : null,
      target_event_type: "opening_balance",
      target_original_journal_entry_id: null,
      target_reason: null,
    })
    : await supabase.rpc("save_manual_bookkeeping_draft", {
    target_organization_id: organization.id,
    target_client_request_key: clientRequestKey,
    target_happened_on: postedOn,
    target_amount_minor: totalAmountMinor,
    target_description: description,
    target_lines: draft.lines,
    target_note: typeof formData.get("note") === "string" ? String(formData.get("note")).trim().slice(0, 500) : null,
  });
  const { data, error } = rpcResult;
  if (error || !data) throw new Error("Det manuella bokföringsutkastet kunde inte sparas.");

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "manual_bookkeeping_draft_created",
    entityType: "bookkeeping_draft",
    entityId: data,
    description: entryType === "opening_balance" ? "En ingående balans sparades för granskning." : "En manuell verifikation sparades för granskning.",
  });
  revalidatePath("/hub/bokforing");
}

export async function lockAccountingPeriodAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "configure");
  const periodId = requireString(formData.get("period_id"), "Period");
  const { error } = await supabase.rpc("lock_accounting_period", {
    target_organization_id: organization.id,
    target_period_id: periodId,
  });
  if (error) throw new Error("Perioden kunde inte låsas. Kontrollera att alla utkast är hanterade.");
  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "accounting_period_locked",
    entityType: "accounting_period",
    entityId: periodId,
    description: "En bokföringsperiod låstes.",
  });
  revalidatePath("/hub/bokforing");
}

export async function createCorrectionDraftAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "configure");
  const journalEntryId = requireString(formData.get("journal_entry_id"), "Originalverifikation");
  const happenedOn = requireString(formData.get("happened_on"), "Rättelsedatum");
  const reason = requireString(formData.get("reason"), "Anledning");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(happenedOn) || reason.length > 500) {
    throw new Error("Rättelsedatum eller anledning är ogiltig.");
  }
  const [{ data: entry, error: entryError }, { data: originalLines, error: linesError }] = await Promise.all([
    supabase.from("journal_entries").select("id, description").eq("organization_id", organization.id).eq("id", journalEntryId).maybeSingle(),
    supabase.from("journal_lines").select("account_number, debit_minor, credit_minor, description").eq("organization_id", organization.id).eq("journal_entry_id", journalEntryId),
  ]);
  if (entryError || linesError || !entry || !originalLines?.length) throw new Error("Originalverifikationen kunde inte läsas.");
  const lines = originalLines.map((line) => ({
    accountNumber: line.account_number,
    accountName: line.account_number,
    side: line.debit_minor > 0 ? "credit" as const : "debit" as const,
    amountMinor: line.debit_minor || line.credit_minor,
    vatCode: null,
    description: line.description ?? `Rättelse av ${entry.description}`,
  }));
  const totalAmountMinor = lines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amountMinor, 0);
  const { data, error } = await supabase.rpc("save_special_bookkeeping_draft", {
    target_organization_id: organization.id,
    target_client_request_key: normalizeIdempotencyKey(`correction-${journalEntryId}`),
    target_happened_on: happenedOn,
    target_amount_minor: totalAmountMinor,
    target_description: `Rättelse av ${entry.description}`.slice(0, 500),
    target_lines: lines,
    target_note: reason,
    target_event_type: "correction_entry",
    target_original_journal_entry_id: journalEntryId,
    target_reason: reason,
  });
  if (error || !data) throw new Error("Rättelseutkastet kunde inte skapas.");
  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "correction_draft_created",
    entityType: "bookkeeping_draft",
    entityId: data,
    description: "Ett rättelseutkast skapades från en bokförd verifikation.",
  });
  revalidatePath("/hub/bokforing");
}

export async function activateAccountingAccountAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "configure");
  const accountNumber = requireString(formData.get("account_number"), "Konto");
  const selected = getCatalogAccount(accountNumber);
  if (!selected) throw new Error("Kontot finns inte i den granskade startkatalogen.");

  const { error } = await supabase.rpc("activate_accounting_account", {
    target_organization_id: organization.id,
    target_account_number: selected.number,
    target_name: selected.name,
    target_kind: selected.kind,
  });
  if (error) throw new Error("Kontot kunde inte läggas till i företagets kontoplan.");

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "accounting_account_activated",
    entityType: "accounting_account",
    entityId: organization.id,
    description: `Konto ${selected.number} lades till i kontoplanen.`,
  });
  revalidatePath("/hub/bokforing");
}

export async function createCustomAccountingAccountAction(formData: FormData) {
  requireAccountingRuntime();
  const { supabase, organization, membership, user } = await requireHubContext();
  requireAccountingCapability(membership.role, "configure");
  const accountNumber = requireString(formData.get("account_number"), "Kontonummer");
  const name = requireString(formData.get("account_name"), "Kontonamn");
  const kind = requireString(formData.get("account_kind"), "Kontotyp");
  const allowedKinds = new Set(["asset", "liability", "equity", "income", "expense"]);

  if (!/^\d{4}$/.test(accountNumber) || name.length > 120 || !allowedKinds.has(kind)) {
    throw new Error("Kontonummer, namn eller kontotyp är ogiltig.");
  }

  const { error } = await supabase.rpc("activate_accounting_account", {
    target_organization_id: organization.id,
    target_account_number: accountNumber,
    target_name: name,
    target_kind: kind as "asset" | "liability" | "equity" | "income" | "expense",
  });
  if (error) throw new Error("Det egna kontot kunde inte läggas till i kontoplanen.");

  await logHubActivity({
    organizationId: organization.id,
    userId: user.id,
    action: "custom_accounting_account_created",
    entityType: "accounting_account",
    entityId: organization.id,
    description: `Eget konto ${accountNumber} lades till i kontoplanen.`,
  });
  revalidatePath("/hub/bokforing");
}
