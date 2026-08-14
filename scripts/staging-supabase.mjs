import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

export const STAGING_PROJECT_REF = "jtposcdefsmromnouald";
export const STAGING_PROJECT_NAME = "altura-nova-hub-staging";
export const FORBIDDEN_PROJECT_REF = "zshdbqhuiuwjdpsavnml";
export const STAGING_URL = `https://${STAGING_PROJECT_REF}.supabase.co`;
export const STAGING_CREDENTIALS_FILE = join(
  tmpdir(),
  "altura-nova-hub-staging-credentials.json",
);

const root = process.cwd();
const cli = resolve(root, "node_modules", ".bin", "supabase");
const linkedProjectFile = resolve(root, "supabase", ".temp", "project-ref");

function runCliJson(args) {
  const result = spawnSync(cli, [...args, "--output", "json"], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error("Supabase CLI kunde inte verifiera stagingmiljon.");
  }
  return JSON.parse(result.stdout);
}

export function requireConfirmation(variable, expected) {
  if (process.env[variable] !== expected) {
    throw new Error(`Satt ${variable}=${expected} for att fortsatta.`);
  }
}

export function assertStagingLink() {
  const linkedRef = readFileSync(linkedProjectFile, "utf8").trim();
  if (linkedRef !== STAGING_PROJECT_REF || linkedRef === FORBIDDEN_PROJECT_REF) {
    throw new Error("Supabase-katalogen ar inte lankad till godkand staging-ref.");
  }
  const projects = runCliJson(["projects", "list"]);
  const linked = projects.find((project) => project.linked);
  if (
    linked?.ref !== STAGING_PROJECT_REF ||
    linked?.name !== STAGING_PROJECT_NAME ||
    projects.some(
      (project) => project.ref === FORBIDDEN_PROJECT_REF && project.linked,
    )
  ) {
    throw new Error("Aktiv Supabase-ref ar inte den godkanda stagingmiljon.");
  }
}

export function getStagingApiKeys() {
  assertStagingLink();
  const keys = runCliJson([
    "projects",
    "api-keys",
    "--project-ref",
    STAGING_PROJECT_REF,
    "--reveal",
  ]);
  const publishable =
    keys.find((key) => key.name === "anon" && !key.disabled)?.api_key ??
    keys.find((key) => key.type === "publishable" && !key.disabled)?.api_key;
  const secret =
    keys.find((key) => key.name === "service_role" && !key.disabled)?.api_key ??
    keys.find((key) => key.type === "secret" && !key.disabled)?.api_key;

  if (!publishable || !secret) {
    throw new Error("Staging saknar en aktiv publishable- eller secret-nyckel.");
  }
  return { publishable, secret };
}

export function runStagingSql(sql) {
  assertStagingLink();
  const directory = mkdtempSync(join(tmpdir(), "altura-staging-sql-"));
  const file = join(directory, "query.sql");
  writeFileSync(file, sql, { encoding: "utf8", mode: 0o600 });
  try {
    const result = spawnSync(
      cli,
      [
        "db",
        "query",
        "--linked",
        "--project-ref",
        STAGING_PROJECT_REF,
        "--file",
        file,
      ],
      { cwd: root, encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new Error("Den avgransade staging-SQL-korningen misslyckades.");
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
