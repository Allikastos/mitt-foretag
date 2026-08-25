import test from "node:test";
import assert from "node:assert/strict";
import { buildAccountingCsv, buildPreliminarySie4i } from "./export.ts";

const input = {
  organizationName: "Testbolaget",
  accounts: [
    { number: "1930", name: "Företagskonto", kind: "asset" as const },
    { number: "2018", name: "Egna insättningar", kind: "equity" as const },
  ],
  lines: [
    { journalEntryId: "entry-1", journalLabel: "A1", description: "Start", postedOn: "2026-01-01", accountNumber: "1930", debitMinor: 10_000, creditMinor: 0 },
    { journalEntryId: "entry-1", journalLabel: "A1", description: "Start", postedOn: "2026-01-01", accountNumber: "2018", debitMinor: 0, creditMinor: 10_000 },
  ],
};

test("exports journal lines as Swedish CSV", () => {
  const csv = buildAccountingCsv(input);
  assert.match(csv, /\uFEFF"Datum";"Verifikation"/);
  assert.match(csv, /"1930";"Företagskonto";"100\.00";"0\.00"/);
});

test("exports balanced entries as preliminary SIE4i transactions", () => {
  const sie = buildPreliminarySie4i(input);
  assert.match(sie, /#SIETYP 4/);
  assert.match(sie, /#VER "A" 1 20260101 "Start"/);
  assert.match(sie, /#TRANS 1930 \{\} 100\.00/);
  assert.match(sie, /#TRANS 2018 \{\} -100\.00/);
});
