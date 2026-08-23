import type { Customer } from "../hub";

export const customerStatusFilters = ["lead", "active", "inactive"] as const;
export const customerFollowUpFilters = ["due", "missing", "scheduled"] as const;
export const customerSalesStages = [
  "new",
  "contacted",
  "meeting",
  "offer",
  "won",
  "paused",
] as const;

export type CustomerStatusFilter = (typeof customerStatusFilters)[number];
export type CustomerFollowUpFilter = (typeof customerFollowUpFilters)[number];
export type CustomerSalesStage = (typeof customerSalesStages)[number];

const salesStageTags: Partial<Record<CustomerSalesStage, string>> = {
  new: "säljläge: ny",
  contacted: "säljläge: kontaktad",
  meeting: "säljläge: möte bokat",
  offer: "säljläge: offert skickad",
};

type SalesCustomer = Pick<Customer, "status" | "follow_up_date">;
type SalesStageCustomer = Pick<Customer, "status" | "last_contacted_at" | "tags">;

export function parseCustomerStatusFilter(value: string | null | undefined) {
  return customerStatusFilters.find((status) => status === value) ?? null;
}

export function parseCustomerFollowUpFilter(value: string | null | undefined) {
  return customerFollowUpFilters.find((filter) => filter === value) ?? null;
}

export function parseCustomerSalesStage(value: string | null | undefined) {
  return customerSalesStages.find((stage) => stage === value) ?? null;
}

export function customerSalesStageLabel(stage: CustomerSalesStage) {
  switch (stage) {
    case "new":
      return "Nytt prospekt";
    case "contacted":
      return "Kontaktad";
    case "meeting":
      return "Möte bokat";
    case "offer":
      return "Offert skickad";
    case "won":
      return "Vunnen kund";
    case "paused":
      return "Pausad";
  }
}

export function customerStatusForSalesStage(
  stage: CustomerSalesStage,
): Customer["status"] {
  if (stage === "won") return "active";
  if (stage === "paused") return "inactive";
  return "lead";
}

export function customerSalesStageTag(stage: CustomerSalesStage) {
  return salesStageTags[stage] ?? null;
}

export function applyCustomerSalesStage(
  tags: string[],
  stage: CustomerSalesStage,
) {
  const preservedTags = tags.filter(
    (tag) => !tag.toLocaleLowerCase("sv-SE").startsWith("säljläge:"),
  );
  const stageTag = customerSalesStageTag(stage);

  return stageTag
    ? [...preservedTags.slice(0, 11), stageTag]
    : preservedTags.slice(0, 12);
}

export function getCustomerSalesStage(customer: SalesStageCustomer) {
  if (customer.status === "active") return "won" as const;
  if (customer.status === "inactive") return "paused" as const;

  const normalizedTags = new Set(
    customer.tags.map((tag) => tag.toLocaleLowerCase("sv-SE")),
  );

  for (const stage of ["offer", "meeting", "contacted", "new"] as const) {
    const stageTag = salesStageTags[stage];
    if (stageTag && normalizedTags.has(stageTag)) return stage;
  }

  return customer.last_contacted_at ? "contacted" as const : "new" as const;
}

export function customerSalesStageTone(stage: CustomerSalesStage) {
  if (stage === "won") return "success" as const;
  if (stage === "offer" || stage === "meeting") return "warning" as const;
  return "neutral" as const;
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
