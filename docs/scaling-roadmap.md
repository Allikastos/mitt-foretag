# Scaling Roadmap

Last updated: 2026-08-12

The goal is a stable SaaS foundation for roughly 100 active customer companies
first, with a path toward 1,000 without rewriting everything.

## Phase 1: Free Foundation

- Keep Supabase as database, auth and current storage.
- Add documentation and provider-independent interfaces.
- Add feature flags defaulting to off.
- Add pagination and narrower selects.
- Add local tests for accounting rules and tenant-sensitive helpers.
- Add additive SQL proposal for idempotency, processing jobs and accounting.

## Phase 2: Safer Current Hub

- Add server-side `organization_id` filters to all updates.
- Add idempotency keys for invoice finalization, uploads and future posting.
- Add document hash metadata and duplicate detection.
- Move invoice finalization toward a transactional RPC.
- Add indexes for upcoming accounting lists.
- Add role/capability helper functions.

## Phase 3: Accounting MVP

Local guarded implementation completed. Database installation, specialist
review and feature activation remain deliberately pending.

- Enable accounting settings per organization.
- Seed a minimal reviewed account list.
- Create fiscal years and periods.
- Add "Vad har hänt?" event flow.
- Generate drafts from deterministic rules.
- Require active user approval.
- Post immutable journal entries.
- Build reports from posted entries only.

## Phase 4: Documents Without Paid AI

Local guarded implementation completed. Database installation and feature
activation remain deliberately pending; no OCR provider is connected.

- Expand document metadata.
- Let users manually enter receipt/invoice facts.
- Link documents to business events and drafts.
- Prevent duplicate source documents.
- Prepare OCR status without enabling paid OCR.

## Phase 5: Background Jobs

Local guarded implementation completed. Database installation, production
worker selection and feature activation remain deliberately pending.

- Use `processing_jobs` as the durable status model.
- Keep local/dev adapters clearly marked as non-production.
- Connect a real queue only after explicit approval.

## Phase 6: External Services

Only after the product needs them and cost is approved:

- OCR/AI provider.
- Queue/workflow provider.
- Redis/rate limiting.
- Error tracking.
- Bank integration.
- SaaS subscription billing.
- Backup and restore workflow beyond default provider tooling.

## Performance Targets

Initial local/test targets:

- P95 under 500 ms for common non-AI reads.
- No tenant leakage in tests.
- No duplicate invoice numbers or journal entries on retries.
- List pages should load 25-50 rows by default.

## Data Volume Guidance

Avoid loading a full organization history when the UI needs only recent rows.
Dashboards should count or summarize with targeted queries and load details
only on demand.
