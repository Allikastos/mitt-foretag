import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const confirmation = "LOCAL_SUPABASE_ONLY";

function isLocalUrl(value) {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(
      new URL(value).hostname,
    );
  } catch {
    return false;
  }
}

if (
  process.env.ALTURA_INTEGRATION_TEST_CONFIRMATION !== confirmation ||
  !url ||
  !isLocalUrl(url) ||
  !anonKey ||
  !serviceRoleKey
) {
  throw new Error(
    "Integrationstestet kräver uttryckligen bekräftad lokal Supabase och lokala testnycklar.",
  );
}

const options = {
  auth: { persistSession: false, autoRefreshToken: false },
};
const service = createClient(url, serviceRoleKey, options);
const suffix = randomUUID().slice(0, 8);
const password = `Local-test-${randomUUID()}!`;
const createdUserIds = [];
const createdOrganizationIds = [];
const storagePaths = [];

async function requireData(promise, label) {
  const { data, error } = await promise;
  assert.equal(error, null, `${label}: ${error?.message ?? "okänt fel"}`);
  return data;
}

async function createUser(label) {
  const email = `${label}.${suffix}@example.test`;
  const data = await requireData(
    service.auth.admin.createUser({ email, password, email_confirm: true }),
    `skapa ${label}`,
  );
  createdUserIds.push(data.user.id);
  return { id: data.user.id, email };
}

async function signedInClient(user) {
  const client = createClient(url, anonKey, options);
  await requireData(
    client.auth.signInWithPassword({ email: user.email, password }),
    `logga in ${user.email}`,
  );
  return client;
}

async function run() {
  const [ownerA, memberA, viewerA, ownerB] = await Promise.all([
    createUser("owner-a"),
    createUser("member-a"),
    createUser("viewer-a"),
    createUser("owner-b"),
  ]);
  const organizationA = randomUUID();
  const organizationB = randomUUID();
  createdOrganizationIds.push(organizationA, organizationB);

  await requireData(
    service.from("profiles").upsert(
      [ownerA, memberA, viewerA, ownerB].map((user) => ({
        id: user.id,
        email: user.email,
        full_name: "Lokal integrationstest",
      })),
    ),
    "skapa profiler",
  );
  await requireData(
    service.from("organizations").insert([
      {
        id: organizationA,
        name: "Integrationstest Alpha",
        employee_customer_scope: "assigned_only",
      },
      { id: organizationB, name: "Integrationstest Beta" },
    ]),
    "skapa organisationer",
  );
  await requireData(
    service.from("organization_members").insert([
      { organization_id: organizationA, user_id: ownerA.id, role: "owner" },
      { organization_id: organizationA, user_id: memberA.id, role: "member" },
      { organization_id: organizationA, user_id: viewerA.id, role: "viewer" },
      { organization_id: organizationB, user_id: ownerB.id, role: "owner" },
    ]),
    "skapa medlemskap",
  );

  const ownCustomerId = randomUUID();
  const otherCustomerId = randomUUID();
  const privateCustomerId = randomUUID();
  await requireData(
    service.from("customers").insert([
      {
        id: ownCustomerId,
        organization_id: organizationA,
        company_name: "Tilldelad kund",
        created_by: memberA.id,
        owner_user_id: memberA.id,
        visibility: "organization",
      },
      {
        id: otherCustomerId,
        organization_id: organizationA,
        company_name: "Annan kund",
        created_by: ownerA.id,
        owner_user_id: ownerA.id,
        visibility: "organization",
      },
      {
        id: privateCustomerId,
        organization_id: organizationA,
        company_name: "Ägarprivat kund",
        created_by: ownerA.id,
        owner_user_id: ownerA.id,
        visibility: "owners_only",
      },
    ]),
    "skapa kunder",
  );

  const [ownerClient, memberClient, viewerClient, otherOwnerClient] =
    await Promise.all([
      signedInClient(ownerA),
      signedInClient(memberA),
      signedInClient(viewerA),
      signedInClient(ownerB),
    ]);

  const memberCustomers = await requireData(
    memberClient.from("customers").select("id"),
    "medlems kundomfång",
  );
  assert.deepEqual(memberCustomers.map(({ id }) => id), [ownCustomerId]);
  const ownerCustomers = await requireData(
    ownerClient.from("customers").select("id"),
    "ägarens kundomfång",
  );
  assert.equal(ownerCustomers.length, 3);
  const foreignCustomers = await requireData(
    otherOwnerClient
      .from("customers")
      .select("id")
      .eq("organization_id", organizationA),
    "tenantisolering",
  );
  assert.equal(foreignCustomers.length, 0);

  const forgedUpdate = await memberClient
    .from("customers")
    .update({ notes: "ska inte sparas" })
    .eq("id", otherCustomerId)
    .select("id");
  assert.equal(forgedUpdate.error, null);
  assert.equal(forgedUpdate.data?.length, 0);
  const viewerInsert = await viewerClient.from("tasks").insert({
    organization_id: organizationA,
    title: "ska stoppas",
  });
  assert.notEqual(viewerInsert.error, null);

  const unlockedPath = `${organizationA}/integration/${suffix}-unlocked.txt`;
  const retainedPath = `${organizationA}/integration/${suffix}-retained.txt`;
  storagePaths.push(unlockedPath, retainedPath);
  await requireData(
    memberClient.storage
      .from("hub-documents")
      .upload(unlockedPath, new Blob(["synthetic unlocked"]), { upsert: false }),
    "ladda upp olåst fil",
  );
  await requireData(
    memberClient.storage
      .from("hub-documents")
      .upload(retainedPath, new Blob(["synthetic retained"]), { upsert: false }),
    "ladda upp låst fil",
  );
  await requireData(
    service.from("documents").insert([
      {
        organization_id: organizationA,
        customer_id: ownCustomerId,
        file_name: "unlocked.txt",
        file_path: unlockedPath,
        uploaded_by: memberA.id,
        sha256: "1".repeat(64),
        original_storage_key: unlockedPath,
        retention_locked: false,
      },
      {
        organization_id: organizationA,
        customer_id: ownCustomerId,
        file_name: "retained.txt",
        file_path: retainedPath,
        uploaded_by: memberA.id,
        sha256: "2".repeat(64),
        original_storage_key: retainedPath,
        retention_locked: true,
      },
    ]),
    "registrera dokumentmetadata",
  );

  await requireData(
    memberClient.storage.from("hub-documents").download(unlockedPath),
    "läs egen fil",
  );
  assert.notEqual(
    (await otherOwnerClient.storage.from("hub-documents").download(unlockedPath))
      .error,
    null,
  );
  assert.notEqual(
    (await viewerClient.storage.from("hub-documents").download(unlockedPath))
      .error,
    null,
  );
  await requireData(
    memberClient.storage.from("hub-documents").remove([unlockedPath]),
    "radera olåst fil",
  );
  assert.notEqual(
    (await memberClient.storage.from("hub-documents").remove([retainedPath])).error,
    null,
  );

  const year = new Date().getUTCFullYear();
  await requireData(
    ownerClient.rpc("initialize_accounting_mvp", {
      target_organization_id: organizationA,
      target_fiscal_year_start: `${year}-01-01`,
      target_fiscal_year_end: `${year}-12-31`,
    }),
    "initiera bokföring",
  );
  const draftInput = {
    target_organization_id: organizationA,
    target_client_request_key: `draft-${suffix}`,
    target_event_type: "owner_deposit",
    target_happened_on: `${year}-08-13`,
    target_amount_minor: 100_00,
    target_description: "Syntetisk egen insättning",
    target_facts: { synthetic: true },
    target_posting_rule_id: "se-sole-trader-owner-deposit",
    target_posting_rule_version: 1,
    target_lines: [
      { accountNumber: "1930", side: "debit", amountMinor: 100_00 },
      { accountNumber: "2018", side: "credit", amountMinor: 100_00 },
    ],
    target_warnings: [],
  };
  const draftResults = await Promise.all([
    ownerClient.rpc("save_bookkeeping_draft", draftInput),
    ownerClient.rpc("save_bookkeeping_draft", draftInput),
  ]);
  for (const result of draftResults) assert.equal(result.error, null);
  assert.notEqual(draftResults[0].data, null);
  assert.equal(draftResults[0].data, draftResults[1].data);
  const draftId = draftResults[0].data;
  await requireData(
    ownerClient.rpc("approve_bookkeeping_draft", {
      target_organization_id: organizationA,
      target_draft_id: draftId,
    }),
    "godkänn bokföringsutkast",
  );
  const postingInput = {
    target_organization_id: organizationA,
    target_draft_id: draftId,
    target_idempotency_key: `posting-${suffix}`,
    target_journal_series: "A",
  };
  const postingResults = await Promise.all([
    ownerClient.rpc("post_bookkeeping_draft", postingInput),
    ownerClient.rpc("post_bookkeeping_draft", postingInput),
  ]);
  for (const result of postingResults) assert.equal(result.error, null);
  assert.equal(postingResults[0].data, postingResults[1].data);
  const journalRows = await requireData(
    service
      .from("journal_entries")
      .select("id, journal_number")
      .eq("organization_id", organizationA),
    "kontrollera verifikation",
  );
  assert.equal(journalRows.length, 1);
  assert.notEqual(
    (
      await ownerClient
        .from("journal_entries")
        .update({ description: "ska stoppas" })
        .eq("id", journalRows[0].id)
    ).error,
    null,
  );

  const numberResults = await Promise.all(
    Array.from({ length: 6 }, () =>
      ownerClient.rpc("claim_next_invoice_number", {
        target_organization_id: organizationA,
      }),
    ),
  );
  for (const result of numberResults) assert.equal(result.error, null);
  assert.equal(new Set(numberResults.map(({ data }) => data)).size, 6);

  const jobInput = {
    target_organization_id: organizationA,
    target_created_by: ownerA.id,
    target_type: "report_generation",
    target_entity_type: "organization",
    target_entity_id: organizationA,
    target_payload: { synthetic: true },
    target_deduplication_key: `job-${suffix}`,
    target_request_hash: "3".repeat(64),
    target_priority: 0,
    target_max_attempts: 3,
  };
  const jobResults = await Promise.all([
    service.rpc("enqueue_processing_job", jobInput),
    service.rpc("enqueue_processing_job", jobInput),
  ]);
  for (const result of jobResults) assert.equal(result.error, null);
  assert.equal(jobResults[0].data, jobResults[1].data);

  console.log("Lokala Supabase-integrationstester passerade.");
}

try {
  await run();
} finally {
  if (storagePaths.length) {
    await service.storage.from("hub-documents").remove(storagePaths);
  }
  if (createdOrganizationIds.length) {
    await service.from("organizations").delete().in("id", createdOrganizationIds);
  }
  for (const userId of createdUserIds) {
    await service.auth.admin.deleteUser(userId);
  }
}
