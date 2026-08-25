import { parseSekToMinor } from "./presentation.ts";
import type { AccountingAccount, JournalLineDraft, PostingResult } from "./types.ts";
import { validatePostingLines } from "./validation.ts";

export type ManualJournalLineInput = {
  accountNumber: string;
  side: "debit" | "credit";
  amountSek: string;
  description?: string;
};

export function buildManualPostingResult(
  input: ManualJournalLineInput[],
  accounts: AccountingAccount[],
): PostingResult {
  if (input.length < 2 || input.length > 50) {
    throw new Error("En manuell verifikation behöver mellan två och femtio rader.");
  }

  const accountByNumber = new Map(accounts.map((item) => [item.number, item]));
  const lines: JournalLineDraft[] = input.map((line) => {
    const accountNumber = line.accountNumber.trim();
    const selectedAccount = accountByNumber.get(accountNumber);
    if (!selectedAccount) {
      throw new Error(`Konto ${accountNumber || "saknas"} är inte aktivt i företagets kontoplan.`);
    }
    if (line.side !== "debit" && line.side !== "credit") {
      throw new Error("Varje rad måste vara debet eller kredit.");
    }

    return {
      accountNumber,
      accountName: selectedAccount.name,
      side: line.side,
      amountMinor: parseSekToMinor(line.amountSek),
      vatCode: null,
      description: line.description?.trim().slice(0, 200) ?? "",
    };
  });
  const validation = validatePostingLines(lines);
  if (!validation.ok) throw new Error(validation.errors.join(" "));

  return {
    ruleId: "manual_journal_entry",
    ruleVersion: 1,
    confidence: "yellow",
    lines,
    plainLanguageSummary: "Manuellt konteringsutkast. Samtliga konton och belopp måste granskas före bokföring.",
    advancedSummary: "Fri dubbelbokföring med aktiva organisationskonton.",
    warnings: ["Manuell kontering har inte kontrollerats mot skatte- eller bokslutsregler."],
    requiredQuestions: [],
  };
}
