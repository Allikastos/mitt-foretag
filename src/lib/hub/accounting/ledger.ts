import { validatePostingLines } from "./validation.ts";
import type {
  AccountingEventInput,
  JournalLineDraft,
  PostingResult,
} from "./types.ts";

export type PostedJournalEntry = Readonly<{
  id: string;
  organizationId: string;
  businessEventId: string;
  idempotencyKey: string;
  ruleId: string;
  ruleVersion: number;
  postedAt: string;
  lines: ReadonlyArray<Readonly<JournalLineDraft>>;
}>;

export function postBookkeepingDraft(params: {
  entryId: string;
  event: AccountingEventInput;
  draft: PostingResult;
  idempotencyKey: string;
  periodLocked: boolean;
  existingEntries: PostedJournalEntry[];
  postedAt: string;
}) {
  const replay = params.existingEntries.find(
    (entry) =>
      entry.organizationId === params.event.organizationId &&
      entry.idempotencyKey === params.idempotencyKey,
  );

  if (replay) return replay;

  if (
    params.existingEntries.some(
      (entry) =>
        entry.organizationId === params.event.organizationId &&
        entry.businessEventId === params.event.id,
    )
  ) {
    throw new Error("Affärshändelsen är redan bokförd.");
  }

  if (params.periodLocked) {
    throw new Error("Bokföringsperioden är låst.");
  }

  if (
    params.event.companyForm !== "sole_trader" ||
    params.event.accountingMethod !== "cash_basis" ||
    params.event.currency !== "SEK"
  ) {
    throw new Error("Företagskonfigurationen stöds inte ännu.");
  }

  const validation = validatePostingLines(params.draft.lines);
  if (!validation.ok || params.draft.confidence === "red") {
    throw new Error(validation.errors.join(" ") || "Utkastet får inte bokföras.");
  }

  const lines = params.draft.lines.map((line) => Object.freeze({ ...line }));
  return Object.freeze({
    id: params.entryId,
    organizationId: params.event.organizationId,
    businessEventId: params.event.id,
    idempotencyKey: params.idempotencyKey,
    ruleId: params.draft.ruleId,
    ruleVersion: params.draft.ruleVersion,
    postedAt: params.postedAt,
    lines: Object.freeze(lines),
  });
}

export function assertJournalEntryMutable(entry: PostedJournalEntry) {
  void entry;
  throw new Error("Bokförda verifikationer är oföränderliga. Skapa en rättelse.");
}

export function linkCorrection(params: {
  original: PostedJournalEntry;
  correction: PostedJournalEntry;
  reason: string;
}) {
  if (params.original.organizationId !== params.correction.organizationId) {
    throw new Error("Rättelsen måste tillhöra samma företag som originalet.");
  }

  if (params.original.id === params.correction.id) {
    throw new Error("En verifikation kan inte rätta sig själv.");
  }

  if (!params.reason.trim()) {
    throw new Error("Rättelsen måste ha en anledning.");
  }

  return Object.freeze({
    organizationId: params.original.organizationId,
    originalEntryId: params.original.id,
    correctionEntryId: params.correction.id,
    reason: params.reason.trim(),
  });
}
