import type { ReportAccount, ReportJournalLine } from "./reports.ts";

export type AccountingExportInput = {
  organizationName: string;
  accounts: ReportAccount[];
  lines: ReportJournalLine[];
  from?: string | null;
  to?: string | null;
};

function selectedLines(input: AccountingExportInput) {
  return input.lines.filter(
    (line) => (!input.from || line.postedOn >= input.from) && (!input.to || line.postedOn <= input.to),
  );
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function sieText(value: string) {
  return `"${value.replaceAll("\\", " ").replaceAll('"', "'").replaceAll("\n", " ")}"`;
}

export function buildAccountingCsv(input: AccountingExportInput) {
  const accountNames = new Map(input.accounts.map((account) => [account.number, account.name]));
  const rows = selectedLines(input).map((line) => [
    line.postedOn,
    line.journalLabel ?? line.journalEntryId,
    line.description ?? "",
    line.accountNumber,
    accountNames.get(line.accountNumber) ?? "",
    (line.debitMinor / 100).toFixed(2),
    (line.creditMinor / 100).toFixed(2),
  ]);
  return `\uFEFF${[
    ["Datum", "Verifikation", "Beskrivning", "Konto", "Kontonamn", "Debet SEK", "Kredit SEK"],
    ...rows,
  ].map((row) => row.map(csvCell).join(";")).join("\r\n")}\r\n`;
}

export function buildPreliminarySie4i(input: AccountingExportInput) {
  const accountNumbers = new Set(selectedLines(input).map((line) => line.accountNumber));
  const entries = new Map<string, ReportJournalLine[]>();
  for (const line of selectedLines(input)) {
    const current = entries.get(line.journalEntryId) ?? [];
    current.push(line);
    entries.set(line.journalEntryId, current);
  }
  const output = [
    "#FLAGGA 0",
    "#PROGRAM \"Altura Nova Hub\" \"preview\"",
    "#FORMAT UTF-8",
    "#SIETYP 4",
    `#FNAMN ${sieText(input.organizationName)}`,
    ...input.accounts
      .filter((account) => accountNumbers.has(account.number))
      .sort((a, b) => a.number.localeCompare(b.number))
      .map((account) => `#KONTO ${account.number} ${sieText(account.name)}`),
  ];

  for (const entryLines of entries.values()) {
    const first = entryLines[0];
    const label = first.journalLabel ?? "A0";
    const series = label.match(/^\D+/)?.[0] ?? "A";
    const number = label.match(/\d+$/)?.[0] ?? "0";
    output.push(`#VER ${sieText(series)} ${number} ${first.postedOn.replaceAll("-", "")} ${sieText(first.description ?? "Verifikation")}`);
    output.push("{");
    for (const line of entryLines) {
      const amount = (line.debitMinor - line.creditMinor) / 100;
      output.push(`#TRANS ${line.accountNumber} {} ${amount.toFixed(2)} ${sieText(line.description ?? "")}`);
    }
    output.push("}");
  }

  return `${output.join("\r\n")}\r\n`;
}
