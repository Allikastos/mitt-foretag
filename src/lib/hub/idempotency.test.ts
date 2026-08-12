import test from "node:test";
import assert from "node:assert/strict";
import {
  buildIdempotencyScope,
  decideIdempotentOperation,
  normalizeIdempotencyKey,
  type IdempotencyRecord,
} from "./idempotency.ts";

function record(
  status: IdempotencyRecord["status"],
): IdempotencyRecord {
  return {
    organizationId: "org-a",
    operation: "upload_document",
    key: "request-123",
    requestHash: "hash-a",
    status,
    resultEntityType: status === "succeeded" ? "document" : null,
    resultEntityId: status === "succeeded" ? "doc-1" : null,
  };
}

test("idempotency scopes identical keys by organization and operation", () => {
  assert.equal(
    buildIdempotencyScope({
      organizationId: "org-a",
      operation: "upload_document",
      key: "request-123",
    }),
    "org-a:upload_document:request-123",
  );
});

test("a completed operation replays the same result", () => {
  assert.deepEqual(
    decideIdempotentOperation({ existing: record("succeeded"), requestHash: "hash-a" }),
    {
      outcome: "replay",
      resultEntityType: "document",
      resultEntityId: "doc-1",
    },
  );
});

test("a reused key with a different request is denied", () => {
  assert.throws(
    () =>
      decideIdempotentOperation({
        existing: record("succeeded"),
        requestHash: "hash-b",
      }),
    /annat anrop/,
  );
});

test("failed operations may retry but concurrent duplicates are denied", () => {
  assert.deepEqual(
    decideIdempotentOperation({ existing: record("failed"), requestHash: "hash-a" }),
    { outcome: "retry" },
  );
  assert.throws(
    () =>
      decideIdempotentOperation({
        existing: record("started"),
        requestHash: "hash-a",
      }),
    /behandlas redan/,
  );
});

test("idempotency keys have bounded length", () => {
  assert.equal(normalizeIdempotencyKey(" request-123 "), "request-123");
  assert.throws(() => normalizeIdempotencyKey("short"), /mellan 8 och 200/);
});
