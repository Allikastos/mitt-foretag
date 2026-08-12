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
