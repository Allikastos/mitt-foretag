import type {
  AccountingEventInput,
  JournalLineDraft,
  PostingRule,
  ValidationResult,
} from "./types.ts";

export function isMinorAmount(value: number) {
  return Number.isInteger(value) && value >= 0;
}

export function splitVatInclusiveAmount(
  totalAmountMinor: number,
  vatRateBasisPoints: number,
) {
  const divisor = 10_000 + vatRateBasisPoints;
  const netMinor = Math.round((totalAmountMinor * 10_000) / divisor);
  const vatMinor = totalAmountMinor - netMinor;

  return { netMinor, vatMinor };
}

export function sumLines(lines: JournalLineDraft[], side: "debit" | "credit") {
  return lines
    .filter((line) => line.side === side)
    .reduce((sum, line) => sum + line.amountMinor, 0);
}

export function validatePostingLines(lines: JournalLineDraft[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (lines.length < 2) {
    errors.push("En verifikation behöver minst två rader.");
  }

  for (const line of lines) {
    if (!isMinorAmount(line.amountMinor) || line.amountMinor === 0) {
      errors.push(`Ogiltigt belopp på konto ${line.accountNumber}.`);
    }
  }

  const debit = sumLines(lines, "debit");
  const credit = sumLines(lines, "credit");

  if (debit !== credit) {
    errors.push("Debet och kredit balanserar inte.");
  }

  if (lines.some((line) => line.accountName.includes("granskas"))) {
    warnings.push("Ett eller flera konton behöver granskas.");
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function validateEventForRule(
  event: AccountingEventInput,
  rule: PostingRule,
): ValidationResult {
  const errors: string[] = [];

  if (!rule.supportedTypes.includes(event.type)) {
    errors.push("Regeln stödjer inte den här händelsetypen.");
  }

  if (!rule.companyForms.includes(event.companyForm)) {
    errors.push("Regeln stödjer inte företagets företagsform.");
  }

  if (!rule.accountingMethods.includes(event.accountingMethod)) {
    errors.push("Regeln stödjer inte företagets redovisningsmetod.");
  }

  if (event.currency !== "SEK") {
    errors.push("Första versionen stödjer endast SEK.");
  }

  if (!isMinorAmount(event.totalAmountMinor) || event.totalAmountMinor === 0) {
    errors.push("Beloppet behöver vara större än noll och anges i ören.");
  }

  for (const field of rule.requiredFields) {
    if (event[field] === undefined || event[field] === null || event[field] === "") {
      errors.push(`Obligatoriskt fält saknas: ${field}.`);
    }
  }

  return { ok: errors.length === 0, errors, warnings: [] };
}
