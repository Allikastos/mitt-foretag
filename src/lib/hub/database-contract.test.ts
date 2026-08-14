import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function sql(name: string) {
  return readFileSync(resolve(process.cwd(), "supabase", name), "utf8");
}

test("database proposals contain no destructive SQL statements", () => {
  for (const name of [
    "phase-b.sql",
    "accounting.sql",
    "phase-c.sql",
    "phase-d.sql",
    "phase-e.sql",
    "phase-f.sql",
  ]) {
    assert.doesNotMatch(sql(name), /^\s*(drop|truncate|delete)\b/im, name);
  }
});

test("migration plan preserves the reviewed schema and grant order", () => {
  const plan = JSON.parse(
    readFileSync(resolve(process.cwd(), "supabase", "migration-plan.json"), "utf8"),
  ) as { sources: Array<{ file: string }> };

  assert.deepEqual(
    plan.sources.map((source) => source.file),
    [
      "phase-b.sql",
      "accounting.sql",
      "phase-c.sql",
      "phase-d.sql",
      "phase-e.sql",
      "phase-f.sql",
      "api-grants.sql",
    ],
  );
});

test("explicit API grants remove broad cloud defaults before regranting", () => {
  const grants = sql("api-grants.sql");

  assert.match(
    grants,
    /revoke all on table[\s\S]+from anon, authenticated/i,
  );
  assert.doesNotMatch(
    grants,
    /grant (all|truncate|trigger|references)[^;]+to authenticated/i,
  );
  assert.match(
    grants,
    /grant select \([\s\S]+\) on public\.processing_jobs to authenticated/i,
  );
});

test("synthetic seed is isolated, multi-tenant and never automatic", () => {
  const seedPath = resolve(
    process.cwd(),
    "supabase",
    "seeds",
    "pilot-synthetic.sql",
  );
  const seed = readFileSync(seedPath, "utf8");

  assert.match(seed, /altura\.data_environment[\s\S]*local[\s\S]*test/i);
  assert.match(seed, /SYNTHETIC_TEST_DATA_ONLY/);
  assert.match(seed, /requires an empty or already synthetic database/i);
  assert.match(seed, /Syntetiska Alpha/);
  assert.match(seed, /Syntetiska Beta/);
  assert.match(seed, /'owner'[\s\S]*'admin'[\s\S]*'member'[\s\S]*'viewer'/);
  assert.equal(seedPath.endsWith("supabase/seed.sql"), false);
});

test("staging tooling is pinned to the isolated project", () => {
  const helper = readFileSync(
    resolve(process.cwd(), "scripts", "staging-supabase.mjs"),
    "utf8",
  );
  const runner = readFileSync(
    resolve(process.cwd(), "scripts", "run-staging-synthetic-seed.mjs"),
    "utf8",
  );

  assert.match(helper, /jtposcdefsmromnouald/);
  assert.match(helper, /altura-nova-hub-staging/);
  assert.match(helper, /zshdbqhuiuwjdpsavnml/);
  assert.match(runner, /SYNTHETIC_STAGING_ONLY/);
  assert.match(runner, /example\.test/);
  assert.match(runner, /STAGING_CREDENTIALS_FILE/);
  assert.doesNotMatch(runner, /process\.env\.SUPABASE_SERVICE_ROLE_KEY\s*=/);
});

test("Phase F stores safe integration status and idempotent event receipts", () => {
  const integrations = sql("phase-f.sql");

  assert.match(integrations, /create table if not exists public\.integration_connections/i);
  assert.match(integrations, /create table if not exists public\.external_event_receipts/i);
  assert.match(integrations, /payload_sha256[\s\S]*\^\[0-9a-f\]\{64\}\$/i);
  assert.match(
    integrations,
    /unique \(organization_id, provider, external_event_id\)/i,
  );
  assert.match(integrations, /returns table \([^)]*should_process boolean\)/i);
  assert.match(integrations, /status = 'processing'[\s\S]*interval '15 minutes'/i);
  assert.match(integrations, /create or replace function private\.begin_external_event/i);
  assert.match(integrations, /create or replace function private\.complete_external_event/i);
  assert.match(integrations, /grant execute[^;]+begin_external_event[^;]+to service_role/i);
  assert.doesNotMatch(integrations, /\b(api_key|access_token|refresh_token|webhook_secret)\b/i);
  assert.doesNotMatch(integrations, /\bpayload\s+jsonb\b/i);
  assert.doesNotMatch(
    integrations,
    /grant (insert|update|delete) on public\.(integration_connections|external_event_receipts) to authenticated/i,
  );
});

test("Phase E uses durable leasing without exposing worker controls", () => {
  const workflow = sql("phase-e.sql");

  assert.match(workflow, /create or replace function private\.claim_processing_job/i);
  assert.match(workflow, /for update skip locked/i);
  assert.match(workflow, /lease_expires_at/i);
  assert.match(workflow, /create or replace function private\.heartbeat_processing_job/i);
  assert.match(workflow, /create or replace function private\.reap_processing_jobs/i);
  assert.match(workflow, /deduplication_key[\s\S]*request_hash/i);
  assert.match(workflow, /grant execute[^;]+claim_processing_job[^;]+to service_role/i);
  assert.match(workflow, /grant select \([\s\S]+status[\s\S]+\) on public\.processing_jobs to authenticated/i);
  assert.doesNotMatch(
    workflow,
    /grant execute[^;]+(claim|heartbeat|complete|fail)_processing_job[^;]+to authenticated/i,
  );
  assert.doesNotMatch(
    workflow,
    /grant execute[^;]+enqueue_processing_job[^;]+to authenticated/i,
  );
  assert.doesNotMatch(
    workflow,
    /grant select on public\.processing_jobs to authenticated/i,
  );
  assert.match(
    workflow,
    /revoke select, insert, update, delete on public\.processing_jobs from public, anon, authenticated/i,
  );
});

test("processing job overview never selects private worker data", () => {
  const dataLayer = readFileSync(
    resolve(process.cwd(), "src/lib/hub-jobs-server.ts"),
    "utf8",
  );

  assert.doesNotMatch(dataLayer, /\.select\([^)]*\b(payload|result|error_message|lease_owner)\b/i);
});

test("Phase D keeps originals separate from manually reviewed facts", () => {
  const foundation = sql("accounting.sql");
  const workflow = sql("phase-d.sql");

  assert.match(workflow, /create table if not exists public\.document_facts/i);
  assert.match(workflow, /extraction_method[\s\S]*manual[\s\S]*ocr/i);
  assert.match(workflow, /ocr_status[\s\S]*not_requested/i);
  assert.match(workflow, /create or replace function public\.save_document_facts/i);
  assert.match(workflow, /create or replace function public\.link_source_document_to_draft/i);
  assert.match(workflow, /documents_retention_lock_is_one_way/i);
  assert.match(workflow, /Retained hub documents cannot be replaced/i);
  assert.match(workflow, /Retained hub documents cannot be deleted/i);
  assert.match(workflow, /pg_advisory_xact_lock/i);
  assert.match(
    workflow,
    /revoke insert, update, delete on public\.source_documents from anon, authenticated/i,
  );
  assert.doesNotMatch(foundation, /Managers can (create|update) source document/i);
  assert.match(
    foundation,
    /source_document_id[\s\S]*target_event\.source_entity_type = 'source_document'/i,
  );
});

test("document metadata has tenant-local duplicate and storage-key protection", () => {
  const migration = sql("phase-b.sql");
  assert.match(migration, /documents_org_sha256_idx[\s\S]*organization_id, sha256/);
  assert.match(migration, /documents_org_file_path_idx[\s\S]*organization_id, file_path/);
  assert.match(migration, /upsert: false|original_storage_key/);
  assert.match(migration, /contacts_org_customer_fk[\s\S]*organization_id, customer_id/);
  assert.match(migration, /create or replace function public\.can_access_customer/i);
  assert.match(migration, /employee_customer_scope = 'all_customers'/i);
  assert.match(migration, /alter policy "Members can read customers"/i);
  assert.match(migration, /alter policy "Hub members can view documents bucket"/i);
  assert.match(migration, /document\.file_path = name/i);
});

test("invoice finalization is modeled as a resumable database workflow", () => {
  const migration = sql("phase-b.sql");
  assert.match(migration, /pdf_status[\s\S]*not_started[\s\S]*processing[\s\S]*ready[\s\S]*failed/);
  assert.match(migration, /begin_invoice_finalization/);
  assert.match(migration, /complete_invoice_finalization/);
  assert.match(migration, /fail_invoice_finalization/);
  assert.match(migration, /for update/i);
  assert.match(migration, /Idempotent result cannot be replaced/);
});

test("accounting tables use RLS and tenant-aware composite references", () => {
  const migration = sql("accounting.sql");
  for (const table of [
    "business_events",
    "bookkeeping_drafts",
    "source_documents",
    "journal_series_counters",
    "journal_entries",
    "journal_lines",
    "bank_transactions",
    "reconciliation_matches",
    "correction_links",
    "audit_events",
  ]) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, "i"),
      table,
    );
  }
  assert.match(migration, /foreign key \(organization_id, journal_entry_id\)/i);
  assert.match(migration, /foreign key \(organization_id, business_event_id\)/i);
});

test("posted journal data is append-only and balanced before insert", () => {
  const migration = sql("accounting.sql");
  assert.match(migration, /journal_entries_are_immutable/);
  assert.match(migration, /journal_lines_are_immutable/);
  assert.match(migration, /debit_total <> credit_total/);
  assert.match(migration, /journal_series_counters[\s\S]*on conflict/);
  assert.doesNotMatch(
    migration,
    /create policy[^;]+journal_(entries|lines)[^;]+for (update|delete|all)/i,
  );
  assert.match(
    migration,
    /select \* into target_draft[\s\S]*for update;[\s\S]*begin_hub_idempotent_operation[\s\S]*target_draft\.status <> 'ready_to_post'/i,
  );
});

test("Phase C requires a validated approval workflow for accounting writes", () => {
  const foundation = sql("accounting.sql");
  const workflow = sql("phase-c.sql");

  assert.match(workflow, /create or replace function public\.save_bookkeeping_draft/i);
  assert.match(workflow, /create or replace function public\.approve_bookkeeping_draft/i);
  assert.match(workflow, /pg_advisory_xact_lock/i);
  assert.match(workflow, /debit_total <> credit_total/i);
  assert.match(workflow, /can_manage_org_settings\(target_organization_id\)/i);
  assert.match(
    workflow,
    /revoke insert, update, delete on public\.journal_entries from anon, authenticated/i,
  );
  assert.match(
    foundation,
    /post_bookkeeping_draft[\s\S]*can_manage_org_settings\(target_organization_id\)/i,
  );
  assert.doesNotMatch(
    foundation,
    /Managers can manage (business_events|bookkeeping_drafts)/i,
  );
});
