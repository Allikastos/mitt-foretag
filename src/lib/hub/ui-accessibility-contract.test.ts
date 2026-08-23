import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const navSource = readFileSync(
  new URL("../../../components/hub/nav.tsx", import.meta.url),
  "utf8",
);
const appShellSource = readFileSync(
  new URL("../../../components/hub/app-shell.tsx", import.meta.url),
  "utf8",
);
const accountingSource = readFileSync(
  new URL("../../../components/hub/accounting-smart-input.tsx", import.meta.url),
  "utf8",
);
const accountingFallbackSource = readFileSync(
  new URL("../../../components/hub/accounting-preview.tsx", import.meta.url),
  "utf8",
);

test("expandable navigation exposes state and controlled regions", () => {
  assert.match(navSource, /aria-expanded=\{isExpanded\}/);
  assert.match(navSource, /aria-controls=\{regionId\}/);
  assert.match(navSource, /aria-current=\{active \? "page"/);
  assert.match(navSource, /aria-label="Hubbnavigering"/);
});

test("mobile navigation closes after a route is selected", () => {
  assert.match(
    appShellSource,
    /<HubNav onNavigate=\{\(\) => setIsMobileMenuOpen\(false\)\} \/>/,
  );
});

test("smart accounting is visibly local, preview-only and has no persistence action", () => {
  assert.match(accountingSource, /Detta är inte AI/);
  assert.match(accountingSource, /kan inte spara, godkänna eller bokföra/);
  assert.doesNotMatch(accountingSource, /saveBookkeepingDraftAction/);
  assert.match(accountingFallbackSource, /Välj händelse manuellt/);
});
