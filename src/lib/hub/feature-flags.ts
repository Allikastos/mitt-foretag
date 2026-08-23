import "server-only";

function readFlag(name: string) {
  return process.env[name] === "true";
}

export const hubFeatureFlags = {
  accounting: readFlag("HUB_FEATURE_ACCOUNTING"),
  smartAccountingInput: readFlag("HUB_FEATURE_SMART_ACCOUNTING_INPUT"),
  documentProcessing: readFlag("HUB_FEATURE_DOCUMENT_PROCESSING"),
  backgroundJobs: readFlag("HUB_FEATURE_BACKGROUND_JOBS"),
  emailAutomation: readFlag("HUB_FEATURE_EMAIL_AUTOMATION"),
  bankImport: readFlag("HUB_FEATURE_BANK_IMPORT"),
  subscriptionBilling: readFlag("HUB_FEATURE_SUBSCRIPTION_BILLING"),
  rateLimiting: readFlag("HUB_FEATURE_RATE_LIMITING"),
  observability: readFlag("HUB_FEATURE_OBSERVABILITY"),
  externalBackups: readFlag("HUB_FEATURE_EXTERNAL_BACKUPS"),
  safeMutations: readFlag("HUB_FEATURE_SAFE_MUTATIONS"),
} as const;

export type HubFeatureFlag = keyof typeof hubFeatureFlags;

export function requireHubFeature(flag: HubFeatureFlag) {
  if (!hubFeatureFlags[flag]) {
    throw new Error(`Hub feature "${flag}" is not enabled.`);
  }
}
