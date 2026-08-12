import "server-only";

function readFlag(name: string) {
  return process.env[name] === "true";
}

export const hubFeatureFlags = {
  accounting: readFlag("HUB_FEATURE_ACCOUNTING"),
  documentProcessing: readFlag("HUB_FEATURE_DOCUMENT_PROCESSING"),
  backgroundJobs: readFlag("HUB_FEATURE_BACKGROUND_JOBS"),
  emailAutomation: readFlag("HUB_FEATURE_EMAIL_AUTOMATION"),
  bankImport: readFlag("HUB_FEATURE_BANK_IMPORT"),
} as const;

export type HubFeatureFlag = keyof typeof hubFeatureFlags;

export function requireHubFeature(flag: HubFeatureFlag) {
  if (!hubFeatureFlags[flag]) {
    throw new Error(`Hub feature "${flag}" is not enabled.`);
  }
}
