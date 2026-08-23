import type { InterpretedBusinessEventV1 } from "./types.ts";

const validConfidence = new Set(["green", "yellow", "red"]);

export function validateInterpretedBusinessEventV1(
  value: InterpretedBusinessEventV1,
) {
  const errors: string[] = [];

  if (value.schemaVersion !== "1") errors.push("Okänd schemaversion.");
  if (value.interpreter.kind !== "local_rule_parser") {
    errors.push("Okänd tolktyp.");
  }
  if (!value.source.text.trim()) errors.push("Källtext saknas.");
  if (!validConfidence.has(value.confidence)) errors.push("Ogiltig confidence.");
  if (value.amountMinor !== null && (!Number.isSafeInteger(value.amountMinor) || value.amountMinor <= 0)) {
    errors.push("Beloppet är ogiltigt.");
  }
  if (value.happenedOn !== null && !/^\d{4}-\d{2}-\d{2}$/.test(value.happenedOn)) {
    errors.push("Datumet är ogiltigt.");
  }
  if (value.canCreatePostingPreview && value.stopReasons.length > 0) {
    errors.push("En stoppad tolkning får inte skapa konteringsförslag.");
  }
  if (
    value.canCreatePostingPreview &&
    (!value.eventType || value.amountMinor === null || !value.happenedOn)
  ) {
    errors.push("En komplett händelse krävs för konteringsförslag.");
  }

  if (errors.length) {
    throw new Error(`Tolkningsobjektet är ogiltigt: ${errors.join(" ")}`);
  }

  return value;
}
