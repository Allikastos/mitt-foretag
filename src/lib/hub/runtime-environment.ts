export type HubRuntimeEnvironment =
  | "development"
  | "test"
  | "preview"
  | "production";

export type HubDataEnvironment = "local" | "test" | "production";

type EnvironmentInput = Record<string, string | undefined>;

export type HubEnvironmentAssessment = {
  runtimeEnvironment: HubRuntimeEnvironment;
  dataEnvironment: HubDataEnvironment | null;
  supabaseProjectRef: string | null;
  valid: boolean;
  reason: string | null;
};

const SAFE_CONFIGURATION_ERROR =
  "Hubbens datamiljö är inte säkert konfigurerad. Kontrollera miljömarkörerna innan hubben används.";

function isRuntimeEnvironment(
  value: string | undefined,
): value is HubRuntimeEnvironment {
  return ["development", "test", "preview", "production"].includes(
    value ?? "",
  );
}

function isDataEnvironment(
  value: string | undefined,
): value is HubDataEnvironment {
  return ["local", "test", "production"].includes(value ?? "");
}

function runtimeEnvironment(env: EnvironmentInput): HubRuntimeEnvironment {
  const explicit = env.NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT;

  if (isRuntimeEnvironment(explicit)) return explicit;
  if (env.NODE_ENV === "test") return "test";
  if (env.VERCEL_ENV === "preview") return "preview";
  if (env.VERCEL_ENV === "production") return "production";
  return "development";
}

export function supabaseProjectRef(url: string | undefined) {
  if (!url) return null;

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const match = hostname.match(/^([a-z0-9-]+)\.supabase\.co$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function isLocalSupabaseUrl(url: string | undefined) {
  if (!url) return false;

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return ["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

export function assessHubEnvironment(
  env: EnvironmentInput,
): HubEnvironmentAssessment {
  const runtime = runtimeEnvironment(env);
  const dataValue = env.NEXT_PUBLIC_HUB_DATA_ENVIRONMENT;
  const dataEnvironment = isDataEnvironment(dataValue) ? dataValue : null;
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const currentProjectRef = supabaseProjectRef(url);
  const productionProjectRef =
    env.NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF?.trim() || null;
  const localUrl = isLocalSupabaseUrl(url);

  const reject = (reason: string): HubEnvironmentAssessment => ({
    runtimeEnvironment: runtime,
    dataEnvironment,
    supabaseProjectRef: currentProjectRef,
    valid: false,
    reason,
  });

  if (
    env.NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT &&
    !isRuntimeEnvironment(env.NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT)
  ) {
    return reject("Ogiltig körmiljömarkör.");
  }

  if (!dataEnvironment) {
    return reject("Datamiljön saknar en giltig markör.");
  }

  if (!url || (!localUrl && !currentProjectRef)) {
    return reject("Supabase-adressen är inte en tillåten lokal eller hanterad adress.");
  }

  if (dataEnvironment === "local" && !localUrl) {
    return reject("En lokal datamiljö måste använda lokal Supabase.");
  }

  if (dataEnvironment !== "local" && localUrl) {
    return reject("En fjärrdatamiljö kan inte märkas som lokal Supabase.");
  }

  if (runtime === "production") {
    if (dataEnvironment !== "production") {
      return reject("Produktionskörningen måste använda produktionsdata.");
    }
    if (!productionProjectRef || currentProjectRef !== productionProjectRef) {
      return reject("Produktionsprojektet är inte uttryckligen verifierat.");
    }
  } else {
    if (dataEnvironment === "production") {
      return reject("Utveckling, test och preview får aldrig använda produktionsdata.");
    }
    if (runtime === "preview" && dataEnvironment !== "test") {
      return reject("Preview måste använda en uttrycklig testdatamiljö.");
    }
    if (dataEnvironment === "test") {
      if (!productionProjectRef) {
        return reject("Testmiljön måste känna till produktionsprojektets ID.");
      }
      if (currentProjectRef === productionProjectRef) {
        return reject("Testmiljön pekar på produktionsprojektet.");
      }
    }
  }

  return {
    runtimeEnvironment: runtime,
    dataEnvironment,
    supabaseProjectRef: currentProjectRef,
    valid: true,
    reason: null,
  };
}

export function assertSafeHubEnvironment(env: EnvironmentInput) {
  const assessment = assessHubEnvironment(env);

  if (!assessment.valid) {
    throw new Error(SAFE_CONFIGURATION_ERROR);
  }

  return assessment;
}

const featureProviders = [
  ["HUB_FEATURE_BACKGROUND_JOBS", "HUB_JOB_QUEUE_PROVIDER"],
  ["HUB_FEATURE_EMAIL_AUTOMATION", "HUB_EMAIL_DELIVERY_PROVIDER"],
  ["HUB_FEATURE_BANK_IMPORT", "HUB_BANK_IMPORT_PROVIDER"],
  ["HUB_FEATURE_SUBSCRIPTION_BILLING", "HUB_SUBSCRIPTION_BILLING_PROVIDER"],
  ["HUB_FEATURE_RATE_LIMITING", "HUB_RATE_LIMIT_PROVIDER"],
  ["HUB_FEATURE_OBSERVABILITY", "HUB_ERROR_REPORTER_PROVIDER"],
  ["HUB_FEATURE_EXTERNAL_BACKUPS", "HUB_BACKUP_PROVIDER"],
] as const;

export function assertSafeHubFeatureConfiguration(env: EnvironmentInput) {
  const mutationFeatures = [
    "HUB_FEATURE_ACCOUNTING",
    "HUB_FEATURE_DOCUMENT_PROCESSING",
    ...featureProviders.map(([flag]) => flag),
  ];

  if (
    mutationFeatures.some((flag) => env[flag] === "true") &&
    env.HUB_FEATURE_SAFE_MUTATIONS !== "true"
  ) {
    throw new Error(SAFE_CONFIGURATION_ERROR);
  }

  for (const [flag, providerVariable] of featureProviders) {
    if (env[flag] !== "true") continue;

    const provider = env[providerVariable]?.trim().toLowerCase();
    if (!provider || ["disabled", "memory", "development"].includes(provider)) {
      throw new Error(SAFE_CONFIGURATION_ERROR);
    }
  }
}
