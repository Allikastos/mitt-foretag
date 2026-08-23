import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCustomerSalesStage,
  customerStatusForSalesStage,
  getCustomerSalesStage,
  getCustomerSalesNextStep,
  parseCustomerFollowUpFilter,
  parseCustomerSalesStage,
  parseCustomerStatusFilter,
} from "./sales.ts";

test("sales filters accept only supported URL values", () => {
  assert.equal(parseCustomerStatusFilter("lead"), "lead");
  assert.equal(parseCustomerStatusFilter("unknown"), null);
  assert.equal(parseCustomerFollowUpFilter("due"), "due");
  assert.equal(parseCustomerFollowUpFilter("tomorrow"), null);
  assert.equal(parseCustomerSalesStage("offer"), "offer");
  assert.equal(parseCustomerSalesStage("invoiced"), null);
});

test("sales stages map to the existing customer statuses", () => {
  assert.equal(customerStatusForSalesStage("new"), "lead");
  assert.equal(customerStatusForSalesStage("offer"), "lead");
  assert.equal(customerStatusForSalesStage("won"), "active");
  assert.equal(customerStatusForSalesStage("paused"), "inactive");
});

test("applying a sales stage replaces only the previous stage tag", () => {
  assert.deepEqual(
    applyCustomerSalesStage(
      ["Altura Start", "säljläge: kontaktad", "varm lead"],
      "meeting",
    ),
    ["Altura Start", "varm lead", "säljläge: möte bokat"],
  );
  assert.deepEqual(
    applyCustomerSalesStage(["säljläge: offert skickad", "prioriterad"], "won"),
    ["prioriterad"],
  );
  assert.deepEqual(
    applyCustomerSalesStage(
      Array.from({ length: 12 }, (_, index) => `tagg-${index + 1}`),
      "offer",
    ),
    [
      "tagg-1",
      "tagg-2",
      "tagg-3",
      "tagg-4",
      "tagg-5",
      "tagg-6",
      "tagg-7",
      "tagg-8",
      "tagg-9",
      "tagg-10",
      "tagg-11",
      "säljläge: offert skickad",
    ],
  );
});

test("customer stage is derived safely from status, tags and contact history", () => {
  assert.equal(
    getCustomerSalesStage({
      status: "lead",
      tags: ["säljläge: offert skickad"],
      last_contacted_at: null,
    }),
    "offer",
  );
  assert.equal(
    getCustomerSalesStage({
      status: "lead",
      tags: [],
      last_contacted_at: "2026-08-24",
    }),
    "contacted",
  );
  assert.equal(
    getCustomerSalesStage({
      status: "active",
      tags: ["säljläge: offert skickad"],
      last_contacted_at: null,
    }),
    "won",
  );
});

test("a lead without a follow-up is stopped as missing a next step", () => {
  assert.deepEqual(
    getCustomerSalesNextStep(
      { status: "lead", follow_up_date: null },
      "2026-08-24",
    ),
    {
      key: "missing",
      label: "Nästa steg saknas",
      description: "Bestäm vem som återkopplar och när.",
      tone: "warning",
    },
  );
});

test("due and overdue follow-ups are separated deterministically", () => {
  assert.equal(
    getCustomerSalesNextStep(
      { status: "lead", follow_up_date: "2026-08-23" },
      "2026-08-24",
    ).key,
    "overdue",
  );
  assert.equal(
    getCustomerSalesNextStep(
      { status: "lead", follow_up_date: "2026-08-24" },
      "2026-08-24",
    ).key,
    "due",
  );
  assert.equal(
    getCustomerSalesNextStep(
      { status: "lead", follow_up_date: "2026-08-25" },
      "2026-08-24",
    ).key,
    "scheduled",
  );
});

test("active and inactive customers leave the prospect follow-up flow", () => {
  assert.equal(
    getCustomerSalesNextStep(
      { status: "active", follow_up_date: null },
      "2026-08-24",
    ).key,
    "converted",
  );
  assert.equal(
    getCustomerSalesNextStep(
      { status: "inactive", follow_up_date: "2026-08-20" },
      "2026-08-24",
    ).key,
    "paused",
  );
});
