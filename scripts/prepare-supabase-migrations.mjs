import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

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

const plan = JSON.parse(
  readFileSync(resolve(supabaseDirectory, "migration-plan.json"), "utf8"),
);
const existingMigrations = existsSync(migrationsDirectory)
  ? readdirSync(migrationsDirectory).filter((name) => name.endsWith(".sql"))
  : [];

if (existingMigrations.length > 0) {
  stop("migrationskatalogen måste vara tom för en reproducerbar generering.");
}

function safeBaseline(sql) {
  const withoutConstraintReplacements = sql.replace(
    /alter table public\.(?:organizations|customers)\n\s+drop constraint if exists [^,]+,\n\s+add constraint [^\n]+\n\s+check \([^;]+;\n/gi,
    "",
  );

  return withoutConstraintReplacements.replace(
    /^\s*drop\s+(?:trigger|policy)\s+if\s+exists\b.*;\s*$/gim,
    "",
  );
}

async function createMigration(source, transform = (sql) => sql) {
  const sourcePath = resolve(supabaseDirectory, source.file);
  const sql = transform(readFileSync(sourcePath, "utf8"));

  if (/^\s*(drop|truncate|delete)\b/im.test(sql)) {
    stop(`${source.file} innehåller en destruktiv SQL-sats.`);
  }

  const before = new Set(
    existsSync(migrationsDirectory) ? readdirSync(migrationsDirectory) : [],
  );
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

  // Supabase migration versions have second precision and must remain unique.
  await delay(1100);
}

await createMigration(plan.baseline, safeBaseline);
for (const source of plan.sources) await createMigration(source);

console.log("Timestampade lokala migrationer skapades. Granska diffen innan lokal reset.");
