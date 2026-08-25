import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountingReports } from "./reports.ts";

const accounts = [
  { number: "1930", name: "Företagskonto", kind: "asset" as const },
  { number: "2018", name: "Egna insättningar", kind: "equity" as const },
  { number: "2611", name: "Utgående moms", kind: "liability" as const },
  { number: "2641", name: "Ingående moms", kind: "asset" as const },
  { number: "3041", name: "Tjänsteförsäljning", kind: "income" as const },
  { number: "5460", name: "Förbrukningsmaterial", kind: "expense" as const },
  { number: "1220", name: "Inventarier", kind: "asset" as const },
];

const lines = [
  { journalEntryId: "sale", postedOn: "2026-01-15", accountNumber: "1930", debitMinor: 125_000, creditMinor: 0 },
  { journalEntryId: "sale", postedOn: "2026-01-15", accountNumber: "3041", debitMinor: 0, creditMinor: 100_000 },
  { journalEntryId: "sale", postedOn: "2026-01-15", accountNumber: "2611", debitMinor: 0, creditMinor: 25_000 },
  { journalEntryId: "purchase", postedOn: "2026-02-10", accountNumber: "5460", debitMinor: 40_000, creditMinor: 0 },
  { journalEntryId: "purchase", postedOn: "2026-02-10", accountNumber: "2641", debitMinor: 10_000, creditMinor: 0 },
  { journalEntryId: "purchase", postedOn: "2026-02-10", accountNumber: "1930", debitMinor: 0, creditMinor: 50_000 },
  { journalEntryId: "asset", postedOn: "2026-03-01", accountNumber: "1220", debitMinor: 20_000, creditMinor: 0 },
  { journalEntryId: "asset", postedOn: "2026-03-01", accountNumber: "1930", debitMinor: 0, creditMinor: 20_000 },
  { journalEntryId: "capital", postedOn: "2026-03-02", accountNumber: "1930", debitMinor: 30_000, creditMinor: 0 },
  { journalEntryId: "capital", postedOn: "2026-03-02", accountNumber: "2018", debitMinor: 0, creditMinor: 30_000 },
];

test("builds result, balance and VAT from immutable journal lines", () => {
  const report = buildAccountingReports({ accounts, lines });
  assert.equal(report.incomeStatement.incomeMinor, 100_000);
  assert.equal(report.incomeStatement.expenseMinor, 40_000);
  assert.equal(report.incomeStatement.resultMinor, 60_000);
  assert.equal(report.vat.boxes["05"], 100_000);
  assert.equal(report.vat.outputVatMinor, 25_000);
  assert.equal(report.vat.inputVatMinor, 10_000);
  assert.equal(report.vat.payableMinor, 15_000);
  assert.equal(report.balanceSheet.differenceMinor, 0);
});

test("classifies cash movement and respects report dates", () => {
  const report = buildAccountingReports({ accounts, lines, from: "2026-02-01", to: "2026-03-31" });
  assert.equal(report.sales.length, 0);
  assert.equal(report.cashFlow.operating, -50_000);
  assert.equal(report.cashFlow.investing, -20_000);
  assert.equal(report.cashFlow.financing, 30_000);
  assert.equal(report.cashFlow.netChangeMinor, -40_000);
  assert.equal(report.incomeStatement.resultMinor, -40_000);
  assert.equal(report.balanceSheet.currentResultMinor, 60_000);
  assert.equal(report.balanceSheet.differenceMinor, 0);
  const bankLedger = report.generalLedger.find((account) => account.number === "1930");
  assert.equal(bankLedger?.openingMinor, 125_000);
  assert.equal(bankLedger?.periodChangeMinor, -40_000);
  assert.equal(bankLedger?.closingMinor, 85_000);
});
