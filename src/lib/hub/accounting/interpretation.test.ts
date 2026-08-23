import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEventFromInterpretation,
  createBookkeepingDraft,
  localSwedishBusinessEventParser,
  type SupportedBusinessEventType,
} from "./index.ts";

const referenceDate = "2026-08-14";

const supportedExamples: Array<[SupportedBusinessEventType, string]> = [
  [
    "paid_domestic_service_sale_25_vat",
    "Kunden betalade 6 250 kr inklusive 25 % moms till företagets bankkonto 2026-08-14.",
  ],
  [
    "paid_domestic_service_sale_no_vat",
    "Försäljning utan moms, 900 kr till företagets bankkonto 2026-08-14.",
  ],
  [
    "paid_domestic_purchase_25_vat",
    "Köpte material för 1 250 kr med 25 % moms via företagets bankkonto 2026-08-14.",
  ],
  [
    "purchase_without_deductible_vat",
    "Inköp för 300 kr utan avdragsgill moms via företagets bankkonto 2026-08-14.",
  ],
  ["owner_deposit", "Egen insättning 1 000 kr 2026-08-14."],
  ["owner_withdrawal", "Eget uttag 500 kr 2026-08-14."],
  [
    "transfer_between_own_accounts",
    "Flyttade mellan egna konton från 1930 till 1940, 750 kr 2026-08-14.",
  ],
];

test("local parser creates validated previews for all seven deterministic rules", () => {
  for (const [expectedType, text] of supportedExamples) {
    const interpretation = localSwedishBusinessEventParser.interpret({
      text,
      referenceDate,
    });

    assert.equal(interpretation.schemaVersion, "1");
    assert.equal(interpretation.interpreter.kind, "local_rule_parser");
    assert.equal(interpretation.eventType, expectedType);
    assert.equal(interpretation.canCreatePostingPreview, true);
    assert.deepEqual(interpretation.stopReasons, []);

    const event = buildEventFromInterpretation({
      interpretation,
      id: `test-${expectedType}`,
      organizationId: "org-test",
    });
    const posting = createBookkeepingDraft(event);
    assert.notEqual(posting.ruleId, "unsupported");
    assert.ok(posting.lines.length >= 2);
  }
});

test("relative dates are deterministic when a reference date is supplied", () => {
  const today = localSwedishBusinessEventParser.interpret({
    text: "Egen insättning 100 kr idag.",
    referenceDate,
  });
  const yesterday = localSwedishBusinessEventParser.interpret({
    text: "Eget uttag 100 kr igår.",
    referenceDate,
  });

  assert.equal(today.happenedOn, "2026-08-14");
  assert.equal(yesterday.happenedOn, "2026-08-13");
});

test("missing information blocks posting and produces focused follow-up questions", () => {
  const interpretation = localSwedishBusinessEventParser.interpret({
    text: "Köpte kontorsmaterial.",
    referenceDate,
  });

  assert.equal(interpretation.canCreatePostingPreview, false);
  assert.equal(interpretation.confidence, "red");
  assert.deepEqual(
    interpretation.missingInformation,
    ["Momsbehandling", "Belopp", "Datum"],
  );
  assert.equal(interpretation.followUpQuestions.length, 3);
  assert.throws(() =>
    buildEventFromInterpretation({
      interpretation,
      id: "blocked",
      organizationId: "org-test",
    }),
  );
});

test("contradictory events and VAT details are stopped instead of guessed", () => {
  const mixedEvent = localSwedishBusinessEventParser.interpret({
    text: "Köpte och sålde något för 100 kr med 25 % moms via företagets bankkonto 2026-08-14.",
    referenceDate,
  });
  const mixedVat = localSwedishBusinessEventParser.interpret({
    text: "Försäljning för 100 kr med 25 % moms men utan moms till företagets bankkonto 2026-08-14.",
    referenceDate,
  });

  assert.match(mixedEvent.stopReasons.join(" "), /flera olika/);
  assert.match(mixedVat.stopReasons.join(" "), /motsägelsefulla/);
  assert.equal(mixedEvent.canCreatePostingPreview, false);
  assert.equal(mixedVat.canCreatePostingPreview, false);
});

test("ambiguous card, private and cash payments are safely blocked", () => {
  const paymentPhrases = ["företagskort", "privat kort", "kontant"];

  for (const payment of paymentPhrases) {
    const interpretation = localSwedishBusinessEventParser.interpret({
      text: `Köpte material för 1 250 kr med 25 % moms ${payment} 2026-08-14.`,
      referenceDate,
    });

    assert.equal(interpretation.canCreatePostingPreview, false);
    assert.ok(interpretation.stopReasons.length > 0);
  }
});

test("transfers require two different explicit accounts", () => {
  const missingAccounts = localSwedishBusinessEventParser.interpret({
    text: "Flyttade mellan egna konton, 750 kr 2026-08-14.",
    referenceDate,
  });
  const sameAccount = localSwedishBusinessEventParser.interpret({
    text: "Flyttade mellan egna konton från 1930 till 1930, 750 kr 2026-08-14.",
    referenceDate,
  });

  assert.ok(missingAccounts.missingInformation.includes("Från- och tillkonto"));
  assert.match(sameAccount.stopReasons.join(" "), /måste vara olika/);
});
