import { buildAccountingEventInput } from "../presentation.ts";
import type { AccountingEventInput } from "../types.ts";
import type {
  InterpretedBusinessEventV1,
  InterpretedPaymentMethod,
} from "./types.ts";

export function interpretedPaymentMethodLabel(
  method: InterpretedPaymentMethod | null,
) {
  switch (method) {
    case "company_bank_account":
      return "Företagets bankkonto";
    case "company_card":
      return "Företagskort";
    case "private_funds":
      return "Privata medel";
    case "cash":
      return "Kontant";
    case "own_account_transfer":
      return "Mellan egna konton";
    default:
      return "Inte tolkat";
  }
}

export function buildEventFromInterpretation(params: {
  interpretation: InterpretedBusinessEventV1;
  id: string;
  organizationId: string;
}): AccountingEventInput {
  const { interpretation } = params;

  if (
    !interpretation.canCreatePostingPreview ||
    !interpretation.eventType ||
    interpretation.amountMinor === null ||
    !interpretation.happenedOn
  ) {
    throw new Error("Tolkningen är inte komplett nog för ett konteringsförslag.");
  }

  const amountSek = (interpretation.amountMinor / 100).toFixed(2);

  return buildAccountingEventInput({
    id: params.id,
    organizationId: params.organizationId,
    type: interpretation.eventType,
    happenedAt: interpretation.happenedOn,
    amountSek,
    description: interpretation.source.text,
    paymentAccount: interpretation.paymentAccount,
    counterAccount: interpretation.counterAccount,
  });
}
