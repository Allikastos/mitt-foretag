import test from "node:test";
import assert from "node:assert/strict";
import { createBookkeepingDraft } from "./engine.ts";
import {
  assertJournalEntryMutable,
  linkCorrection,
  postBookkeepingDraft,
  type PostedJournalEntry,
} from "./ledger.ts";
import type { AccountingEventInput } from "./types.ts";

function accountingEvent(
  overrides: Partial<AccountingEventInput> = {},
): AccountingEventInput {
  return {
    id: "event-1",
    organizationId: "org-a",
    type: "owner_deposit",
    companyForm: "sole_trader",
    accountingMethod: "cash_basis",
    currency: "SEK",
    happenedAt: "2026-08-12",
    totalAmountMinor: 10_000,
    description: "Insättning",
    ...overrides,
  };
}

function post(params: {
  event?: AccountingEventInput;
  idempotencyKey?: string;
  entryId?: string;
  existingEntries?: PostedJournalEntry[];
  periodLocked?: boolean;
} = {}) {
  const event = params.event ?? accountingEvent();
  return postBookkeepingDraft({
    entryId: params.entryId ?? "entry-1",
    event,
    draft: createBookkeepingDraft(event),
    idempotencyKey: params.idempotencyKey ?? "post-12345",
    periodLocked: params.periodLocked ?? false,
    existingEntries: params.existingEntries ?? [],
    postedAt: "2026-08-12T10:00:00Z",
  });
}

test("journal posting replays the same idempotent result", () => {
  const first = post();
  const replay = post({ existingEntries: [first] });
  assert.equal(replay, first);
});

test("the same business event cannot be posted with another key", () => {
  const first = post();
  assert.throws(
    () => post({ idempotencyKey: "post-67890", existingEntries: [first] }),
    /redan bokförd/,
  );
});

test("posted entries and their lines are immutable", () => {
  const entry = post();
  assert.equal(Object.isFrozen(entry), true);
  assert.equal(Object.isFrozen(entry.lines), true);
  assert.equal(Object.isFrozen(entry.lines[0]), true);
  assert.throws(() => assertJournalEntryMutable(entry), /oföränderliga/);
});

test("a correction links a new entry to its original", () => {
  const original = post();
  const correction = post({
    event: accountingEvent({ id: "event-2", type: "owner_withdrawal" }),
    idempotencyKey: "post-22222",
    entryId: "entry-2",
    existingEntries: [original],
  });

  assert.deepEqual(
    linkCorrection({ original, correction, reason: "Fel konto" }),
    {
      organizationId: "org-a",
      originalEntryId: "entry-1",
      correctionEntryId: "entry-2",
      reason: "Fel konto",
    },
  );
});

test("locked periods and limited companies are denied", () => {
  assert.throws(() => post({ periodLocked: true }), /perioden är låst/);
  assert.throws(
    () => post({ event: accountingEvent({ companyForm: "limited_company" }) }),
    /stöds inte ännu/,
  );
});

test("the posting stores the deterministic rule identity", () => {
  const entry = post();
  assert.equal(entry.ruleId, "se-sole-trader-owner-deposit");
  assert.equal(entry.ruleVersion, 1);
});
