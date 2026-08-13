export class IntegrationUnavailableError extends Error {
  readonly code = "integration_not_configured";

  constructor(serviceName: string) {
    super(`${serviceName} är inte konfigurerad.`);
    this.name = "IntegrationUnavailableError";
  }
}

export type EmailDeliveryRequest = {
  organizationId: string;
  recipient: string;
  templateKey: string;
  locale: "sv-SE";
  variables: Record<string, string | number | boolean | null>;
  idempotencyKey: string;
};

export interface EmailDeliveryProvider {
  send(request: EmailDeliveryRequest): Promise<{ deliveryId: string }>;
}

export class DisabledEmailDeliveryProvider implements EmailDeliveryProvider {
  async send(): Promise<{ deliveryId: string }> {
    throw new IntegrationUnavailableError("Hubbens e-postutskick");
  }
}

export type ImportedBankTransaction = {
  externalId: string;
  bookedOn: string;
  amountMinor: number;
  currency: string;
  description: string;
};

export interface BankImportProvider {
  importTransactions(input: {
    organizationId: string;
    accountReference: string;
    fromDate: string;
    toDate: string;
  }): Promise<ImportedBankTransaction[]>;
}

export class DisabledBankImportProvider implements BankImportProvider {
  async importTransactions(): Promise<ImportedBankTransaction[]> {
    throw new IntegrationUnavailableError("Bankimport");
  }
}

export interface SubscriptionBillingProvider {
  createCheckout(input: {
    organizationId: string;
    plan: string;
    returnUrl: string;
  }): Promise<{ redirectUrl: string }>;
  createCustomerPortal(input: {
    organizationId: string;
    returnUrl: string;
  }): Promise<{ redirectUrl: string }>;
}

export class DisabledSubscriptionBillingProvider
  implements SubscriptionBillingProvider
{
  async createCheckout(): Promise<{ redirectUrl: string }> {
    throw new IntegrationUnavailableError("Abonnemangsbetalning");
  }

  async createCustomerPortal(): Promise<{ redirectUrl: string }> {
    throw new IntegrationUnavailableError("Abonnemangsbetalning");
  }
}

export type RateLimitResult =
  | { allowed: true; remaining: number; resetAt: string }
  | {
      allowed: false;
      remaining: 0;
      resetAt: string;
      reason: "limit_exceeded" | "provider_unavailable";
    };

export interface RateLimitProvider {
  consume(input: {
    scope: string;
    subjectHash: string;
    limit: number;
    windowSeconds: number;
  }): Promise<RateLimitResult>;
}

export class DisabledRateLimitProvider implements RateLimitProvider {
  async consume(): Promise<RateLimitResult> {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(0).toISOString(),
      reason: "provider_unavailable",
    };
  }
}

export type SafeErrorContext = Record<
  string,
  string | number | boolean | null
>;

export interface ErrorReporter {
  capture(input: {
    error: unknown;
    correlationId: string;
    context?: SafeErrorContext;
  }): Promise<{ accepted: boolean }>;
}

export class DisabledErrorReporter implements ErrorReporter {
  async capture(): Promise<{ accepted: boolean }> {
    return { accepted: false };
  }
}

export interface BackupProvider {
  startBackup(input: {
    organizationId: string;
    includeDatabase: boolean;
    includeStorage: boolean;
    idempotencyKey: string;
  }): Promise<{ backupJobId: string }>;
}

export class DisabledBackupProvider implements BackupProvider {
  async startBackup(): Promise<{ backupJobId: string }> {
    throw new IntegrationUnavailableError("Extern backup");
  }
}

export interface WebhookSignatureVerifier {
  verify(input: {
    rawBody: Uint8Array;
    headers: Readonly<Record<string, string>>;
  }): Promise<boolean>;
}

export class DisabledWebhookSignatureVerifier
  implements WebhookSignatureVerifier
{
  async verify(): Promise<boolean> {
    return false;
  }
}
