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
const customerComboboxSource = readFileSync(
  new URL("../../../components/hub/customer-combobox.tsx", import.meta.url),
  "utf8",
);
const hubFormsSource = readFileSync(
  new URL("../../../components/hub/forms.tsx", import.meta.url),
  "utf8",
);
const customerSearchRouteSource = readFileSync(
  new URL("../../../app/api/hub/customers/search/route.ts", import.meta.url),
  "utf8",
);
const dashboardSource = readFileSync(
  new URL("../../../app/hub/(protected)/page.tsx", import.meta.url),
  "utf8",
);
const hubActionsSource = readFileSync(
  new URL("../../../app/hub/actions.ts", import.meta.url),
  "utf8",
);
const salesValidationActionSource = hubActionsSource.slice(
  hubActionsSource.indexOf(
    "export async function registerSalesValidationActivityAction",
  ),
  hubActionsSource.indexOf("async function requireMemberInOrganization"),
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

test("customer selection is searchable and keyboard accessible everywhere", () => {
  assert.equal(hubFormsSource.match(/<CustomerCombobox/g)?.length, 3);
  assert.doesNotMatch(
    hubFormsSource,
    /<select[\s\S]{0,200}name="customer_id"/,
  );
  assert.match(customerComboboxSource, /role="combobox"/);
  assert.match(customerComboboxSource, /aria-autocomplete="list"/);
  assert.match(customerComboboxSource, /role="listbox"/);
  assert.match(customerComboboxSource, /event\.key === "ArrowDown"/);
  assert.match(customerComboboxSource, /event\.key === "Enter"/);
});

test("remote customer search stays tenant and role scoped", () => {
  assert.match(customerSearchRouteSource, /requireHubContext\(\)/);
  assert.match(
    customerSearchRouteSource,
    /\.eq\("organization_id", organization\.id\)/,
  );
  assert.match(customerSearchRouteSource, /\.eq\("visibility", "organization"\)/);
  assert.match(customerSearchRouteSource, /employee_customer_scope === "assigned_only"/);
});

test("sales validation exposes honest progress and protects mutations", () => {
  assert.match(dashboardSource, /id: "sales-validation"/);
  assert.match(dashboardSource, /role="progressbar"/);
  assert.match(dashboardSource, /Inga nollvärden visas/);
  assert.match(salesValidationActionSource, /membership\.role === "viewer"/);
  assert.match(
    salesValidationActionSource,
    /\.eq\("organization_id", organization\.id\)/,
  );
  assert.match(salesValidationActionSource, /parseSalesValidationActivity/);
});
