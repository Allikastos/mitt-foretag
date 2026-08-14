import { spawnSync } from "node:child_process";
import {
  assertStagingLink,
  getStagingApiKeys,
  requireConfirmation,
  STAGING_PROJECT_REF,
  STAGING_URL,
} from "./staging-supabase.mjs";

try {
  requireConfirmation(
    "ALTURA_STAGING_INTEGRATION_CONFIRMATION",
    "STAGING_SUPABASE_ONLY",
  );
  assertStagingLink();
  const { publishable, secret } = getStagingApiKeys();
  const result = spawnSync(
    process.execPath,
    ["scripts/test-supabase-integration.mjs"],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      env: {
        ...process.env,
        SUPABASE_URL: STAGING_URL,
        SUPABASE_ANON_KEY: publishable,
        SUPABASE_SERVICE_ROLE_KEY: secret,
        ALTURA_INTEGRATION_TEST_CONFIRMATION: "STAGING_SUPABASE_ONLY",
        ALTURA_INTEGRATION_TEST_PROJECT_REF: STAGING_PROJECT_REF,
      },
    },
  );
  process.exit(result.status ?? 1);
} catch (error) {
  console.error(
    `Stagingintegration avbrots: ${error instanceof Error ? error.message : "okant fel"}`,
  );
  process.exit(1);
}
