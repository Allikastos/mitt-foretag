import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const linkedProjectFile = resolve(root, "supabase", ".temp", "project-ref");

function stop(message) {
  console.error(`Den lokala hubben startades inte: ${message}`);
  process.exit(1);
}

if (existsSync(linkedProjectFile)) {
  stop("Supabase-katalogen är länkad till ett fjärrprojekt.");
}

const status = await new Promise((resolveStatus, reject) => {
  const child = spawn("supabase", ["status", "--output", "json"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => (stdout += chunk));
  child.stderr.on("data", (chunk) => (stderr += chunk));
  child.on("error", reject);
  child.on("close", (code) => {
    if (code !== 0) reject(new Error(stderr));
    else {
      try {
        resolveStatus(JSON.parse(stdout));
      } catch (error) {
        reject(error);
      }
    }
  });
}).catch(() => stop("den lokala Supabase-stacken svarar inte."));

if (!status.API_URL?.startsWith("http://127.0.0.1:")) {
  stop("Supabase-statusen pekar inte på loopback-adressen.");
}

const dev = spawn("next", ["dev"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
    NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: "development",
    NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "local",
    NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF: "",
  },
});

dev.on("error", () => stop("Next.js kunde inte startas."));
dev.on("close", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
