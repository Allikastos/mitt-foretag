export type InvoicePdfState =
  | "not_started"
  | "processing"
  | "ready"
  | "failed";

export type InvoiceFinalizationState = {
  invoiceId: string;
  invoiceNumber: string | null;
  idempotencyKey: string | null;
  pdfState: InvoicePdfState;
  documentId: string | null;
  error: string | null;
};

export function beginInvoiceFinalization(
  state: InvoiceFinalizationState,
  idempotencyKey: string,
) {
  if (state.idempotencyKey && state.idempotencyKey !== idempotencyKey) {
    throw new Error("Fakturan slutförs redan med en annan idempotensnyckel.");
  }

  if (state.pdfState === "ready") {
    return { state, outcome: "replay" as const };
  }

  if (state.pdfState === "processing") {
    return { state, outcome: "in_progress" as const };
  }

  return {
    state: {
      ...state,
      idempotencyKey,
      pdfState: "processing" as const,
      error: null,
    },
    outcome: state.pdfState === "failed" ? ("retry" as const) : ("start" as const),
  };
}

export function completeInvoiceFinalization(
  state: InvoiceFinalizationState,
  documentId: string,
) {
  if (state.pdfState !== "processing" || !state.invoiceNumber) {
    throw new Error("Fakturan kan inte färdigställas från sitt nuvarande läge.");
  }

  return {
    ...state,
    pdfState: "ready" as const,
    documentId,
    error: null,
  };
}

export function failInvoiceFinalization(
  state: InvoiceFinalizationState,
  error: string,
) {
  if (state.pdfState !== "processing") {
    throw new Error("Endast pågående PDF-generering kan markeras som misslyckad.");
  }

  return { ...state, pdfState: "failed" as const, error };
}

export function claimInvoiceNumber(params: {
  prefix: string;
  nextNumber: number;
}) {
  if (!Number.isSafeInteger(params.nextNumber) || params.nextNumber < 1) {
    throw new Error("Nästa fakturanummer är ogiltigt.");
  }

  return {
    invoiceNumber: `${params.prefix}${String(params.nextNumber).padStart(4, "0")}`,
    nextNumber: params.nextNumber + 1,
  };
}
