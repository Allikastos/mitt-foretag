import test from "node:test";
import assert from "node:assert/strict";
import { buildManualDocumentReview } from "./manual-facts.ts";

const baseInput = {
  documentId: "document-1",
  organizationId: "organization-1",
  documentKind: "receipt",
  supplierName: "Exempelbutiken",
  supplierOrgNumber: "556000-0000",
  documentNumber: "K-100",
  documentDate: "2026-08-10",
  paymentDate: "2026-08-10",
  totalSek: "1 250,00",
  vatSek: "250,00",
  description: "Förbrukningsmaterial",
  suggestedEventType: "paid_domestic_purchase_25_vat",
};

test("manual receipt facts produce an exact balanced posting preview", () => {
  const review = buildManualDocumentReview(baseInput);
  const debit = review.posting.lines
    .filter((line) => line.side === "debit")
    .reduce((sum, line) => sum + line.amountMinor, 0);
  const credit = review.posting.lines
    .filter((line) => line.side === "credit")
    .reduce((sum, line) => sum + line.amountMinor, 0);

  assert.equal(review.facts.totalMinor, 125_000);
  assert.equal(review.facts.vatMinor, 25_000);
  assert.equal(debit, credit);
});

test("a mismatched 25 percent VAT amount is rejected", () => {
  assert.throws(
    () => buildManualDocumentReview({ ...baseInput, vatSek: "249,99" }),
    /Förväntad moms är 250,00 kr/,
  );
});

test("zero VAT is allowed for a purchase without deductible VAT", () => {
  const review = buildManualDocumentReview({
    ...baseInput,
    vatSek: "0",
    suggestedEventType: "purchase_without_deductible_vat",
  });

  assert.equal(review.facts.vatMinor, 0);
  assert.equal(review.posting.lines.length, 2);
  assert.throws(
    () =>
      buildManualDocumentReview({
        ...baseInput,
        vatSek: "1,00",
        suggestedEventType: "purchase_without_deductible_vat",
      }),
    /måste vara noll/,
  );
});

test("invalid calendar dates and payment before document date are rejected", () => {
  assert.throws(
    () => buildManualDocumentReview({ ...baseInput, documentDate: "2026-02-31" }),
    /Dokumentdatumet är ogiltigt/,
  );
  assert.throws(
    () =>
      buildManualDocumentReview({
        ...baseInput,
        documentDate: "2026-08-11",
        paymentDate: "2026-08-10",
      }),
    /Betaldatum kan inte vara före/,
  );
});
