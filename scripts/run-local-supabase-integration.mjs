import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const linkedProjectFile = resolve(root, "supabase", ".temp", "project-ref");

function stop(message) {
  console.error(`Lokala integrationstester kördes inte: ${message}`);
  process.exit(1);
}

if (existsSync(linkedProjectFile)) {
  stop("Supabase-katalogen är länkad till ett fjärrprojekt.");
}

const status = spawnSync("supabase", ["status", "--output", "json"], {
  cwd: root,
  encoding: "utf8",
});

if (status.status !== 0) stop("den lokala Supabase-stacken svarar inte.");

let local;
try {
  local = JSON.parse(status.stdout);
} catch {
  stop("Supabase CLI returnerade ogiltig lokal status.");
}

if (!local.API_URL?.startsWith("http://127.0.0.1:")) {
  stop("Supabase-statusen pekar inte på loopback-adressen.");
}

const result = spawnSync(process.execPath, ["scripts/test-supabase-integration.mjs"], {
  cwd: root,
  encoding: "utf8",
  stdio: "inherit",
  env: {
    ...process.env,
    SUPABASE_URL: local.API_URL,
    SUPABASE_ANON_KEY: local.ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: local.SERVICE_ROLE_KEY,
    ALTURA_INTEGRATION_TEST_CONFIRMATION: "LOCAL_SUPABASE_ONLY",
  },
});

if (result.status !== 0) stop("minst ett lokalt API- eller samtidighetstest misslyckades.");
