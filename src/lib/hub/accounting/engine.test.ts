import test from "node:test";
import assert from "node:assert/strict";
import { createBookkeepingDraft } from "./engine.ts";
import { sumLines } from "./validation.ts";
import type { AccountingEventInput, SupportedBusinessEventType } from "./types.ts";

function event(
  type: SupportedBusinessEventType,
  totalAmountMinor: number,
  overrides: Partial<AccountingEventInput> = {},
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
    ...overrides,
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

test("service sale without VAT uses the no-VAT golden posting", () => {
  const draft = createBookkeepingDraft(
    event("paid_domestic_service_sale_no_vat", 42_500),
  );

  assert.deepEqual(
    draft.lines.map((line) => [line.accountNumber, line.side, line.amountMinor]),
    [
      ["1930", "debit", 42_500],
      ["3044", "credit", 42_500],
    ],
  );
});

test("purchase without deductible VAT expenses the full amount", () => {
  const draft = createBookkeepingDraft(
    event("purchase_without_deductible_vat", 12_345),
  );

  assert.deepEqual(
    draft.lines.map((line) => [line.accountNumber, line.side, line.amountMinor]),
    [
      ["6992", "debit", 12_345],
      ["1930", "credit", 12_345],
    ],
  );
});

test("transfer between own accounts uses explicit from and to accounts", () => {
  const draft = createBookkeepingDraft(
    event("transfer_between_own_accounts", 50_000, {
      paymentAccount: "1930",
      counterAccount: "1940",
    }),
  );

  assert.deepEqual(
    draft.lines.map((line) => [line.accountNumber, line.side, line.amountMinor]),
    [
      ["1940", "debit", 50_000],
      ["1930", "credit", 50_000],
    ],
  );
});

test("VAT rounding stays exact in minor units", () => {
  const draft = createBookkeepingDraft(
    event("paid_domestic_service_sale_25_vat", 101),
  );

  assert.deepEqual(
    draft.lines.map((line) => line.amountMinor),
    [101, 81, 20],
  );
  assert.equal(sumLines(draft.lines, "debit"), sumLines(draft.lines, "credit"));
});

test("every supported rule balances and records its rule version", () => {
  const inputs = [
    event("paid_domestic_service_sale_25_vat", 12_500),
    event("paid_domestic_service_sale_no_vat", 12_500),
    event("paid_domestic_purchase_25_vat", 12_500),
    event("purchase_without_deductible_vat", 12_500),
    event("owner_deposit", 12_500),
    event("owner_withdrawal", 12_500),
    event("transfer_between_own_accounts", 12_500, {
      paymentAccount: "1930",
      counterAccount: "1940",
    }),
  ];

  for (const input of inputs) {
    const draft = createBookkeepingDraft(input);
    assert.equal(sumLines(draft.lines, "debit"), sumLines(draft.lines, "credit"));
    assert.equal(draft.ruleVersion, 1);
    assert.notEqual(draft.ruleId, "unsupported");
  }
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
