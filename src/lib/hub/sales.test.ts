import test from "node:test";
import assert from "node:assert/strict";
import {
  getCustomerSalesNextStep,
  parseCustomerFollowUpFilter,
  parseCustomerStatusFilter,
} from "./sales.ts";

test("sales filters accept only supported URL values", () => {
  assert.equal(parseCustomerStatusFilter("lead"), "lead");
  assert.equal(parseCustomerStatusFilter("unknown"), null);
  assert.equal(parseCustomerFollowUpFilter("due"), "due");
  assert.equal(parseCustomerFollowUpFilter("tomorrow"), null);
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
