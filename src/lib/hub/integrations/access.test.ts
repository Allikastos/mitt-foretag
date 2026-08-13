import assert from "node:assert/strict";
import test from "node:test";
import {
  hasIntegrationCapability,
  requireIntegrationCapability,
} from "./access.ts";

test("ägare och admin kan hantera integrationer", () => {
  assert.equal(hasIntegrationCapability("owner", "manage"), true);
  assert.equal(hasIntegrationCapability("admin", "manage"), true);
});

test("medlemmar kan läsa men inte hantera integrationer", () => {
  assert.equal(hasIntegrationCapability("member", "view"), true);
  assert.equal(hasIntegrationCapability("member", "manage"), false);
  assert.throws(
    () => requireIntegrationCapability("viewer", "manage"),
    /saknar behörighet/,
  );
});
