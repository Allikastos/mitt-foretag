import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionProcessingJob,
  processingJobStatusLabel,
  processingJobTypeLabel,
  retryDelaySeconds,
} from "./model.ts";

test("processing jobs only move through reviewed state transitions", () => {
  assert.equal(canTransitionProcessingJob("queued", "processing"), true);
  assert.equal(canTransitionProcessingJob("processing", "succeeded"), true);
  assert.equal(canTransitionProcessingJob("processing", "queued"), true);
  assert.equal(canTransitionProcessingJob("failed", "queued"), true);
  assert.equal(canTransitionProcessingJob("succeeded", "queued"), false);
  assert.equal(canTransitionProcessingJob("cancelled", "processing"), false);
});

test("retry delay grows exponentially and is bounded", () => {
  assert.equal(retryDelaySeconds(1), 30);
  assert.equal(retryDelaySeconds(2), 60);
  assert.equal(retryDelaySeconds(8), 3600);
  assert.equal(retryDelaySeconds(20), 3600);
  assert.throws(() => retryDelaySeconds(0), /positivt heltal/);
});

test("job labels are Swedish and user-facing", () => {
  assert.equal(processingJobStatusLabel("needs_review"), "Behöver granskas");
  assert.equal(processingJobTypeLabel("follow_up_digest"), "Uppföljningssammanställning");
});
