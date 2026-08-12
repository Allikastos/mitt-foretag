# Security And Data Notes

Last updated: 2026-08-12

## Current Security Foundation

Altura Nova Hub already uses Supabase Auth, private Supabase Storage for hub
documents and row level security in `supabase/hub.sql`.

Good current patterns:

- Hub routes call `requireHubContext()`.
- Main hub tables use `organization_id`.
- RLS policies restrict access to organization members.
- The hub documents bucket is private.
- Invoice numbers are claimed through a database function with row locking.
- Phase B routes private files through the `StorageProvider` interface and its
  Supabase adapter. Uploads use `upsert: false` and tenant-prefixed keys.

## Required Hardening

The following items should be prioritized before a real SaaS launch:

- Add automated tenant-isolation tests.
- Add automated RLS policy tests where possible.
- Add `organization_id` filters to every update and delete mutation even when
  RLS also protects the table.
- Avoid `select("*")` for large lists.
- Add pagination for customers, documents, invoices and activity logs.
- Add document SHA-256 hashes and duplicate checks.
- Distinguish ordinary uploaded files from accounting records that must be
  preserved.
- Remove or restrict delete permissions for accounting source documents.
- Add idempotency keys for sensitive mutations.
- Move multi-step invoice finalization toward a transaction or RPC.
- Apply and integration-test `supabase/phase-b.sql` before enabling
  `HUB_FEATURE_SAFE_MUTATIONS`.
- Apply and integration-test `supabase/phase-c.sql` in a disposable environment
  before enabling `HUB_FEATURE_ACCOUNTING`.
- Apply and integration-test `supabase/phase-d.sql` before enabling
  `HUB_FEATURE_DOCUMENT_PROCESSING`.
- Apply and concurrency-test `supabase/phase-e.sql`, then connect a reviewed
  worker before enabling `HUB_FEATURE_BACKGROUND_JOBS`.
- Review admin routes separately from hub roles.

## Logging Rules

Do not log:

- Full receipts.
- Full invoices.
- Personal identity numbers.
- Access tokens.
- API keys.
- Raw OCR output containing sensitive details.
- Full bank transaction exports.

Do log safe identifiers:

- Request ID.
- Organization ID.
- User ID when relevant.
- Entity type.
- Entity ID.
- Processing job ID.
- Status transitions.

## Server Actions

Server Actions are callable by direct POST requests. Every Server Action must
resolve the current user and organization on the server and must not trust IDs
from form fields without rechecking ownership.

## Environment Variables

Only variables prefixed with `NEXT_PUBLIC_` are safe to expose to the browser.
Service keys must never be added to Client Components or public env variables.

Current known variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` optional
- `RESEND_API_KEY`
- `CONTACT_FROM_EMAIL` optional
- `CONTACT_TO_EMAIL` optional

Future variables must be documented in `.env.example` with empty placeholder
values only.

## Accounting Safety

The accounting module must be conservative:

- Unsupported events must be rejected or marked for manual handling.
- Posted journal entries must not be updated or deleted.
- Corrections must be separate linked entries.
- Reports must be based on posted journal entries, not invoices or drafts.
- Rules must cite their source and be reviewed by a bookkeeping specialist
  before real use.
- Members may prepare drafts, but only owners and admins may approve or post.
- Direct writes to events, drafts and journal rows must remain revoked; state
  changes go through tenant-checked RPC functions.

## Document Evidence Safety

- Keep original file metadata separate from manually entered or extracted facts.
- Lock originals for retention as soon as they become accounting evidence.
- Never let an OCR or AI result create a journal entry without deterministic
  validation and an explicit user review step.
- Link documents through tenant-scoped identifiers inside database functions;
  never trust a document ID supplied by the browser.

## Background Job Safety

- Never send raw payloads, provider responses, worker IDs or internal error
  details to Client Components.
- Require a tenant-local deduplication key and matching request hash for every
  durable enqueue.
- Claim work with row locking and a bounded lease; a heartbeat must extend only
  the current worker's lease.
- Keep worker functions in an unexposed schema and grant them only to the
  service role.
- Authenticated users may read only tenant-scoped, display-safe status columns;
  payload, result, worker and internal-error columns stay revoked.
- Keep generic enqueue server-only, size-bound and separate from authenticated
  client permissions.
- Treat cancellation of active jobs as cooperative and recheck it before saving
  any result.
