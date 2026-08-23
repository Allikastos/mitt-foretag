# Phase E: Durable Background Jobs

Last updated: 2026-08-14

Phase E is implemented as a guarded process status center and a durable
Postgres job contract. Its reviewed migration is installed and verified only in
`altura-nova-hub-staging`. No production worker or external queue is connected,
and Bidewind Consulting and production remain untouched.

## What Is Available Locally

- A Swedish activity center at `/hub/processer` with totals and the latest 50
  jobs.
- Clear status, attempt count, cancellation requests and administrator retries.
- A role model where every member can view jobs, while only owners and admins
  can cancel or retry them.
- A process-local memory adapter for tests and development that refuses to start
  in production.
- An additive SQL proposal with durable status, deduplication, priorities,
  delayed retries, leases, heartbeats and safe worker completion.
- A pgTAP contract for a later disposable Supabase environment.

## Safety Boundary

- The browser receives only display-safe status fields. Payload, results, worker
  identities and internal error messages remain server-side.
- Authenticated users receive column-level access only to display-safe status
  fields and cannot write directly to `processing_jobs`.
- Generic enqueue is server-only and limits each payload to 64 KiB.
- User actions pass through tenant- and role-checked database functions.
- Worker functions live in the unexposed `private` schema and are executable
  only by `service_role`.
- Identical jobs require a tenant-local deduplication key and request hash.
- A worker owns a job only during a bounded lease and must renew it with a
  heartbeat.
- Expired work is retried with bounded exponential delay or marked failed after
  the configured maximum attempts.
- Cancellation of active work is cooperative; completion checks the cancellation
  request before accepting a result.

## Safe Installation Order

1. Prepare a disposable local Supabase environment from the real remote schema
   baseline.
2. Review and convert `hub.sql`, `phase-b.sql`, `accounting.sql`, `phase-c.sql`,
   `phase-d.sql` and `phase-e.sql` into timestamped migrations in that order.
3. Run `supabase db reset`, `supabase db lint` and `supabase test db` locally.
4. Regenerate TypeScript database types and compare them with
   `src/lib/supabase.ts`.
5. Test concurrent claims, expired leases, cancellation during processing,
   cross-tenant IDs and repeated deduplication keys.
6. Connect a reviewed production worker before enabling
   `HUB_FEATURE_BACKGROUND_JOBS=true` and `HUB_FEATURE_SAFE_MUTATIONS=true` in a
   controlled preview.

## Deliberate Limits

The phase does not execute OCR, create PDFs, send email, import bank data or
generate reports. It supplies the durable control plane those workflows need.
Supabase Queues or another worker provider remains a separate, explicit
integration decision.
