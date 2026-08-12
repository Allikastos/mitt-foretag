import test from "node:test";
import assert from "node:assert/strict";
import { DevelopmentMemoryJobQueueProvider } from "./job-queue.ts";

const input = {
  organizationId: "org-a",
  createdBy: "user-a",
  type: "report_generation" as const,
  entityType: "report",
  entityId: "report-a",
  payload: {},
  idempotencyKey: "report-request-a",
  requestHash: "a".repeat(64),
};

test("development queue deduplicates jobs inside one organization", async () => {
  const queue = new DevelopmentMemoryJobQueueProvider("test");
  const first = await queue.enqueue(input);
  const duplicate = await queue.enqueue(input);

  assert.deepEqual(duplicate, first);
});

test("development queue rejects a reused key for different input", async () => {
  const queue = new DevelopmentMemoryJobQueueProvider("test");
  await queue.enqueue(input);

  await assert.rejects(
    queue.enqueue({ ...input, requestHash: "b".repeat(64) }),
    /annat anrop/,
  );
});

test("development queue keeps tenant status access isolated", async () => {
  const queue = new DevelopmentMemoryJobQueueProvider("test");
  const job = await queue.enqueue(input);

  assert.equal(
    await queue.getStatus({ organizationId: "org-a", jobId: job.id }),
    "queued",
  );
  await assert.rejects(
    queue.getStatus({ organizationId: "org-b", jobId: job.id }),
    /kunde inte hittas/,
  );
});

test("development queue cannot be constructed for production", () => {
  assert.throws(
    () => new DevelopmentMemoryJobQueueProvider("production"),
    /inte användas i produktion/,
  );
});
