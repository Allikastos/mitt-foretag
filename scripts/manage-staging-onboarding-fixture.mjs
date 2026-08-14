import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  assertStagingLink,
  getStagingApiKeys,
  requireConfirmation,
  runStagingSql,
  STAGING_URL,
} from "./staging-supabase.mjs";

const operation = process.argv[2];
const fixtureFile = join(tmpdir(), "altura-staging-onboarding-fixture.json");
const options = { auth: { persistSession: false, autoRefreshToken: false } };

function stop(message) {
  console.error(`Onboarding-fixturen avbrots: ${message}`);
  process.exit(1);
}

async function requireData(promise, label) {
  const { data, error } = await promise;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

try {
  requireConfirmation(
    "ALTURA_STAGING_ONBOARDING_CONFIRMATION",
    "EPHEMERAL_STAGING_ONLY",
  );
  assertStagingLink();
  const { secret } = getStagingApiKeys();
  const service = createClient(STAGING_URL, secret, options);

  if (operation === "create") {
    if (existsSync(fixtureFile)) {
      throw new Error("stada den befintliga onboardingsfixturen forst");
    }
    const suffix = randomUUID();
    const email = `onboarding.browser.${suffix}@example.test`;
    const password = `Staging-${randomBytes(24).toString("base64url")}!`;
    const data = await requireData(
      service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: "Onboarding Webbläsartest", synthetic: true },
      }),
      "skapa tillfallig staginganvandare",
    );
    writeFileSync(
      fixtureFile,
      JSON.stringify({ userId: data.user.id, email, password }, null, 2),
      { encoding: "utf8", mode: 0o600 },
    );
    console.log(`Tillfallig onboarding-fixture skapad i ${fixtureFile}.`);
  } else if (operation === "cleanup") {
    if (!existsSync(fixtureFile)) {
      console.log("Ingen onboarding-fixture fanns att stada.");
      process.exit(0);
    }
    const fixture = JSON.parse(readFileSync(fixtureFile, "utf8"));
    const memberships = await requireData(
      service
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", fixture.userId),
      "hamta tillfallig organisation",
    );
    for (const { organization_id: organizationId } of memberships) {
      assertStagingLink();
      runStagingSql(`
        delete from public.activity_log
        where organization_id = '${organizationId}'::uuid;
        delete from public.organizations
        where id = '${organizationId}'::uuid;
      `);
    }
    assertStagingLink();
    await requireData(
      service.auth.admin.deleteUser(fixture.userId),
      "radera tillfallig staginganvandare",
    );
    rmSync(fixtureFile);
    console.log("Endast den tillfalliga onboardingsfixturen raderades.");
  } else {
    throw new Error("valj create eller cleanup");
  }
} catch (error) {
  stop(error instanceof Error ? error.message : "okant fel");
}
