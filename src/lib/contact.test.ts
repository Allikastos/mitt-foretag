import assert from "node:assert/strict";
import test from "node:test";
import { validateContactPayload } from "./contact.ts";

const now = 10_000;
const valid = { name: "Albin", company: "Altura Nova", email: "albin@example.com", phone: "0701234567", websiteUrl: "https://example.com", message: "Vi behöver en ny hemsida.", website: "", startedAt: 1_000 };

test("accepts a complete contact request", () => {
  const result = validateContactPayload(valid, now);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.isSpam, false);
});

test("requires company and rejects invalid email", () => {
  assert.equal(validateContactPayload({ ...valid, company: "" }, now).ok, false);
  assert.equal(validateContactPayload({ ...valid, email: "fel" }, now).ok, false);
});

test("silently marks honeypot and unrealistically fast submissions as spam", () => {
  const honeypot = validateContactPayload({ ...valid, website: "bot" }, now);
  const fast = validateContactPayload({ ...valid, startedAt: now - 500 }, now);
  assert.equal(honeypot.ok && honeypot.isSpam, true);
  assert.equal(fast.ok && fast.isSpam, true);
});

test("rejects oversized content", () => {
  assert.equal(validateContactPayload({ ...valid, message: "x".repeat(3001) }, now).ok, false);
});
