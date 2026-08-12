import type {
  AccountingEventInput,
  SupportedBusinessEventType,
} from "./types.ts";

export const accountingEventTypes = [
  "paid_domestic_service_sale_25_vat",
  "paid_domestic_service_sale_no_vat",
  "paid_domestic_purchase_25_vat",
  "purchase_without_deductible_vat",
  "owner_deposit",
  "owner_withdrawal",
  "transfer_between_own_accounts",
] as const satisfies readonly SupportedBusinessEventType[];

export function accountingEventLabel(type: SupportedBusinessEventType | string) {
  switch (type) {
    case "paid_domestic_service_sale_25_vat":
      return "Betald tjänsteförsäljning, 25 % moms";
    case "paid_domestic_service_sale_no_vat":
      return "Betald momsfri tjänsteförsäljning";
    case "paid_domestic_purchase_25_vat":
      return "Betalt svenskt inköp, 25 % moms";
    case "purchase_without_deductible_vat":
      return "Inköp utan avdragsgill moms";
    case "owner_deposit":
      return "Egen insättning";
    case "owner_withdrawal":
      return "Eget uttag";
    case "transfer_between_own_accounts":
      return "Överföring mellan egna konton";
    default:
      return "Okänd affärshändelse";
  }
}

export function accountingStatusLabel(status: string) {
  switch (status) {
    case "incomplete":
      return "Ofullständig";
    case "needs_review":
      return "Behöver granskas";
    case "ready_to_post":
      return "Redo att bokföra";
    case "posted":
      return "Bokförd";
    case "rejected":
      return "Avvisad";
    case "open":
      return "Öppen";
    case "review":
      return "Under granskning";
    case "locked":
      return "Låst";
    default:
      return status;
  }
}

export function accountingStatusTone(status: string) {
  if (status === "posted" || status === "ready_to_post" || status === "open") {
    return "success" as const;
  }
  if (status === "rejected" || status === "locked") return "danger" as const;
  if (status === "needs_review" || status === "review") return "warning" as const;
  return "neutral" as const;
}

export function parseSekToMinor(value: string) {
  const normalized = value.trim().replace(/\s/g, "").replace(",", ".");

  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Beloppet måste vara större än noll och ha högst två decimaler.");
  }

  const [whole, decimals = ""] = normalized.split(".");
  const amountMinor = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));

  if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
    throw new Error("Beloppet är för stort eller ogiltigt.");
  }

  return amountMinor;
}

export function buildAccountingEventInput(params: {
  id: string;
  organizationId: string;
  type: SupportedBusinessEventType;
  happenedAt: string;
  amountSek: string;
  description: string;
  paymentAccount?: string | null;
  counterAccount?: string | null;
}): AccountingEventInput {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.happenedAt)) {
    throw new Error("Datumet är ogiltigt.");
  }

  if (!params.description.trim()) {
    throw new Error("Beskrivning måste fyllas i.");
  }

  return {
    id: params.id,
    organizationId: params.organizationId,
    type: params.type,
    companyForm: "sole_trader",
    accountingMethod: "cash_basis",
    currency: "SEK",
    happenedAt: params.happenedAt,
    totalAmountMinor: parseSekToMinor(params.amountSek),
    vatRateBasisPoints: 2500,
    paymentAccount: params.paymentAccount?.trim() || undefined,
    counterAccount: params.counterAccount?.trim() || undefined,
    description: params.description.trim(),
  };
}
