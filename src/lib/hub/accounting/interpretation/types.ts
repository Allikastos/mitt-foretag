import type { RuleConfidence, SupportedBusinessEventType } from "../types.ts";

export type InterpretedPaymentMethod =
  | "company_bank_account"
  | "company_card"
  | "private_funds"
  | "cash"
  | "own_account_transfer";

export type InterpretedBusinessEventV1 = {
  schemaVersion: "1";
  interpreter: {
    kind: "local_rule_parser";
    id: "altura-sv-business-event-parser";
    version: 1;
  };
  source: {
    kind: "free_text";
    text: string;
  };
  eventType: SupportedBusinessEventType | null;
  amountMinor: number | null;
  happenedOn: string | null;
  paymentMethod: InterpretedPaymentMethod | null;
  paymentAccount: string | null;
  counterAccount: string | null;
  missingInformation: string[];
  followUpQuestions: string[];
  warnings: string[];
  stopReasons: string[];
  confidence: RuleConfidence;
  canCreatePostingPreview: boolean;
};

export type BusinessEventInterpretationInput = {
  text: string;
  referenceDate?: string;
};

export interface BusinessEventInterpreter {
  interpret(input: BusinessEventInterpretationInput): InterpretedBusinessEventV1;
}
