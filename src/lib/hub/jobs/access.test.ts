import test from "node:test";
import assert from "node:assert/strict";
import {
  hasProcessingJobCapability,
  requireProcessingJobCapability,
} from "./access.ts";

test("owners and admins may control processing jobs", () => {
  for (const role of ["owner", "admin"] as const) {
    assert.equal(hasProcessingJobCapability(role, "view"), true);
    assert.equal(hasProcessingJobCapability(role, "cancel"), true);
    assert.equal(hasProcessingJobCapability(role, "retry"), true);
  }
});

test("members and viewers have read-only process access", () => {
  for (const role of ["member", "viewer"] as const) {
    assert.equal(hasProcessingJobCapability(role, "view"), true);
    assert.equal(hasProcessingJobCapability(role, "cancel"), false);
    assert.equal(hasProcessingJobCapability(role, "retry"), false);
  }

  assert.throws(
    () => requireProcessingJobCapability("member", "retry"),
    /saknar behörighet/,
  );
});
