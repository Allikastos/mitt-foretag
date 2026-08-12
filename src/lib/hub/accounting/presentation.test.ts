import test from "node:test";
import assert from "node:assert/strict";
import {
  accountingEventTypes,
  buildAccountingEventInput,
  parseSekToMinor,
} from "./presentation.ts";

test("all seven MVP event types are exposed in the accounting studio", () => {
  assert.equal(accountingEventTypes.length, 7);
});

test("Swedish SEK input is converted exactly to integer minor units", () => {
  assert.equal(parseSekToMinor("1 250,50"), 125_050);
  assert.equal(parseSekToMinor("99.9"), 9_990);
});

test("unsafe or ambiguous monetary input is rejected", () => {
  for (const value of ["0", "-10", "1,999", "1e3", "abc"]) {
    assert.throws(() => parseSekToMinor(value));
  }
});

test("event builder locks the MVP to sole trader, cash basis and SEK", () => {
  const event = buildAccountingEventInput({
    id: "event-1",
    organizationId: "org-1",
    type: "owner_deposit",
    happenedAt: "2026-08-12",
    amountSek: "500",
    description: "Egen insättning",
  });

  assert.equal(event.companyForm, "sole_trader");
  assert.equal(event.accountingMethod, "cash_basis");
  assert.equal(event.currency, "SEK");
  assert.equal(event.totalAmountMinor, 50_000);
});
