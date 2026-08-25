import test from "node:test";
import assert from "node:assert/strict";
import { buildManualPostingResult } from "./manual.ts";

const accounts = [
  { number: "1930", name: "Företagskonto", kind: "asset" as const, reviewRequired: true },
  { number: "3041", name: "Försäljning", kind: "income" as const, reviewRequired: true },
];

test("builds a balanced manual journal draft with active accounts", () => {
  const result = buildManualPostingResult(
    [
      { accountNumber: "1930", side: "debit", amountSek: "1 000,00" },
      { accountNumber: "3041", side: "credit", amountSek: "1000" },
    ],
    accounts,
  );
  assert.equal(result.ruleId, "manual_journal_entry");
  assert.equal(result.lines[0]?.amountMinor, 100_000);
  assert.equal(result.confidence, "yellow");
});

test("rejects unbalanced drafts and unavailable accounts", () => {
  assert.throws(
    () => buildManualPostingResult([
      { accountNumber: "1930", side: "debit", amountSek: "100" },
      { accountNumber: "3041", side: "credit", amountSek: "90" },
    ], accounts),
    /balanserar inte/,
  );
  assert.throws(
    () => buildManualPostingResult([
      { accountNumber: "1910", side: "debit", amountSek: "100" },
      { accountNumber: "3041", side: "credit", amountSek: "100" },
    ], accounts),
    /inte aktivt/,
  );
});
