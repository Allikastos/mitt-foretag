import test from "node:test";
import assert from "node:assert/strict";
import {
  beginInvoiceFinalization,
  claimInvoiceNumber,
  completeInvoiceFinalization,
  failInvoiceFinalization,
  type InvoiceFinalizationState,
} from "./invoice-finalization.ts";

function state(
  overrides: Partial<InvoiceFinalizationState> = {},
): InvoiceFinalizationState {
  return {
    invoiceId: "invoice-1",
    invoiceNumber: "AN-0042",
    idempotencyKey: null,
    pdfState: "not_started",
    documentId: null,
    error: null,
    ...overrides,
  };
}

test("invoice number allocation advances exactly once", () => {
  assert.deepEqual(claimInvoiceNumber({ prefix: "AN-", nextNumber: 42 }), {
    invoiceNumber: "AN-0042",
    nextNumber: 43,
  });
});

test("repeated invoice finalization with the same key is idempotent", () => {
  const started = beginInvoiceFinalization(state(), "finalize-123").state;
  const repeated = beginInvoiceFinalization(started, "finalize-123");
  const completed = completeInvoiceFinalization(started, "document-1");
  const replay = beginInvoiceFinalization(completed, "finalize-123");

  assert.equal(repeated.outcome, "in_progress");
  assert.equal(replay.outcome, "replay");
  assert.equal(replay.state.documentId, "document-1");
});

test("a different key cannot take over an invoice finalization", () => {
  const started = beginInvoiceFinalization(state(), "finalize-123").state;
  assert.throws(
    () => beginInvoiceFinalization(started, "finalize-456"),
    /annan idempotensnyckel/,
  );
});

test("failed PDF generation remains visible and can resume", () => {
  const started = beginInvoiceFinalization(state(), "finalize-123").state;
  const failed = failInvoiceFinalization(started, "Storage svarade inte");
  const retried = beginInvoiceFinalization(failed, "finalize-123");

  assert.equal(failed.pdfState, "failed");
  assert.equal(failed.error, "Storage svarade inte");
  assert.equal(retried.outcome, "retry");
  assert.equal(retried.state.pdfState, "processing");
});
