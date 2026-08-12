import type { AccountingAccount } from "./types.ts";

// Starter account suggestions only. They must be reviewed against the selected
// BAS year and the company's accounting setup before real bookkeeping use.
export const starterAccounts = {
  bank: {
    number: "1930",
    name: "Företagskonto",
    kind: "asset",
    reviewRequired: true,
  },
  serviceSales25Vat: {
    number: "3041",
    name: "Försäljning tjänster, 25% moms",
    kind: "income",
    reviewRequired: true,
  },
  serviceSalesNoVat: {
    number: "3044",
    name: "Försäljning tjänster, momsfri",
    kind: "income",
    reviewRequired: true,
  },
  outputVat25: {
    number: "2611",
    name: "Utgående moms 25%",
    kind: "liability",
    reviewRequired: true,
  },
  inputVat: {
    number: "2641",
    name: "Ingående moms",
    kind: "asset",
    reviewRequired: true,
  },
  suppliesExpense: {
    number: "5460",
    name: "Förbrukningsmaterial",
    kind: "expense",
    reviewRequired: true,
  },
  nonDeductibleExpense: {
    number: "6992",
    name: "Övriga externa kostnader, ej avdragsgilla",
    kind: "expense",
    reviewRequired: true,
  },
  ownerDeposit: {
    number: "2018",
    name: "Övriga egna insättningar",
    kind: "equity",
    reviewRequired: true,
  },
  ownerWithdrawal: {
    number: "2013",
    name: "Övriga egna uttag",
    kind: "equity",
    reviewRequired: true,
  },
} satisfies Record<string, AccountingAccount>;

export function getStarterAccount(number: string) {
  return Object.values(starterAccounts).find((account) => account.number === number);
}
