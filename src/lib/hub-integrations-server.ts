import "server-only";

import { hubFeatureFlags } from "./hub/feature-flags.ts";
import { hasIntegrationCapability } from "./hub/integrations/access.ts";
import {
  evaluateIntegrationReadiness,
  integrationCatalog,
  type IntegrationId,
} from "./hub/integrations/catalog.ts";
import { requireHubContext } from "./hub-server.ts";

const featureFlagEnvironmentNames = {
  accounting: "HUB_FEATURE_ACCOUNTING",
  documentProcessing: "HUB_FEATURE_DOCUMENT_PROCESSING",
  backgroundJobs: "HUB_FEATURE_BACKGROUND_JOBS",
  emailAutomation: "HUB_FEATURE_EMAIL_AUTOMATION",
  bankImport: "HUB_FEATURE_BANK_IMPORT",
  subscriptionBilling: "HUB_FEATURE_SUBSCRIPTION_BILLING",
  rateLimiting: "HUB_FEATURE_RATE_LIMITING",
  observability: "HUB_FEATURE_OBSERVABILITY",
  externalBackups: "HUB_FEATURE_EXTERNAL_BACKUPS",
  safeMutations: "HUB_FEATURE_SAFE_MUTATIONS",
} as const;

function safeProviderName(value: string | undefined) {
  const provider = value?.trim();

  if (!provider || !/^[a-z0-9][a-z0-9_-]{0,39}$/i.test(provider)) {
    return null;
  }

  return provider;
}

function selectedProvider(integrationId: IntegrationId) {
  switch (integrationId) {
    case "database":
    case "private_storage":
      return "Supabase";
    case "document_ai":
      return safeProviderName(process.env.HUB_DOCUMENT_PROCESSOR_PROVIDER);
    case "background_queue":
      return safeProviderName(process.env.HUB_JOB_QUEUE_PROVIDER);
    case "hub_email":
      return safeProviderName(process.env.HUB_EMAIL_DELIVERY_PROVIDER);
    case "bank_import":
      return safeProviderName(process.env.HUB_BANK_IMPORT_PROVIDER);
    case "subscription_billing":
      return safeProviderName(process.env.HUB_SUBSCRIPTION_BILLING_PROVIDER);
    case "rate_limiting":
      return safeProviderName(process.env.HUB_RATE_LIMIT_PROVIDER);
    case "observability":
      return safeProviderName(process.env.HUB_ERROR_REPORTER_PROVIDER);
    case "backup_restore":
      return safeProviderName(process.env.HUB_BACKUP_PROVIDER);
  }
}

export async function getIntegrationOverview() {
  const { membership } = await requireHubContext();
  const canManage = hasIntegrationCapability(membership.role, "manage");

  const integrations = integrationCatalog.map((definition) => {
    const isExistingFoundation =
      definition.id === "database" || definition.id === "private_storage";
    const provider = selectedProvider(definition.id);
    const featureEnabled = definition.featureFlag
      ? hubFeatureFlags[definition.featureFlag]
      : true;
    const readiness = evaluateIntegrationReadiness({
      providerSelected: Boolean(provider),
      configurationReady: isExistingFoundation,
      featureEnabled,
      connectionStatus: isExistingFoundation ? "connected" : "not_connected",
    });

    return {
      ...definition,
      readiness,
      provider: canManage ? provider : null,
      featureEnabled,
      featureFlagName:
        canManage && definition.featureFlag
          ? featureFlagEnvironmentNames[definition.featureFlag]
          : null,
    };
  });

  return {
    canManage,
    integrations,
    summary: {
      active: integrations.filter(({ readiness }) => readiness === "active")
        .length,
      prepared: integrations.filter(
        ({ readiness }) => readiness === "code_ready",
      ).length,
      needsConfiguration: integrations.filter(({ readiness }) =>
        ["configuration_required", "approval_required"].includes(readiness),
      ).length,
      needsAttention: integrations.filter(
        ({ readiness }) => readiness === "attention_required",
      ).length,
    },
  };
}
