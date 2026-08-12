import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function sql(name: string) {
  return readFileSync(resolve(process.cwd(), "supabase", name), "utf8");
}

test("Phase B and accounting proposals contain no destructive SQL statements", () => {
  for (const name of ["phase-b.sql", "accounting.sql"]) {
    assert.doesNotMatch(sql(name), /^\s*(drop|truncate|delete)\b/im, name);
  }
});

test("document metadata has tenant-local duplicate and storage-key protection", () => {
  const migration = sql("phase-b.sql");
  assert.match(migration, /documents_org_sha256_idx[\s\S]*organization_id, sha256/);
  assert.match(migration, /documents_org_file_path_idx[\s\S]*organization_id, file_path/);
  assert.match(migration, /upsert: false|original_storage_key/);
  assert.match(migration, /contacts_org_customer_fk[\s\S]*organization_id, customer_id/);
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
});
