import type { Customer } from "../hub";
import {
  applyCustomerSalesStage,
  getCustomerSalesStage,
  type CustomerSalesStage,
} from "./sales.ts";

export const SALES_VALIDATION_START = "2026-08-24";
export const SALES_VALIDATION_END_EXCLUSIVE = "2026-10-05";
export const SALES_VALIDATION_WON_ACTION = "sales_customer_won";

export const salesValidationActivityTypes = [
  "personal_contact",
  "problem_interview",
  "sales_call",
  "needs_meeting",
] as const;

export type SalesValidationActivityType =
  (typeof salesValidationActivityTypes)[number];

export const salesValidationActivityActions: Record<
  SalesValidationActivityType,
  string
> = {
  personal_contact: "sales_personal_contact_completed",
  problem_interview: "sales_problem_interview_completed",
  sales_call: "sales_call_completed",
  needs_meeting: "sales_needs_meeting_completed",
};

export function parseSalesValidationActivity(value: unknown) {
  return salesValidationActivityTypes.find((type) => type === value) ?? null;
}

export function salesValidationActivityLabel(
  type: SalesValidationActivityType,
) {
  switch (type) {
    case "personal_contact":
      return "Personlig kontakt";
    case "problem_interview":
      return "Problemintervju";
    case "sales_call":
      return "Säljsamtal";
    case "needs_meeting":
      return "Behovsmöte";
  }
}

const stageOrder: Record<CustomerSalesStage, number> = {
  new: 0,
  contacted: 1,
  meeting: 2,
  offer: 3,
  won: 4,
  paused: 5,
};

export function advanceSalesStageForActivity(
  customer: Pick<Customer, "status" | "last_contacted_at" | "tags">,
  activityType: SalesValidationActivityType,
) {
  const currentStage = getCustomerSalesStage(customer);
  const requestedStage =
    activityType === "needs_meeting" ? "meeting" : "contacted";

  if (
    currentStage === "paused" ||
    stageOrder[currentStage] >= stageOrder[requestedStage]
  ) {
    return {
      stage: currentStage,
      status: customer.status,
      tags: customer.tags,
    };
  }

  return {
    stage: requestedStage,
    status: "lead" as const,
    tags: applyCustomerSalesStage(customer.tags, requestedStage),
  };
}

type ValidationCustomer = Pick<
  Customer,
  "id" | "status" | "last_contacted_at" | "created_at" | "updated_at"
>;

type ValidationActivity = {
  action: string;
  entity_id: string | null;
  created_at: string;
};

type ValidationGoalKey =
  | "personalContacts"
  | "problemInterviews"
  | "salesCalls"
  | "needsMeetings"
  | "wonCustomers";

const goalDefinitions: Array<{
  key: ValidationGoalKey;
  label: string;
  target: number;
}> = [
  { key: "personalContacts", label: "Personliga kontakter", target: 100 },
  { key: "problemInterviews", label: "Problemintervjuer", target: 15 },
  { key: "salesCalls", label: "Säljsamtal", target: 10 },
  { key: "needsMeetings", label: "Behovsmöten", target: 5 },
  { key: "wonCustomers", label: "Vunna kunder", target: 3 },
];

function isInValidationPeriod(value: string | null | undefined) {
  if (!value) return false;
  const date = value.slice(0, 10);
  return date >= SALES_VALIDATION_START && date < SALES_VALIDATION_END_EXCLUSIVE;
}

export function buildSalesValidationSummary(
  customers: ValidationCustomer[],
  activities: ValidationActivity[],
  today = new Date().toISOString().slice(0, 10),
) {
  const allowedCustomerIds = new Set(customers.map((customer) => customer.id));
  const periodActivities = activities.filter(
    (activity) =>
      activity.entity_id &&
      allowedCustomerIds.has(activity.entity_id) &&
      isInValidationPeriod(activity.created_at),
  );
  const contactCustomerIds = new Set(
    customers
      .filter((customer) => isInValidationPeriod(customer.last_contacted_at))
      .map((customer) => customer.id),
  );

  for (const activity of periodActivities) {
    if (
      Object.values(salesValidationActivityActions).includes(activity.action)
    ) {
      contactCustomerIds.add(activity.entity_id as string);
    }
  }

  const counts: Record<ValidationGoalKey, number> = {
    personalContacts: contactCustomerIds.size,
    problemInterviews: periodActivities.filter(
      (activity) =>
        activity.action === salesValidationActivityActions.problem_interview,
    ).length,
    salesCalls: periodActivities.filter(
      (activity) => activity.action === salesValidationActivityActions.sales_call,
    ).length,
    needsMeetings: periodActivities.filter(
      (activity) =>
        activity.action === salesValidationActivityActions.needs_meeting,
    ).length,
    wonCustomers: new Set([
      ...customers
        .filter(
          (customer) =>
            customer.status === "active" &&
            isInValidationPeriod(customer.created_at),
        )
        .map((customer) => customer.id),
      ...periodActivities
        .filter((activity) => activity.action === SALES_VALIDATION_WON_ACTION)
        .map((activity) => activity.entity_id as string),
    ]).size,
  };

  const endDate = new Date(`${SALES_VALIDATION_END_EXCLUSIVE}T00:00:00Z`);
  const todayDate = new Date(`${today}T00:00:00Z`);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - todayDate.getTime()) / 86_400_000),
  );

  return {
    startDate: SALES_VALIDATION_START,
    endDate: "2026-10-04",
    daysRemaining,
    isActive:
      today >= SALES_VALIDATION_START && today < SALES_VALIDATION_END_EXCLUSIVE,
    goals: goalDefinitions.map((goal) => ({
      ...goal,
      value: counts[goal.key],
      progress: Math.min(100, Math.round((counts[goal.key] / goal.target) * 100)),
    })),
  };
}
