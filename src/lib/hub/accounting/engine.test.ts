import test from "node:test";
import assert from "node:assert/strict";
import { createBookkeepingDraft } from "./engine.ts";
import { sumLines } from "./validation.ts";
import type { AccountingEventInput, SupportedBusinessEventType } from "./types.ts";

function event(
  type: SupportedBusinessEventType,
  totalAmountMinor: number,
): AccountingEventInput {
  return {
    id: `evt-${type}`,
    organizationId: "org_1",
    type,
    companyForm: "sole_trader",
    accountingMethod: "cash_basis",
    currency: "SEK",
    happenedAt: "2026-08-12",
    totalAmountMinor,
    vatRateBasisPoints: 2500,
    description: "Golden test event",
  };
}

test("paid service sale with 25 percent VAT balances debit and credit", () => {
  const draft = createBookkeepingDraft(
    event("paid_domestic_service_sale_25_vat", 625_000),
  );

  assert.equal(draft.confidence, "green");
  assert.equal(sumLines(draft.lines, "debit"), 625_000);
  assert.equal(sumLines(draft.lines, "credit"), 625_000);
  assert.deepEqual(
    draft.lines.map((line) => [line.accountNumber, line.side, line.amountMinor]),
    [
      ["1930", "debit", 625_000],
      ["3041", "credit", 500_000],
      ["2611", "credit", 125_000],
    ],
  );
});

test("paid domestic purchase with 25 percent VAT balances debit and credit", () => {
  const draft = createBookkeepingDraft(
    event("paid_domestic_purchase_25_vat", 125_000),
  );

  assert.equal(draft.confidence, "green");
  assert.equal(sumLines(draft.lines, "debit"), 125_000);
  assert.equal(sumLines(draft.lines, "credit"), 125_000);
  assert.deepEqual(
    draft.lines.map((line) => [line.accountNumber, line.side, line.amountMinor]),
    [
      ["5460", "debit", 100_000],
      ["2641", "debit", 25_000],
      ["1930", "credit", 125_000],
    ],
  );
});

test("owner deposit and withdrawal affect equity, not income or expenses", () => {
  const deposit = createBookkeepingDraft(event("owner_deposit", 10_000));
  const withdrawal = createBookkeepingDraft(event("owner_withdrawal", 7_500));

  assert.equal(sumLines(deposit.lines, "debit"), sumLines(deposit.lines, "credit"));
  assert.equal(
    sumLines(withdrawal.lines, "debit"),
    sumLines(withdrawal.lines, "credit"),
  );
  assert.equal(deposit.lines.some((line) => line.accountNumber === "2018"), true);
  assert.equal(withdrawal.lines.some((line) => line.accountNumber === "2013"), true);
});

test("unsupported company form is rejected by the first version", () => {
  const input = event("paid_domestic_service_sale_25_vat", 625_000);
  const draft = createBookkeepingDraft({
    ...input,
    companyForm: "limited_company",
  });

  assert.equal(draft.confidence, "red");
  assert.match(draft.plainLanguageSummary, /stöds inte/);
});
