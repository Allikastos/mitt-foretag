import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCustomerSalesStage,
  customerStatusForSalesStage,
  getCustomerReadinessGaps,
  getCustomerSalesStage,
  getCustomerSalesNextStep,
  normalizeCustomerRegistrySearch,
  parseCustomerFollowUpFilter,
  parseCustomerReadinessFilter,
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
  assert.equal(parseCustomerReadinessFilter("missing_owner"), "missing_owner");
  assert.equal(parseCustomerReadinessFilter("complete"), null);
});

test("customer registry search is normalized before it reaches the query", () => {
  assert.equal(
    normalizeCustomerRegistrySearch("  Altura   Nova%_  "),
    "Altura Nova",
  );
  assert.equal(normalizeCustomerRegistrySearch(null), "");
  assert.equal(normalizeCustomerRegistrySearch("a".repeat(100)).length, 80);
});

test("prospect readiness reports only missing minimum information", () => {
  assert.deepEqual(
    getCustomerReadinessGaps({
      status: "lead",
      email: null,
      phone: null,
      relationship_owner: null,
      notes: "  ",
      follow_up_date: null,
    }),
    [
      "missing_contact",
      "missing_owner",
      "missing_notes",
      "missing_follow_up",
    ],
  );

  assert.deepEqual(
    getCustomerReadinessGaps({
      status: "lead",
      email: "kontakt@example.com",
      phone: null,
      relationship_owner: "Albin",
      notes: "Behöver tydligare offertflöde.",
      follow_up_date: "2026-08-28",
    }),
    [],
  );

  assert.deepEqual(
    getCustomerReadinessGaps({
      status: "active",
      email: null,
      phone: null,
      relationship_owner: null,
      notes: null,
      follow_up_date: null,
    }),
    [],
  );
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
