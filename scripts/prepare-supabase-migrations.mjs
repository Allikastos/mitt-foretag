import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const supabaseDirectory = resolve(root, "supabase");
const migrationsDirectory = resolve(supabaseDirectory, "migrations");
const linkedProjectFile = resolve(supabaseDirectory, ".temp", "project-ref");
const confirmation = "CREATE_FOR_ISOLATED_TEST_ONLY";

function stop(message) {
  console.error(`Migrationer skapades inte: ${message}`);
  process.exit(1);
}

if (process.env.ALTURA_MIGRATION_CONFIRMATION !== confirmation) {
  stop(`sätt ALTURA_MIGRATION_CONFIRMATION=${confirmation}.`);
}

if (!existsSync(resolve(supabaseDirectory, "config.toml"))) {
  stop("kör 'supabase init' och granska config.toml först.");
}

if (existsSync(linkedProjectFile)) {
  stop("Supabase-katalogen är länkad till ett fjärrprojekt.");
}

const cli = spawnSync("supabase", ["--version"], { encoding: "utf8" });
if (cli.status !== 0) stop("Supabase CLI saknas.");

if (!existsSync(migrationsDirectory)) {
  stop("migrationskatalogen saknas; skapa och granska en baslinjemigration först.");
}

const existingMigrations = readdirSync(migrationsDirectory).filter((name) =>
  name.endsWith(".sql"),
);
const hasBaseline = existingMigrations.some((name) =>
  /create\s+table\s+(if\s+not\s+exists\s+)?public\.organizations/i.test(
    readFileSync(resolve(migrationsDirectory, name), "utf8"),
  ),
);

if (!hasBaseline) {
  stop("ingen granskad baslinjemigration för hubben hittades.");
}

const plan = JSON.parse(
  readFileSync(resolve(supabaseDirectory, "migration-plan.json"), "utf8"),
);

for (const source of plan.sources) {
  if (existingMigrations.some((name) => name.endsWith(`_${source.name}.sql`))) {
    stop(`migrationen ${source.name} finns redan.`);
  }
}

for (const source of plan.sources) {
  const sourcePath = resolve(supabaseDirectory, source.file);
  const sql = readFileSync(sourcePath, "utf8");

  if (/^\s*(drop|truncate|delete)\b/im.test(sql)) {
    stop(`${source.file} innehåller en destruktiv SQL-sats.`);
  }

  const before = new Set(readdirSync(migrationsDirectory));
  const created = spawnSync("supabase", ["migration", "new", source.name], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (created.status !== 0) {
    stop(`Supabase CLI kunde inte skapa migrationen ${source.name}.`);
  }

  const migrationFile = readdirSync(migrationsDirectory).find(
    (name) => !before.has(name) && name.endsWith(`_${source.name}.sql`),
  );

  if (!migrationFile) stop(`kunde inte identifiera migrationen ${source.name}.`);

  writeFileSync(
    resolve(migrationsDirectory, migrationFile),
    `-- Generated from supabase/${source.file}; review before any database use.\n${sql}`,
  );
}

console.log("Timestampade lokala migrationer skapades. Granska diffen innan lokal reset.");
