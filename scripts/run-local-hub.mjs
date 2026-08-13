import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

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

const firstPort = Number.parseInt(process.env.HUB_LOCAL_PORT ?? "3001", 10);
if (!Number.isInteger(firstPort) || firstPort < 1 || firstPort > 65535) {
  stop("HUB_LOCAL_PORT måste vara ett giltigt portnummer.");
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

let port;
for (let candidate = firstPort; candidate < firstPort + 50; candidate += 1) {
  if (candidate <= 65535 && (await portIsAvailable(candidate))) {
    port = candidate;
    break;
  }
}

if (!port) {
  stop(`ingen ledig port hittades från ${firstPort}.`);
}

const localDistDir = process.env.NEXT_LOCAL_DIST_DIR ?? ".next-local";
console.log(`Den lokala hubben startar på http://127.0.0.1:${port}`);

const dev = spawn(
  "next",
  ["dev", "--hostname", "127.0.0.1", "--port", String(port)],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_LOCAL_DIST_DIR: localDistDir,
      NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
      NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: "development",
      NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "local",
      NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF: "",
    },
  },
);

dev.on("error", () => stop("Next.js kunde inte startas."));
dev.on("close", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
