# Phase B: Local Database Proposal

Last updated: 2026-08-12

Phase B is implemented locally but no SQL in this phase has been applied to a
Supabase environment. No deployment or external service provisioning is part
of this phase.

## Review And Installation Order

Before a later database rollout:

1. Review the existing `supabase/hub.sql` baseline.
2. Review and apply `supabase/phase-b.sql`.
3. Review and apply `supabase/accounting.sql`.
4. Regenerate Supabase TypeScript types from the installed schema.
5. Run tenant and workflow integration tests against a disposable database.
6. Set `HUB_FEATURE_SAFE_MUTATIONS=true` only after steps 1-5 pass.

For production, move the reviewed SQL into timestamped Supabase migration files
instead of treating the proposal files as an ad hoc setup script.

## Phase B Schema Changes

`phase-b.sql` adds:

- Idempotency records and processing-job state.
- Document SHA-256, type, processing state, original storage key, retention
  lock and idempotency key.
- Tenant-local unique indexes for document hashes and storage paths.
- Invoice PDF state, error, storage key and finalization idempotency fields.
- RPC functions to begin, complete and fail idempotent operations.
- A resumable invoice-finalization workflow that keeps the invoice as a draft
  until its PDF document has been registered successfully.

`accounting.sql` adds:

- The strictly limited sole-trader, cash-basis and SEK accounting model.
- Tenant-aware composite foreign keys and RLS on company-owned tables.
- Integer minor-unit amounts for accounting money.
- Concurrency-safe journal series counters.
- An idempotent posting RPC that validates open periods and debit equals credit.
- Append-only journal entries and lines with correction links.

## Deliberate Deferrals

- Dashboard section order remains in browser storage. Moving it to the user
  account is a later personalization task.
- No paid queue or in-memory production queue is introduced.
- Accounting remains disabled until the rules and SQL have been reviewed by a
  Swedish bookkeeping specialist.
- Limited companies, accrual accounting and non-SEK posting remain blocked.
