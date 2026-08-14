import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import {
  assertStagingLink,
  FORBIDDEN_PROJECT_REF,
  getStagingApiKeys,
  requireConfirmation,
  STAGING_CREDENTIALS_FILE,
  STAGING_URL,
} from "./staging-supabase.mjs";

function stop(message) {
  console.error(`Staginghubben startades inte: ${message}`);
  process.exit(1);
}

async function portIsAvailable(port) {
  return new Promise((resolveAvailability) => {
    const server = createServer();
    server.unref();
    server.once("error", () => resolveAvailability(false));
    server.listen({ host: "127.0.0.1", port }, () => {
      server.close(() => resolveAvailability(true));
    });
  });
}

try {
  requireConfirmation(
    "ALTURA_STAGING_HUB_CONFIRMATION",
    "ISOLATED_STAGING_PREVIEW",
  );
  assertStagingLink();
  if (!existsSync(STAGING_CREDENTIALS_FILE)) {
    throw new Error("kor den syntetiska staging-seeden forst");
  }
  const { publishable } = getStagingApiKeys();
  const firstPort = Number.parseInt(process.env.HUB_STAGING_PORT ?? "3011", 10);
  if (!Number.isInteger(firstPort) || firstPort < 1 || firstPort > 65535) {
    throw new Error("HUB_STAGING_PORT maste vara ett giltigt portnummer");
  }

  let port;
  for (let candidate = firstPort; candidate < firstPort + 50; candidate += 1) {
    if (candidate <= 65535 && (await portIsAvailable(candidate))) {
      port = candidate;
      break;
    }
  }
  if (!port) throw new Error("ingen ledig stagingport hittades");

  console.log(`Staginghubben startar pa http://127.0.0.1:${port}`);
  const dev = spawn(
    "next",
    ["dev", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_LOCAL_DIST_DIR: ".next-staging",
        NEXT_PUBLIC_SUPABASE_URL: STAGING_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: publishable,
        NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: "preview",
        NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "test",
        NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF: FORBIDDEN_PROJECT_REF,
        HUB_FEATURE_SAFE_MUTATIONS: "true",
        HUB_FEATURE_ACCOUNTING: "true",
        HUB_FEATURE_DOCUMENT_PROCESSING: "true",
        HUB_FEATURE_BACKGROUND_JOBS: "false",
        HUB_FEATURE_EMAIL_AUTOMATION: "false",
        HUB_FEATURE_BANK_IMPORT: "false",
        HUB_FEATURE_SUBSCRIPTION_BILLING: "false",
        HUB_FEATURE_RATE_LIMITING: "false",
        HUB_FEATURE_OBSERVABILITY: "false",
        HUB_FEATURE_EXTERNAL_BACKUPS: "false",
      },
    },
  );
  dev.on("error", () => stop("Next.js kunde inte startas"));
  dev.on("close", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
} catch (error) {
  stop(error instanceof Error ? error.message : "okant fel");
}
