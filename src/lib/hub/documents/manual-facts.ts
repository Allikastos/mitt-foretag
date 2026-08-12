import {
  buildAccountingEventInput,
  createBookkeepingDraft,
  parseSekToMinor,
  splitVatInclusiveAmount,
  type PostingResult,
  type SupportedBusinessEventType,
} from "../accounting/index.ts";

export const manualDocumentKinds = ["receipt", "supplier_invoice"] as const;
export type ManualDocumentKind = (typeof manualDocumentKinds)[number];

export const documentPurchaseEventTypes = [
  "paid_domestic_purchase_25_vat",
  "purchase_without_deductible_vat",
] as const satisfies readonly SupportedBusinessEventType[];
export type DocumentPurchaseEventType = (typeof documentPurchaseEventTypes)[number];

export type ManualDocumentFactsInput = {
  documentKind: ManualDocumentKind;
  supplierName: string;
  supplierOrgNumber: string | null;
  documentNumber: string | null;
  documentDate: string;
  paymentDate: string;
  totalMinor: number;
  vatMinor: number;
  currency: "SEK";
  description: string;
  suggestedEventType: DocumentPurchaseEventType;
  paymentAccount: "1930";
};

export type ManualDocumentReview = {
  facts: ManualDocumentFactsInput;
  posting: PostingResult;
};

function isIsoCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function optionalText(value: string) {
  return value.trim() || null;
}

function parseVatToMinor(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");

  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Momsbeloppet måste vara noll eller större och ha högst två decimaler.");
  }

  const [whole, decimals = ""] = normalized.split(".");
  const amountMinor = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));

  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new Error("Momsbeloppet är för stort eller ogiltigt.");
  }

  return amountMinor;
}

function parseDocumentKind(value: string): ManualDocumentKind {
  if (!manualDocumentKinds.includes(value as ManualDocumentKind)) {
    throw new Error("Dokumenttypen stöds inte i den manuella granskningen.");
  }

  return value as ManualDocumentKind;
}

function parsePurchaseEventType(value: string): DocumentPurchaseEventType {
  if (!documentPurchaseEventTypes.includes(value as DocumentPurchaseEventType)) {
    throw new Error("Den föreslagna affärshändelsen stöds inte för dokument.");
  }

  return value as DocumentPurchaseEventType;
}

export function buildManualDocumentReview(params: {
  documentId: string;
  organizationId: string;
  documentKind: string;
  supplierName: string;
  supplierOrgNumber: string;
  documentNumber: string;
  documentDate: string;
  paymentDate: string;
  totalSek: string;
  vatSek: string;
  description: string;
  suggestedEventType: string;
}): ManualDocumentReview {
  const supplierName = params.supplierName.trim();
  const description = params.description.trim();

  if (!supplierName) throw new Error("Leverantör måste fyllas i.");
  if (!description) throw new Error("Beskrivning måste fyllas i.");
  if (!isIsoCalendarDate(params.documentDate)) {
    throw new Error("Dokumentdatumet är ogiltigt.");
  }
  if (!isIsoCalendarDate(params.paymentDate)) {
    throw new Error("Betaldatumet är ogiltigt.");
  }
  if (params.paymentDate < params.documentDate) {
    throw new Error("Betaldatum kan inte vara före dokumentdatum.");
  }

  const totalMinor = parseSekToMinor(params.totalSek);
  const vatMinor = parseVatToMinor(params.vatSek);
  const suggestedEventType = parsePurchaseEventType(params.suggestedEventType);

  if (vatMinor > totalMinor) {
    throw new Error("Momsbeloppet kan inte vara större än totalbeloppet.");
  }

  if (suggestedEventType === "paid_domestic_purchase_25_vat") {
    const expectedVatMinor = splitVatInclusiveAmount(totalMinor, 2500).vatMinor;

    if (vatMinor !== expectedVatMinor) {
      throw new Error(
        `Angiven moms stämmer inte med 25 procent inklusive moms. Förväntad moms är ${(expectedVatMinor / 100).toFixed(2).replace(".", ",")} kr.`,
      );
    }
  } else if (vatMinor !== 0) {
    throw new Error("Momsbeloppet måste vara noll när inget momsavdrag föreslås.");
  }

  const accountingEvent = buildAccountingEventInput({
    id: `document-${params.documentId}`,
    organizationId: params.organizationId,
    type: suggestedEventType,
    happenedAt: params.paymentDate,
    amountSek: params.totalSek,
    description,
    paymentAccount: "1930",
  });

  return {
    facts: {
      documentKind: parseDocumentKind(params.documentKind),
      supplierName,
      supplierOrgNumber: optionalText(params.supplierOrgNumber),
      documentNumber: optionalText(params.documentNumber),
      documentDate: params.documentDate,
      paymentDate: params.paymentDate,
      totalMinor,
      vatMinor,
      currency: "SEK",
      description,
      suggestedEventType,
      paymentAccount: "1930",
    },
    posting: createBookkeepingDraft(accountingEvent),
  };
}

export function manualDocumentKindLabel(kind: ManualDocumentKind | string) {
  if (kind === "receipt") return "Kvitto";
  if (kind === "supplier_invoice") return "Leverantörsfaktura";
  return "Dokument";
}

export function documentReviewStatusLabel(status: string) {
  switch (status) {
    case "incomplete":
      return "Uppgifter saknas";
    case "ready_for_review":
      return "Redo att granska";
    case "linked":
      return "Kopplad till utkast";
    default:
      return status;
  }
}

export function documentReviewStatusTone(status: string) {
  if (status === "linked") return "success" as const;
  if (status === "ready_for_review") return "warning" as const;
  return "neutral" as const;
}
