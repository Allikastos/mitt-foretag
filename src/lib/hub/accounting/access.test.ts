import test from "node:test";
import assert from "node:assert/strict";
import {
  hasAccountingCapability,
  requireAccountingCapability,
} from "./access.ts";

test("owners and admins may configure, approve and post bookkeeping", () => {
  for (const role of ["owner", "admin"] as const) {
    assert.equal(hasAccountingCapability(role, "configure"), true);
    assert.equal(hasAccountingCapability(role, "approve_draft"), true);
    assert.equal(hasAccountingCapability(role, "post_journal"), true);
  }
});

test("members may prepare drafts but cannot approve or post", () => {
  assert.equal(hasAccountingCapability("member", "create_draft"), true);
  assert.equal(hasAccountingCapability("member", "approve_draft"), false);
  assert.equal(hasAccountingCapability("member", "post_journal"), false);
});

test("viewers remain read-only", () => {
  assert.equal(hasAccountingCapability("viewer", "view"), true);
  assert.equal(hasAccountingCapability("viewer", "create_draft"), false);
  assert.throws(
    () => requireAccountingCapability("viewer", "create_draft"),
    /saknar behörighet/,
  );
});
