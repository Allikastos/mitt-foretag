import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const confirmation = "SYNTHETIC_TEST_DATA_ONLY";
const linkedProjectFile = resolve(root, "supabase", ".temp", "project-ref");
const sourceFile = resolve(root, "supabase", "seeds", "pilot-synthetic.sql");
const configFile = resolve(root, "supabase", "config.toml");

function stop(message) {
  console.error(`Syntetisk seed kördes inte: ${message}`);
  process.exit(1);
}

if (process.env.ALTURA_SYNTHETIC_SEED_CONFIRMATION !== confirmation) {
  stop(`sätt ALTURA_SYNTHETIC_SEED_CONFIRMATION=${confirmation}.`);
}

if (existsSync(linkedProjectFile)) {
  stop("Supabase-katalogen är länkad till ett fjärrprojekt.");
}

const seed = readFileSync(sourceFile, "utf8");
const config = readFileSync(configFile, "utf8");
const projectId = config.match(/^project_id\s*=\s*"([a-z0-9_]+)"$/m)?.[1];

if (!projectId || !projectId.endsWith("_local")) {
  stop("config.toml saknar ett uttryckligt lokalt project_id.");
}

const sql = [
  "set altura.data_environment = 'local';",
  "set altura.allow_synthetic_seed = 'SYNTHETIC_TEST_DATA_ONLY';",
  seed,
].join("\n");

const result = spawnSync(
  "docker",
  [
    "exec",
    "-i",
    `supabase_db_${projectId}`,
    "psql",
    "--set",
    "ON_ERROR_STOP=1",
    "--username",
    "postgres",
    "--dbname",
    "postgres",
  ],
  { cwd: root, encoding: "utf8", input: sql, stdio: ["pipe", "inherit", "inherit"] },
);

if (result.status !== 0) stop("den lokala SQL-körningen misslyckades.");

console.log("Syntetisk pilotdata laddades i lokal Supabase.");
