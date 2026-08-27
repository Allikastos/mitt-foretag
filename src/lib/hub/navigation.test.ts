import test from "node:test";
import assert from "node:assert/strict";
import {
  getHubNavItems,
  hubNavAreas,
  isHubAreaActive,
  isHubPathActive,
} from "./navigation.ts";

test("hub navigation exposes the seven approved main areas", () => {
  assert.deepEqual(
    hubNavAreas.map((area) => area.label),
    [
      "Översikt",
      "Kunder & affärer",
      "Ekonomi",
      "Dokument",
      "Processer",
      "Integrationer",
      "Inställningar",
    ],
  );
});

test("grouping preserves every existing route and includes integrations", () => {
  assert.deepEqual(
    getHubNavItems().map((item) => item.href),
    [
      "/hub",
      "/hub/kunder",
      "/hub/uppgifter",
      "/hub/mal",
      "/hub/fakturor",
      "/hub/bokforing",
      "/hub/dokument",
      "/hub/processer",
      "/hub/integrationer",
      "/hub/installningar",
    ],
  );
});

test("active state matches nested routes without activating overview globally", () => {
  assert.equal(isHubPathActive("/hub/kunder/kund-1", "/hub/kunder"), true);
  assert.equal(isHubPathActive("/hub/kunder", "/hub"), false);
  assert.equal(isHubPathActive("/hub", "/hub"), true);

  const customerArea = hubNavAreas.find((area) => area.id === "customers-business");
  assert.ok(customerArea);
  assert.equal(isHubAreaActive("/hub/uppgifter", customerArea), true);
  assert.equal(isHubAreaActive("/hub/bokforing", customerArea), false);
});

test("navigation labels and compact labels are non-empty and routes are unique", () => {
  const items = getHubNavItems();
  assert.equal(new Set(items.map((item) => item.href)).size, items.length);

  for (const area of hubNavAreas) {
    assert.ok(area.id);
    assert.ok(area.label);
    assert.ok(area.items.length > 0);
    for (const item of area.items) {
      assert.ok(item.label);
      assert.match(item.compactLabel, /^[A-ZÅÄÖ]{2}$/);
    }
  }
});
