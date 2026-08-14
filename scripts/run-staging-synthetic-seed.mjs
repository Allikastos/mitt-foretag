import { randomBytes } from "node:crypto";
import {
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  assertStagingLink,
  getStagingApiKeys,
  requireConfirmation,
  runStagingSql,
  STAGING_CREDENTIALS_FILE,
  STAGING_PROJECT_NAME,
  STAGING_PROJECT_REF,
  STAGING_URL,
} from "./staging-supabase.mjs";

const confirmation = "SYNTHETIC_STAGING_ONLY";
const operation = process.argv[2] ?? "seed";
const organizationIds = [
  "10000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
];
const storagePaths = [
  `${organizationIds[0]}/synthetic/alpha-kvitto.pdf`,
  `${organizationIds[1]}/synthetic/beta-avtal.pdf`,
];
const accounts = [
  ["11000000-0000-4000-8000-000000000001", "owner.alpha@example.test", "Alpha Agare", "owner"],
  ["11000000-0000-4000-8000-000000000002", "admin.alpha@example.test", "Alpha Admin", "admin"],
  ["11000000-0000-4000-8000-000000000003", "member.alpha@example.test", "Alpha Medarbetare", "member"],
  ["11000000-0000-4000-8000-000000000004", "viewer.alpha@example.test", "Alpha Lasare", "viewer"],
  ["22000000-0000-4000-8000-000000000001", "owner.beta@example.test", "Beta Agare", "owner"],
  ["22000000-0000-4000-8000-000000000002", "member.beta@example.test", "Beta Medarbetare", "member"],
];
const options = { auth: { persistSession: false, autoRefreshToken: false } };

function stop(message) {
  console.error(`Staging-seed avbrots: ${message}`);
  process.exit(1);
}

async function requireData(promise, label) {
  const { data, error, count } = await promise;
  if (error) {
    const safeDetails = [error.message, error.code, error.details, error.hint]
      .filter(Boolean)
      .join(" | ");
    throw new Error(`${label}: ${safeDetails || "Data API avvisade anropet"}`);
  }
  return { data, count };
}

async function listUsers(service) {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data } = await requireData(
      service.auth.admin.listUsers({ page, perPage: 1000 }),
      "lista staginganvandare",
    );
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

async function status(service) {
  const users = await listUsers(service);
  const counts = {};
  for (const table of [
    "organizations",
    "organization_members",
    "customers",
    "contacts",
    "tasks",
    "documents",
    "invoices",
    "invoice_lines",
    "business_events",
    "bookkeeping_drafts",
    "processing_jobs",
    "activity_log",
  ]) {
    const filterColumn = table === "organizations" ? "id" : "organization_id";
    const { count } = await requireData(
      service
        .from(table)
        .select("*", { count: "exact", head: true })
        .in(filterColumn, organizationIds),
      `rakna ${table}`,
    );
    counts[table] = count ?? 0;
  }
  counts.auth_users = users.filter((user) =>
    accounts.some(([, email]) => email === user.email),
  ).length;
  console.log(JSON.stringify({ project: STAGING_PROJECT_NAME, counts }, null, 2));
}

async function seed(service) {
  const { data: existingOrganizations } = await requireData(
    service.from("organizations").select("id, name"),
    "kontrollera stagingorganisationer",
  );
  const foreign = existingOrganizations.filter(
    (organization) => !organizationIds.includes(organization.id),
  );
  if (foreign.length > 0) {
    throw new Error("staging innehaller organisationer utanfor den syntetiska seeden");
  }

  const existingUsers = await listUsers(service);
  const replacements = new Map();
  const credentials = [];
  for (const [placeholderId, email, fullName, role] of accounts) {
    const password = `Staging-${randomBytes(24).toString("base64url")}!`;
    const existing = existingUsers.find((user) => user.email === email);
    assertStagingLink();
    const { data } = await requireData(
      existing
        ? service.auth.admin.updateUserById(existing.id, {
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, synthetic: true },
          })
        : service.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, synthetic: true },
          }),
      `skapa eller uppdatera ${email}`,
    );
    replacements.set(placeholderId, data.user.id);
    credentials.push({ email, password, role });
  }

  let sql = readFileSync(
    resolve("supabase", "seeds", "pilot-synthetic.sql"),
    "utf8",
  );
  sql = sql.replace(
    /insert into auth\.users \([\s\S]*?on conflict \(id\) do nothing;\n\n/,
    "",
  );
  for (const [placeholderId, userId] of replacements) {
    sql = sql.replaceAll(placeholderId, userId);
  }
  runStagingSql(
    [
      "set altura.data_environment = 'test';",
      "set altura.allow_synthetic_seed = 'SYNTHETIC_TEST_DATA_ONLY';",
      sql,
    ].join("\n"),
  );

  for (let index = 0; index < storagePaths.length; index += 1) {
    assertStagingLink();
    await requireData(
      service.storage.from("hub-documents").upload(
        storagePaths[index],
        new Blob([`Altura Nova synthetic staging file ${index + 1}`]),
        { contentType: "application/pdf", upsert: true },
      ),
      `ladda upp syntetisk stagingfil ${index + 1}`,
    );
  }

  writeFileSync(
    STAGING_CREDENTIALS_FILE,
    JSON.stringify(
      {
        projectRef: STAGING_PROJECT_REF,
        url: STAGING_URL,
        generatedAt: new Date().toISOString(),
        accounts: credentials,
      },
      null,
      2,
    ),
    { encoding: "utf8", mode: 0o600 },
  );
  console.log("Syntetisk stagingdata och sex testkonton ar klara.");
  await status(service);
}

async function cleanup(service) {
  assertStagingLink();
  await requireData(
    service.storage.from("hub-documents").remove(storagePaths),
    "radera syntetiska stagingfiler",
  );
  assertStagingLink();
  await requireData(
    service.from("organizations").delete().in("id", organizationIds),
    "radera syntetiska stagingorganisationer",
  );
  const users = await listUsers(service);
  for (const user of users.filter((candidate) =>
    accounts.some(([, email]) => email === candidate.email),
  )) {
    assertStagingLink();
    await requireData(
      service.auth.admin.deleteUser(user.id),
      `radera ${user.email}`,
    );
  }
  if (existsSync(STAGING_CREDENTIALS_FILE)) rmSync(STAGING_CREDENTIALS_FILE);
  console.log("Endast den markta syntetiska stagingdatan raderades.");
}

try {
  requireConfirmation("ALTURA_STAGING_SEED_CONFIRMATION", confirmation);
  assertStagingLink();
  const { secret } = getStagingApiKeys();
  const service = createClient(STAGING_URL, secret, options);
  if (operation === "seed") await seed(service);
  else if (operation === "cleanup") await cleanup(service);
  else if (operation === "status") await status(service);
  else throw new Error("valj seed, status eller cleanup");
} catch (error) {
  stop(error instanceof Error ? error.message : "okant fel");
}
