# Scaling Roadmap

Last updated: 2026-08-14

The product-level direction, pricing assumptions and longer functional roadmap
live in `docs/product-vision-and-roadmap.md`. This file remains the technical
scaling view.

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

Guarded implementation is installed and verified in isolated staging only.
Specialist review and any production activation remain deliberately pending.

- Enable accounting settings per organization.
- Seed a minimal reviewed account list.
- Create fiscal years and periods.
- Add "Vad har hänt?" event flow.
- Generate drafts from deterministic rules.
- Require active user approval.
- Post immutable journal entries.
- Build reports from posted entries only.

## Phase 4: Documents Without Paid AI

Guarded implementation is installed and verified in isolated staging only.
Production activation remains deliberately pending; no OCR provider is connected.

- Expand document metadata.
- Let users manually enter receipt/invoice facts.
- Link documents to business events and drafts.
- Prevent duplicate source documents.
- Prepare OCR status without enabling paid OCR.

## Phase 5: Background Jobs

The durable schema is installed and verified in isolated staging only.
Production worker selection and feature activation remain deliberately pending.

- Use `processing_jobs` as the durable status model.
- Keep local/dev adapters clearly marked as non-production.
- Connect a real queue only after explicit approval.

## Phase 6: External Services

Staging database readiness is verified. Provider installation, cost approval
and feature activation remain deliberately pending.

- A Swedish integration center makes readiness, data sharing and cost gates
  visible to owners and employees.
- Provider-neutral contracts fail safely while no provider is selected.
- Phase F proposes owner-readable connection status and server-only webhook
  idempotency without secrets or raw payload storage.

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
