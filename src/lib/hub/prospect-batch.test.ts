import assert from "node:assert/strict";
import test from "node:test";
import {
  PROSPECT_BATCH_MAX_ROWS,
  normalizeProspectCompanyName,
  parseProspectBatch,
} from "./prospect-batch.ts";

test("parses a bounded tab-separated prospect batch", () => {
  const result = parseProspectBatch(
    [
      "Exempel AB\tAnna Andersson\tanna@example.se\t\t2026-08-31\tBehöver tydligare bokningsflöde.",
      "Nordisk Service\t\t\t0701234567\t2026-09-01\tNuvarande webbplats fungerar dåligt i mobilen.",
    ].join("\n"),
  );

  assert.deepEqual(result.errors, []);
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0]?.companyName, "Exempel AB");
  assert.equal(result.rows[1]?.email, null);
});

test("rejects missing contact paths, dates, notes and duplicates", () => {
  const result = parseProspectBatch(
    [
      "Exempel AB\tKontakt\t\t\t2026-02-30\t",
      "  exempel   ab  \tKontakt\tkontakt@example.se\t\t2026-08-31\tBehov",
    ].join("\n"),
  );

  assert.equal(result.rows.length, 0);
  assert.ok(result.errors.some((error) => error.includes("e-post eller telefon")));
  assert.ok(result.errors.some((error) => error.includes("återkopplingsdatum")));
  assert.ok(result.errors.some((error) => error.includes("behovsanteckning")));

  const duplicateResult = parseProspectBatch(
    [
      "Exempel AB\t\tkontakt@example.se\t\t2026-08-31\tBehov ett",
      " exempel   ab \t\tannan@example.se\t\t2026-09-01\tBehov två",
    ].join("\n"),
  );
  assert.ok(
    duplicateResult.errors.some((error) =>
      error.includes("redan i den här omgången"),
    ),
  );
});

test("rejects more than the supported number of rows", () => {
  const line = "Företag\t\tkontakt@example.se\t\t2026-08-31\tBehov";
  const result = parseProspectBatch(
    Array.from({ length: PROSPECT_BATCH_MAX_ROWS + 1 }, () => line).join("\n"),
  );

  assert.equal(result.rows.length, 0);
  assert.match(result.errors[0] ?? "", /högst 25 prospekt/);
});

test("rejects oversized fields instead of silently truncating them", () => {
  const result = parseProspectBatch(
    `${"F".repeat(161)}\t\tkontakt@example.se\t\t2026-08-31\tBehov`,
  );

  assert.equal(result.rows.length, 0);
  assert.ok(result.errors.some((error) => error.includes("företagsnamnet är för långt")));
});

test("normalizes company names for duplicate comparison", () => {
  assert.equal(normalizeProspectCompanyName("  Altura   Nova AB "), "altura nova ab");
});
