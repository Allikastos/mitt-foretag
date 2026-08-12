export type CompanyForm = "sole_trader" | "limited_company";
export type AccountingMethod = "cash_basis" | "accrual";
export type AccountingCurrency = "SEK";
export type EntrySide = "debit" | "credit";
export type RuleConfidence = "green" | "yellow" | "red";

export type SupportedBusinessEventType =
  | "paid_domestic_service_sale_25_vat"
  | "paid_domestic_service_sale_no_vat"
  | "paid_domestic_purchase_25_vat"
  | "purchase_without_deductible_vat"
  | "owner_deposit"
  | "owner_withdrawal"
  | "transfer_between_own_accounts";

export type UnsupportedBusinessEventType =
  | "eu_trade"
  | "non_eu_trade"
  | "reverse_charge_vat"
  | "oss"
  | "payroll"
  | "loan"
  | "leasing"
  | "fixed_asset"
  | "inventory"
  | "year_end_closing";

export type AccountingAccount = {
  number: string;
  name: string;
  kind: "asset" | "liability" | "equity" | "income" | "expense";
  reviewRequired: boolean;
};

export type AccountingEventInput = {
  id: string;
  organizationId: string;
  type: SupportedBusinessEventType;
  companyForm: CompanyForm;
  accountingMethod: AccountingMethod;
  currency: AccountingCurrency;
  happenedAt: string;
  totalAmountMinor: number;
  vatRateBasisPoints?: number;
  paymentAccount?: string;
  expenseAccount?: string;
  description: string;
};

export type JournalLineDraft = {
  accountNumber: string;
  accountName: string;
  side: EntrySide;
  amountMinor: number;
  vatCode: string | null;
  description: string;
};

export type PostingRule = {
  id: string;
  version: number;
  description: string;
  supportedTypes: SupportedBusinessEventType[];
  companyForms: CompanyForm[];
  accountingMethods: AccountingMethod[];
  requiredFields: Array<keyof AccountingEventInput>;
  sourceRefs: string[];
  build: (event: AccountingEventInput) => PostingResult;
};

export type PostingResult = {
  ruleId: string;
  ruleVersion: number;
  confidence: RuleConfidence;
  lines: JournalLineDraft[];
  plainLanguageSummary: string;
  advancedSummary: string;
  warnings: string[];
  requiredQuestions: string[];
};

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};
