import { starterAccounts } from "./accounts.ts";
import {
  splitVatInclusiveAmount,
  validateEventForRule,
  validatePostingLines,
} from "./validation.ts";
import type {
  AccountingEventInput,
  JournalLineDraft,
  PostingResult,
  PostingRule,
} from "./types.ts";

const sourceRefs = [
  "BAS kontoplaner 2026: https://www.bas.se/kontoplaner/",
  "BAS kontoplanens uppbyggnad: https://www.bas.se/kontoplaner/kontoplanens-uppbyggnad-och-anvandning/",
  "Skatteverket om moms och BAS-konton: https://www4.skatteverket.se/rattsligvagledning/edition/2025.7/411726.html",
  "Skatteverket om egna uttag i enskild firma: https://www.skatteverket.se/foretag/drivaforetag/foretagsformer/enskildnaringsverksamhet/lonochegnauttag.4.361dc8c15312eff6fd2b8e0.html",
];

function line(
  account: { number: string; name: string },
  side: "debit" | "credit",
  amountMinor: number,
  description: string,
  vatCode: string | null = null,
): JournalLineDraft {
  return {
    accountNumber: account.number,
    accountName: account.name,
    side,
    amountMinor,
    vatCode,
    description,
  };
}

function result(params: {
  ruleId: string;
  ruleVersion: number;
  lines: JournalLineDraft[];
  plainLanguageSummary: string;
  warnings?: string[];
  requiredQuestions?: string[];
}): PostingResult {
  const validation = validatePostingLines(params.lines);

  return {
    ruleId: params.ruleId,
    ruleVersion: params.ruleVersion,
    confidence: validation.ok && !params.requiredQuestions?.length ? "green" : "yellow",
    lines: params.lines,
    plainLanguageSummary: params.plainLanguageSummary,
    advancedSummary: params.lines
      .map(
        (entry) =>
          `${entry.side === "debit" ? "Debet" : "Kredit"} ${entry.accountNumber} ${entry.accountName}: ${entry.amountMinor} öre`,
      )
      .join("\n"),
    warnings: [
      ...validation.warnings,
      ...validation.errors,
      ...(params.warnings ?? []),
    ],
    requiredQuestions: params.requiredQuestions ?? [],
  };
}

function ensureRuleInput(event: AccountingEventInput, rule: PostingRule) {
  const validation = validateEventForRule(event, rule);

  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }
}

export const paidDomesticServiceSale25VatRule: PostingRule = {
  id: "se-sole-trader-cash-paid-service-sale-25-vat",
  version: 1,
  description:
    "Betald svensk tjänsteförsäljning med 25 procent moms för enskild firma och kontantmetoden.",
  supportedTypes: ["paid_domestic_service_sale_25_vat"],
  companyForms: ["sole_trader"],
  accountingMethods: ["cash_basis"],
  requiredFields: ["totalAmountMinor", "happenedAt", "description"],
  sourceRefs,
  build(event) {
    ensureRuleInput(event, paidDomesticServiceSale25VatRule);
    const { netMinor, vatMinor } = splitVatInclusiveAmount(
      event.totalAmountMinor,
      event.vatRateBasisPoints ?? 2500,
    );

    return result({
      ruleId: paidDomesticServiceSale25VatRule.id,
      ruleVersion: paidDomesticServiceSale25VatRule.version,
      lines: [
        line(starterAccounts.bank, "debit", event.totalAmountMinor, event.description),
        line(
          starterAccounts.serviceSales25Vat,
          "credit",
          netMinor,
          "Försäljning exklusive moms",
          "SE_VAT_OUTPUT_25",
        ),
        line(
          starterAccounts.outputVat25,
          "credit",
          vatMinor,
          "Utgående moms 25%",
          "SE_VAT_OUTPUT_25",
        ),
      ],
      plainLanguageSummary: `${netMinor / 100} kr är försäljning och ${vatMinor / 100} kr är moms som ska redovisas.`,
      warnings: [
        "Konton och regel behöver granskas av redovisningskunnig person innan verklig bokföring.",
      ],
    });
  },
};

export const paidDomesticServiceSaleNoVatRule: PostingRule = {
  id: "se-sole-trader-cash-paid-service-sale-no-vat",
  version: 1,
  description:
    "Betald svensk tjänsteförsäljning utan moms för enskild firma och kontantmetoden.",
  supportedTypes: ["paid_domestic_service_sale_no_vat"],
  companyForms: ["sole_trader"],
  accountingMethods: ["cash_basis"],
  requiredFields: ["totalAmountMinor", "happenedAt", "description"],
  sourceRefs,
  build(event) {
    ensureRuleInput(event, paidDomesticServiceSaleNoVatRule);

    return result({
      ruleId: paidDomesticServiceSaleNoVatRule.id,
      ruleVersion: paidDomesticServiceSaleNoVatRule.version,
      lines: [
        line(starterAccounts.bank, "debit", event.totalAmountMinor, event.description),
        line(
          starterAccounts.serviceSalesNoVat,
          "credit",
          event.totalAmountMinor,
          "Momsfri försäljning",
        ),
      ],
      plainLanguageSummary:
        "Hela betalningen bokförs som försäljning utan moms. Kontrollera att försäljningen verkligen är momsfri.",
      warnings: ["Momsfri försäljning kräver manuell kontroll av skäl och underlag."],
    });
  },
};

export const paidDomesticPurchase25VatRule: PostingRule = {
  id: "se-sole-trader-cash-paid-domestic-purchase-25-vat",
  version: 1,
  description:
    "Betalt svenskt inköp med 25 procent moms för enskild firma och kontantmetoden.",
  supportedTypes: ["paid_domestic_purchase_25_vat"],
  companyForms: ["sole_trader"],
  accountingMethods: ["cash_basis"],
  requiredFields: ["totalAmountMinor", "happenedAt", "description"],
  sourceRefs,
  build(event) {
    ensureRuleInput(event, paidDomesticPurchase25VatRule);
    const { netMinor, vatMinor } = splitVatInclusiveAmount(
      event.totalAmountMinor,
      event.vatRateBasisPoints ?? 2500,
    );

    return result({
      ruleId: paidDomesticPurchase25VatRule.id,
      ruleVersion: paidDomesticPurchase25VatRule.version,
      lines: [
        line(starterAccounts.suppliesExpense, "debit", netMinor, "Inköp exklusive moms"),
        line(
          starterAccounts.inputVat,
          "debit",
          vatMinor,
          "Ingående moms",
          "SE_VAT_INPUT_25",
        ),
        line(starterAccounts.bank, "credit", event.totalAmountMinor, event.description),
      ],
      plainLanguageSummary: `${netMinor / 100} kr är inköp och ${vatMinor / 100} kr är moms som kan vara avdragsgill.`,
      warnings: [
        "Kostnadskonto och avdragsrätt behöver granskas innan verklig bokföring.",
      ],
    });
  },
};

export const purchaseWithoutDeductibleVatRule: PostingRule = {
  id: "se-sole-trader-cash-purchase-without-deductible-vat",
  version: 1,
  description: "Betalt inköp där moms inte ska dras av.",
  supportedTypes: ["purchase_without_deductible_vat"],
  companyForms: ["sole_trader"],
  accountingMethods: ["cash_basis"],
  requiredFields: ["totalAmountMinor", "happenedAt", "description"],
  sourceRefs,
  build(event) {
    ensureRuleInput(event, purchaseWithoutDeductibleVatRule);

    return result({
      ruleId: purchaseWithoutDeductibleVatRule.id,
      ruleVersion: purchaseWithoutDeductibleVatRule.version,
      lines: [
        line(
          starterAccounts.nonDeductibleExpense,
          "debit",
          event.totalAmountMinor,
          "Inköp utan avdragsgill moms",
        ),
        line(starterAccounts.bank, "credit", event.totalAmountMinor, event.description),
      ],
      plainLanguageSummary:
        "Hela betalningen bokförs som kostnad eftersom ingen moms ska dras av.",
      warnings: ["Ej avdragsgill moms kräver manuell kontroll."],
    });
  },
};

export const ownerDepositRule: PostingRule = {
  id: "se-sole-trader-owner-deposit",
  version: 1,
  description: "Privat insättning till enskild firmas företagskonto.",
  supportedTypes: ["owner_deposit"],
  companyForms: ["sole_trader"],
  accountingMethods: ["cash_basis"],
  requiredFields: ["totalAmountMinor", "happenedAt", "description"],
  sourceRefs,
  build(event) {
    ensureRuleInput(event, ownerDepositRule);

    return result({
      ruleId: ownerDepositRule.id,
      ruleVersion: ownerDepositRule.version,
      lines: [
        line(starterAccounts.bank, "debit", event.totalAmountMinor, event.description),
        line(
          starterAccounts.ownerDeposit,
          "credit",
          event.totalAmountMinor,
          "Privat insättning",
        ),
      ],
      plainLanguageSummary:
        "Pengar har satts in privat i företaget. Det påverkar eget kapital, inte resultatet.",
    });
  },
};

export const ownerWithdrawalRule: PostingRule = {
  id: "se-sole-trader-owner-withdrawal",
  version: 1,
  description: "Eget uttag från enskild firmas företagskonto.",
  supportedTypes: ["owner_withdrawal"],
  companyForms: ["sole_trader"],
  accountingMethods: ["cash_basis"],
  requiredFields: ["totalAmountMinor", "happenedAt", "description"],
  sourceRefs,
  build(event) {
    ensureRuleInput(event, ownerWithdrawalRule);

    return result({
      ruleId: ownerWithdrawalRule.id,
      ruleVersion: ownerWithdrawalRule.version,
      lines: [
        line(
          starterAccounts.ownerWithdrawal,
          "debit",
          event.totalAmountMinor,
          "Eget uttag",
        ),
        line(starterAccounts.bank, "credit", event.totalAmountMinor, event.description),
      ],
      plainLanguageSummary:
        "Ett eget uttag påverkar eget kapital, inte företagets resultat.",
    });
  },
};

export const postingRules = [
  paidDomesticServiceSale25VatRule,
  paidDomesticServiceSaleNoVatRule,
  paidDomesticPurchase25VatRule,
  purchaseWithoutDeductibleVatRule,
  ownerDepositRule,
  ownerWithdrawalRule,
] satisfies PostingRule[];
