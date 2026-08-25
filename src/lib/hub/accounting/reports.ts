import type { AccountingAccount } from "./types.ts";

export type ReportAccount = Pick<AccountingAccount, "number" | "name" | "kind">;

export type ReportJournalLine = {
  journalEntryId: string;
  journalLabel?: string;
  description?: string;
  postedOn: string;
  accountNumber: string;
  debitMinor: number;
  creditMinor: number;
};

export type AccountingReportInput = {
  accounts: ReportAccount[];
  lines: ReportJournalLine[];
  from?: string | null;
  to?: string | null;
};

export type ReportRow = {
  accountNumber: string;
  accountName: string;
  amountMinor: number;
};

export type GeneralLedgerAccount = ReportAccount & {
  openingMinor: number;
  periodChangeMinor: number;
  closingMinor: number;
  entries: Array<ReportJournalLine & { amountMinor: number }>;
};

export const vatBoxDefinitions = [
  { box: "05", label: "Momspliktig försäljning", accounts: ["3001", "3002", "3003", "3041", "3042", "3043", "3051"] },
  { box: "10", label: "Utgående moms 25 %", accounts: ["2611"] },
  { box: "11", label: "Utgående moms 12 %", accounts: ["2621"] },
  { box: "12", label: "Utgående moms 6 %", accounts: ["2631"] },
  { box: "20", label: "Inköp av varor från annat EU-land", accounts: ["4056"] },
  { box: "21", label: "Inköp av tjänster från annat EU-land", accounts: ["4535"] },
  { box: "22", label: "Inköp av tjänster utanför EU", accounts: ["4531", "4532"] },
  { box: "30", label: "Utgående moms 25 % vid inköp", accounts: ["2614", "2615"] },
  { box: "31", label: "Utgående moms 12 % vid inköp", accounts: ["2624", "2625"] },
  { box: "32", label: "Utgående moms 6 % vid inköp", accounts: ["2634", "2635"] },
  { box: "35", label: "Försäljning av varor till annat EU-land", accounts: ["3106"] },
  { box: "36", label: "Försäljning av varor utanför EU", accounts: ["3105"] },
  { box: "37", label: "Mellanmans försäljning vid trepartshandel", accounts: ["3108"] },
  { box: "38", label: "Överföring av varor till annat EU-land", accounts: ["3107"] },
  { box: "39", label: "Försäljning av tjänster till annat EU-land", accounts: ["3308"] },
  { box: "40", label: "Övrig försäljning av tjänster utomlands", accounts: ["3305"] },
  { box: "41", label: "Försäljning med omvänd skattskyldighet i Sverige", accounts: ["3231"] },
  { box: "42", label: "Övrig momsfri försäljning", accounts: ["3044"] },
  { box: "48", label: "Ingående moms", accounts: ["2641"] },
] as const;

function inPeriod(line: ReportJournalLine, from?: string | null, to?: string | null) {
  return (!from || line.postedOn >= from) && (!to || line.postedOn <= to);
}

function isBetween(number: string, start: number, end: number) {
  const parsed = Number(number);
  return Number.isInteger(parsed) && parsed >= start && parsed <= end;
}

function signedAmount(line: ReportJournalLine, kind: AccountingAccount["kind"]) {
  return kind === "asset" || kind === "expense"
    ? line.debitMinor - line.creditMinor
    : line.creditMinor - line.debitMinor;
}

export function buildAccountingReports(input: AccountingReportInput) {
  const accountByNumber = new Map(input.accounts.map((item) => [item.number, item]));
  const periodLines = input.lines.filter((line) => inPeriod(line, input.from, input.to));
  const balanceLines = input.lines.filter((line) => !input.to || line.postedOn <= input.to);

  const sumByAccount = (lines: ReportJournalLine[]) => {
    const result = new Map<string, number>();
    for (const line of lines) {
      const account = accountByNumber.get(line.accountNumber);
      if (!account) continue;
      result.set(
        line.accountNumber,
        (result.get(line.accountNumber) ?? 0) + signedAmount(line, account.kind),
      );
    }
    return result;
  };

  const periodTotals = sumByAccount(periodLines);
  const balanceTotals = sumByAccount(balanceLines);

  const rows = (kinds: AccountingAccount["kind"][], totals: Map<string, number>) =>
    input.accounts
      .filter((account) => kinds.includes(account.kind))
      .map((account) => ({
        accountNumber: account.number,
        accountName: account.name,
        amountMinor: totals.get(account.number) ?? 0,
      }))
      .filter((row) => row.amountMinor !== 0)
      .sort((a, b) => a.accountNumber.localeCompare(b.accountNumber, "sv"));

  const incomeRows = rows(["income"], periodTotals);
  const expenseRows = rows(["expense"], periodTotals);
  const assetRows = rows(["asset"], balanceTotals);
  const liabilityAndEquityRows = rows(["liability", "equity"], balanceTotals);
  const incomeMinor = incomeRows.reduce((sum, row) => sum + row.amountMinor, 0);
  const expenseMinor = expenseRows.reduce((sum, row) => sum + row.amountMinor, 0);
  const resultMinor = incomeMinor - expenseMinor;

  const vatBoxes = Object.fromEntries(
    vatBoxDefinitions.map((definition) => [
      definition.box,
      definition.accounts.reduce((sum, number) => sum + (periodTotals.get(number) ?? 0), 0),
    ]),
  );
  const outputVatMinor = ["10", "11", "12", "30", "31", "32"].reduce(
    (sum, box) => sum + (vatBoxes[box] ?? 0),
    0,
  );
  const inputVatMinor = vatBoxes["48"] ?? 0;

  const salesByMonth = new Map<string, number>();
  for (const line of periodLines) {
    if (!isBetween(line.accountNumber, 3000, 3999)) continue;
    const month = line.postedOn.slice(0, 7);
    salesByMonth.set(month, (salesByMonth.get(month) ?? 0) + line.creditMinor - line.debitMinor);
  }

  const entries = new Map<string, ReportJournalLine[]>();
  for (const line of periodLines) {
    const entryLines = entries.get(line.journalEntryId) ?? [];
    entryLines.push(line);
    entries.set(line.journalEntryId, entryLines);
  }
  const cashFlow = { operating: 0, investing: 0, financing: 0 };
  for (const entryLines of entries.values()) {
    const cashChange = entryLines
      .filter((line) => isBetween(line.accountNumber, 1900, 1999))
      .reduce((sum, line) => sum + line.debitMinor - line.creditMinor, 0);
    if (!cashChange) continue;
    const counterparts = entryLines.filter((line) => !isBetween(line.accountNumber, 1900, 1999));
    if (counterparts.some((line) => isBetween(line.accountNumber, 1000, 1399))) {
      cashFlow.investing += cashChange;
    } else if (counterparts.some((line) => isBetween(line.accountNumber, 2000, 2399))) {
      cashFlow.financing += cashChange;
    } else {
      cashFlow.operating += cashChange;
    }
  }

  const assetsMinor = assetRows.reduce((sum, row) => sum + row.amountMinor, 0);
  const liabilitiesAndEquityMinor = liabilityAndEquityRows.reduce(
    (sum, row) => sum + row.amountMinor,
    0,
  );
  const historicalIncomeMinor = rows(["income"], balanceTotals).reduce(
    (sum, row) => sum + row.amountMinor,
    0,
  );
  const historicalExpenseMinor = rows(["expense"], balanceTotals).reduce(
    (sum, row) => sum + row.amountMinor,
    0,
  );
  const currentResultMinor = historicalIncomeMinor - historicalExpenseMinor;

  const generalLedger: GeneralLedgerAccount[] = input.accounts
    .map((account) => {
      const openingLines = input.lines.filter(
        (line) =>
          line.accountNumber === account.number &&
          Boolean(input.from) &&
          line.postedOn < String(input.from),
      );
      const accountPeriodLines = periodLines
        .filter((line) => line.accountNumber === account.number)
        .sort((a, b) =>
          `${a.postedOn}-${a.journalLabel ?? a.journalEntryId}`.localeCompare(
            `${b.postedOn}-${b.journalLabel ?? b.journalEntryId}`,
            "sv",
          ),
        );
      const openingMinor = openingLines.reduce(
        (sum, line) => sum + signedAmount(line, account.kind),
        0,
      );
      const entries = accountPeriodLines.map((line) => ({
        ...line,
        amountMinor: signedAmount(line, account.kind),
      }));
      const periodChangeMinor = entries.reduce((sum, line) => sum + line.amountMinor, 0);
      return {
        ...account,
        openingMinor,
        periodChangeMinor,
        closingMinor: openingMinor + periodChangeMinor,
        entries,
      };
    })
    .filter((account) => account.openingMinor !== 0 || account.entries.length > 0)
    .sort((a, b) => a.number.localeCompare(b.number, "sv"));

  return {
    incomeStatement: { incomeRows, expenseRows, incomeMinor, expenseMinor, resultMinor },
    balanceSheet: {
      assetRows,
      liabilityAndEquityRows,
      assetsMinor,
      liabilitiesAndEquityMinor,
      currentResultMinor,
      differenceMinor: assetsMinor - liabilitiesAndEquityMinor - currentResultMinor,
    },
    vat: {
      boxes: vatBoxes,
      outputVatMinor,
      inputVatMinor,
      payableMinor: outputVatMinor - inputVatMinor,
    },
    sales: Array.from(salesByMonth, ([month, amountMinor]) => ({ month, amountMinor })).sort(
      (a, b) => a.month.localeCompare(b.month),
    ),
    cashFlow: {
      ...cashFlow,
      netChangeMinor: cashFlow.operating + cashFlow.investing + cashFlow.financing,
    },
    generalLedger,
  };
}
