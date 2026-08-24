import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceSalesStageForActivity,
  buildSalesValidationSummary,
  parseSalesValidationActivity,
  salesValidationActivityActions,
  SALES_VALIDATION_WON_ACTION,
} from "./sales-validation.ts";

test("accepts only supported validation activities", () => {
  assert.equal(parseSalesValidationActivity("sales_call"), "sales_call");
  assert.equal(parseSalesValidationActivity("invoice_sent"), null);
});

test("sales activities advance prospects without moving later stages backwards", () => {
  assert.equal(
    advanceSalesStageForActivity(
      { status: "lead", last_contacted_at: null, tags: ["varm"] },
      "personal_contact",
    ).stage,
    "contacted",
  );
  assert.equal(
    advanceSalesStageForActivity(
      {
        status: "lead",
        last_contacted_at: "2026-08-24",
        tags: ["säljläge: offert skickad"],
      },
      "needs_meeting",
    ).stage,
    "offer",
  );
});

test("validation summary counts allowed customers and campaign events", () => {
  const summary = buildSalesValidationSummary(
    [
      {
        id: "customer-1",
        status: "lead",
        last_contacted_at: "2026-08-24",
        created_at: "2026-08-24T08:00:00Z",
        updated_at: "2026-08-24T08:00:00Z",
      },
      {
        id: "customer-2",
        status: "active",
        last_contacted_at: null,
        created_at: "2026-08-25T08:00:00Z",
        updated_at: "2026-08-26T08:00:00Z",
      },
    ],
    [
      {
        action: salesValidationActivityActions.problem_interview,
        entity_id: "customer-1",
        created_at: "2026-08-25T10:00:00Z",
      },
      {
        action: salesValidationActivityActions.sales_call,
        entity_id: "customer-2",
        created_at: "2026-08-26T10:00:00Z",
      },
      {
        action: salesValidationActivityActions.sales_call,
        entity_id: "other-organization-customer",
        created_at: "2026-08-26T10:00:00Z",
      },
      {
        action: SALES_VALIDATION_WON_ACTION,
        entity_id: "customer-2",
        created_at: "2026-08-26T11:00:00Z",
      },
    ],
    "2026-08-27",
  );

  assert.deepEqual(
    Object.fromEntries(summary.goals.map((goal) => [goal.key, goal.value])),
    {
      personalContacts: 2,
      problemInterviews: 1,
      salesCalls: 1,
      needsMeetings: 0,
      wonCustomers: 1,
    },
  );
  assert.equal(summary.isActive, true);
  assert.equal(summary.daysRemaining, 39);
});
