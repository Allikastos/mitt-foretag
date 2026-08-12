import test from "node:test";
import assert from "node:assert/strict";
import {
  hasDocumentCapability,
  requireDocumentCapability,
} from "./access.ts";

test("owners, admins and members may prepare document facts", () => {
  for (const role of ["owner", "admin", "member"] as const) {
    assert.equal(hasDocumentCapability(role, "upload"), true);
    assert.equal(hasDocumentCapability(role, "edit_facts"), true);
    assert.equal(hasDocumentCapability(role, "create_accounting_draft"), true);
  }
});

test("viewers remain read-only in the document workflow", () => {
  assert.equal(hasDocumentCapability("viewer", "view"), true);
  assert.equal(hasDocumentCapability("viewer", "edit_facts"), false);
  assert.throws(
    () => requireDocumentCapability("viewer", "edit_facts"),
    /saknar behörighet/,
  );
});
