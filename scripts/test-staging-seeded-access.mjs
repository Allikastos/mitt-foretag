import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  assertStagingLink,
  getStagingApiKeys,
  requireConfirmation,
  STAGING_CREDENTIALS_FILE,
  STAGING_PROJECT_REF,
  STAGING_URL,
} from "./staging-supabase.mjs";

const alphaOrganization = "10000000-0000-4000-8000-000000000001";
const betaOrganization = "20000000-0000-4000-8000-000000000002";
const alphaAssignedCustomer = "13000000-0000-4000-8000-000000000001";
const alphaOtherCustomer = "13000000-0000-4000-8000-000000000002";
const alphaStoragePath = `${alphaOrganization}/synthetic/alpha-kvitto.pdf`;
const options = { auth: { persistSession: false, autoRefreshToken: false } };

async function requireData(promise, label) {
  const { data, error } = await promise;
  assert.equal(error, null, `${label}: ${error?.message ?? "okant fel"}`);
  return data;
}

async function signedInClient(publishable, account) {
  const client = createClient(STAGING_URL, publishable, options);
  const session = await requireData(
    client.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    }),
    `logga in ${account.role}`,
  );
  return { client, userId: session.user.id };
}

requireConfirmation(
  "ALTURA_STAGING_ACCESS_CONFIRMATION",
  "SEEDED_STAGING_ONLY",
);
assertStagingLink();
assert.equal(statSync(STAGING_CREDENTIALS_FILE).mode & 0o777, 0o600);
const credentials = JSON.parse(
  readFileSync(STAGING_CREDENTIALS_FILE, "utf8"),
);
assert.equal(credentials.projectRef, STAGING_PROJECT_REF);
const byEmail = new Map(
  credentials.accounts.map((account) => [account.email, account]),
);
const { publishable } = getStagingApiKeys();
const anonymous = createClient(STAGING_URL, publishable, options);
assert.notEqual(
  (await anonymous.from("organizations").select("id")).error,
  null,
);
assert.notEqual(
  (await anonymous.rpc("is_org_member", { target_organization_id: alphaOrganization }))
    .error,
  null,
);

const [ownerA, adminA, memberA, viewerA, ownerB, memberB] =
  await Promise.all(
    [
      "owner.alpha@example.test",
      "admin.alpha@example.test",
      "member.alpha@example.test",
      "viewer.alpha@example.test",
      "owner.beta@example.test",
      "member.beta@example.test",
    ].map((email) => signedInClient(publishable, byEmail.get(email))),
  );

for (const [session, organizationId, expectedRole] of [
  [ownerA, alphaOrganization, "owner"],
  [adminA, alphaOrganization, "admin"],
  [memberA, alphaOrganization, "member"],
  [viewerA, alphaOrganization, "viewer"],
  [ownerB, betaOrganization, "owner"],
  [memberB, betaOrganization, "member"],
]) {
  assert.equal(
    await requireData(
      session.client.rpc("user_org_role", {
        target_organization_id: organizationId,
      }),
      `las rollen ${expectedRole}`,
    ),
    expectedRole,
  );
}

const customerCounts = await Promise.all(
  [ownerA, adminA, memberA, viewerA, ownerB, memberB].map(async (session) =>
    (
      await requireData(
        session.client.from("customers").select("id"),
        "las kundomfang",
      )
    ).length,
  ),
);
assert.deepEqual(customerCounts, [3, 3, 1, 0, 1, 1]);
assert.equal(
  (
    await requireData(
      ownerB.client
        .from("customers")
        .select("id")
        .eq("organization_id", alphaOrganization),
      "kontrollera kundisolering",
    )
  ).length,
  0,
);

for (const [session, expectedInvoices, expectedDocuments] of [
  [ownerA, 1, 1],
  [memberA, 1, 1],
  [viewerA, 0, 0],
  [ownerB, 1, 1],
]) {
  assert.equal(
    (await requireData(session.client.from("invoices").select("id"), "las fakturor"))
      .length,
    expectedInvoices,
  );
  assert.equal(
    (await requireData(session.client.from("documents").select("id"), "las dokument"))
      .length,
    expectedDocuments,
  );
}

assertStagingLink();
const forgedUpdate = await memberA.client
  .from("customers")
  .update({ notes: "ska inte sparas" })
  .eq("id", alphaOtherCustomer)
  .select("id");
assert.equal(forgedUpdate.error, null);
assert.equal(forgedUpdate.data.length, 0);
assertStagingLink();
assert.notEqual(
  (
    await viewerA.client.from("tasks").insert({
      organization_id: alphaOrganization,
      title: "ska stoppas",
    })
  ).error,
  null,
);
assertStagingLink();
assert.notEqual(
  (
    await memberA.client.from("documents").insert({
      organization_id: alphaOrganization,
      customer_id: alphaAssignedCustomer,
      file_name: "dubblett.pdf",
      file_path: `${alphaOrganization}/synthetic/dubblett.pdf`,
      uploaded_by: memberA.userId,
      sha256: "a".repeat(64),
      original_storage_key: `${alphaOrganization}/synthetic/dubblett.pdf`,
    })
  ).error,
  null,
);

await requireData(
  memberA.client.storage.from("hub-documents").download(alphaStoragePath),
  "medlem laser tilldelat dokument",
);
assert.notEqual(
  (await viewerA.client.storage.from("hub-documents").download(alphaStoragePath))
    .error,
  null,
);
assert.notEqual(
  (await ownerB.client.storage.from("hub-documents").download(alphaStoragePath))
    .error,
  null,
);
assert.equal(
  await requireData(
    memberA.client.rpc("can_access_customer", {
      target_organization_id: alphaOrganization,
      target_customer_id: alphaAssignedCustomer,
    }),
    "kontrollera tilldelad kund",
  ),
  true,
);
assert.equal(
  await requireData(
    ownerB.client.rpc("can_access_customer", {
      target_organization_id: alphaOrganization,
      target_customer_id: alphaAssignedCustomer,
    }),
    "kontrollera manipulerad kundreferens",
  ),
  false,
);

console.log("Seedade stagingroller, tenantgrans och Storage passerade.");
