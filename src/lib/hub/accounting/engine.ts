import { postingRules } from "./rules.ts";
import { validatePostingLines } from "./validation.ts";
import type { AccountingEventInput, PostingResult } from "./types.ts";

export function findPostingRule(event: AccountingEventInput) {
  return postingRules.find(
    (rule) =>
      rule.supportedTypes.includes(event.type) &&
      rule.companyForms.includes(event.companyForm) &&
      rule.accountingMethods.includes(event.accountingMethod),
  );
}

export function createBookkeepingDraft(event: AccountingEventInput): PostingResult {
  const rule = findPostingRule(event);

  if (!rule) {
    return {
      ruleId: "unsupported",
      ruleVersion: 0,
      confidence: "red",
      lines: [],
      plainLanguageSummary:
        "Händelsen stöds inte i den första bokföringsversionen och behöver hanteras manuellt.",
      advancedSummary: "",
      warnings: ["Ingen deterministisk regel matchade händelsen."],
      requiredQuestions: ["Välj en stödd händelsetyp eller hantera manuellt."],
    };
  }

  const result = rule.build(event);
  const validation = validatePostingLines(result.lines);

  if (!validation.ok) {
    return {
      ...result,
      confidence: "red",
      warnings: [...result.warnings, ...validation.errors],
    };
  }

  return result;
}
