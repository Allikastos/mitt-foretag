import assert from "node:assert/strict";
import test from "node:test";
import {
  DisabledBackupProvider,
  DisabledBankImportProvider,
  DisabledEmailDeliveryProvider,
  DisabledErrorReporter,
  DisabledRateLimitProvider,
  DisabledSubscriptionBillingProvider,
  DisabledWebhookSignatureVerifier,
  IntegrationUnavailableError,
  type BackupProvider,
  type BankImportProvider,
  type EmailDeliveryProvider,
  type ErrorReporter,
  type RateLimitProvider,
  type SubscriptionBillingProvider,
  type WebhookSignatureVerifier,
} from "./external-services.ts";

test("avstängda affärsleverantörer stoppar anrop tydligt", async () => {
  const email: EmailDeliveryProvider = new DisabledEmailDeliveryProvider();
  const bank: BankImportProvider = new DisabledBankImportProvider();
  const billing: SubscriptionBillingProvider =
    new DisabledSubscriptionBillingProvider();
  const backup: BackupProvider = new DisabledBackupProvider();

  await assert.rejects(() => email.send({} as never), IntegrationUnavailableError);
  await assert.rejects(
    () => bank.importTransactions({} as never),
    IntegrationUnavailableError,
  );
  await assert.rejects(
    () => billing.createCheckout({} as never),
    IntegrationUnavailableError,
  );
  await assert.rejects(
    () => billing.createCustomerPortal({} as never),
    IntegrationUnavailableError,
  );
  await assert.rejects(
    () => backup.startBackup({} as never),
    IntegrationUnavailableError,
  );
});

test("saknad rate-limit-tjänst stoppar känsliga anrop", async () => {
  const provider: RateLimitProvider = new DisabledRateLimitProvider();
  const result = await provider.consume({} as never);

  assert.deepEqual(result, {
    allowed: false,
    remaining: 0,
    resetAt: new Date(0).toISOString(),
    reason: "provider_unavailable",
  });
});

test("avstängd felrapportering och webhookkontroll skickar inget vidare", async () => {
  const reporter: ErrorReporter = new DisabledErrorReporter();
  const verifier: WebhookSignatureVerifier =
    new DisabledWebhookSignatureVerifier();

  assert.deepEqual(
    await reporter.capture({} as never),
    { accepted: false },
  );
  assert.equal(await verifier.verify({} as never), false);
});
