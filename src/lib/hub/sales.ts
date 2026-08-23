import type { Customer } from "../hub";

export const customerStatusFilters = ["lead", "active", "inactive"] as const;
export const customerFollowUpFilters = ["due", "missing", "scheduled"] as const;

export type CustomerStatusFilter = (typeof customerStatusFilters)[number];
export type CustomerFollowUpFilter = (typeof customerFollowUpFilters)[number];

type SalesCustomer = Pick<Customer, "status" | "follow_up_date">;

export function parseCustomerStatusFilter(value: string | null | undefined) {
  return customerStatusFilters.find((status) => status === value) ?? null;
}

export function parseCustomerFollowUpFilter(value: string | null | undefined) {
  return customerFollowUpFilters.find((filter) => filter === value) ?? null;
}

export function getCustomerSalesNextStep(
  customer: SalesCustomer,
  today = new Date().toISOString().slice(0, 10),
) {
  if (customer.status === "active") {
    return {
      key: "converted" as const,
      label: "Vunnen kund",
      description: "Planera leverans, samla material och förbered fakturering.",
      tone: "success" as const,
    };
  }

  if (customer.status === "inactive") {
    return {
      key: "paused" as const,
      label: "Pausad relation",
      description: "Ingen aktiv bearbetning är planerad.",
      tone: "neutral" as const,
    };
  }

  if (!customer.follow_up_date) {
    return {
      key: "missing" as const,
      label: "Nästa steg saknas",
      description: "Bestäm vem som återkopplar och när.",
      tone: "warning" as const,
    };
  }

  if (customer.follow_up_date < today) {
    return {
      key: "overdue" as const,
      label: "Återkoppling förfallen",
      description: "Prospektet bör prioriteras idag.",
      tone: "danger" as const,
    };
  }

  if (customer.follow_up_date === today) {
    return {
      key: "due" as const,
      label: "Återkoppla idag",
      description: "Nästa kontakt är planerad till idag.",
      tone: "warning" as const,
    };
  }

  return {
    key: "scheduled" as const,
    label: "Återkoppling planerad",
    description: "Nästa kontakt har ett tydligt datum.",
    tone: "neutral" as const,
  };
}
