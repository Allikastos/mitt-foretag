# Altura Nova Hub Architecture

Last updated: 2026-08-12

This document describes the intended SaaS foundation for Altura Nova Hub. It is
written to guide development without requiring new paid services.

## Current Stack

- Framework: Next.js 16 App Router.
- Runtime: React 19 and TypeScript with strict mode.
- Database, auth and current private file storage: Supabase.
- Main hub server layer: `src/lib/hub-server.ts`.
- Hub Server Actions: `app/hub/actions.ts`.
- Hub database baseline: `supabase/hub.sql`.
- Phase B hub hardening proposal: `supabase/phase-b.sql`.
- Phase C accounting workflow proposal: `supabase/phase-c.sql`.
- Phase D manual document workflow proposal: `supabase/phase-d.sql`.
- Phase E durable background-job proposal: `supabase/phase-e.sql`.
- Public marketing/admin content is separate from the customer hub.

## Tenant Model

The hub is organized around `organizations`. A signed-in Supabase user gets
access through `organization_members`.

The default rule is simple:

- Every company-owned row must have `organization_id`.
- Every server read and write must filter by the current organization.
- Database RLS must enforce the same tenant boundary.
- UI controls are convenience only. They are never the security boundary.

Current roles are `owner`, `admin`, `member` and `viewer`. Accounting maps them
to explicit view, draft, approval, posting and configuration capabilities rather
than relying on role names inside UI components.

Dashboard layout order is intentionally stored per browser for now. It may move
to a user-scoped preference later, but it is not part of Phase B.

## Data Access Pattern

Use a server-only data access layer for hub data. Server Components and Server
Actions should call small functions that:

- Resolve the current user and organization.
- Check membership and role.
- Select only the fields needed for the screen.
- Return safe DTOs to Client Components.

This follows the Next.js data security guidance for a Data Access Layer and
keeps secrets, Supabase clients and authorization logic out of Client
Components.

## Existing Hub Modules

- Customers and contacts.
- Tasks and follow-ups.
- Documents with Supabase Storage metadata.
- Invoices and invoice lines.
- Organization settings, billing placeholders and email connection placeholders.
- Activity log.
- AI event placeholder.

## Planned Accounting Boundary

Accounting must be its own domain module. Invoice pages must not create debit
and credit rows directly.

The intended chain is:

Invoice or document or bank transaction
-> business event
-> bookkeeping draft
-> deterministic posting rule
-> user approval
-> immutable journal entry
-> reports.

Documents use a parallel evidence chain:

Original file -> source document -> manually reviewed facts -> business event
-> bookkeeping draft. Extracted facts never replace the original file.

## Accounting First Version Scope

The first version is planned for:

- Swedish sole proprietors.
- Cash basis / bokslutsmetoden.
- SEK.
- Mainly service businesses.
- Mainly 25 percent Swedish VAT.
- Manual review before posting.

It must explicitly reject or mark as unsupported:

- Payroll.
- Loans and interest.
- Leasing.
- Inventory.
- Fixed assets and depreciation.
- EU and non-EU trade.
- Reverse charge VAT.
- OSS.
- Representation.
- Accruals, year-end closing and annual reports.

## Accounting Data Model

The proposed additive schema is in `supabase/accounting.sql`. It should not be
applied to production until reviewed.

Core tables:

- `company_accounting_settings`
- `accounting_accounts`
- `fiscal_years`
- `accounting_periods`
- `vat_codes`
- `posting_rules`
- `business_events`
- `bookkeeping_drafts`
- `journal_entries`
- `journal_lines`
- `source_documents`
- `bank_transactions`
- `reconciliation_matches`
- `correction_links`
- `idempotency_keys`
- `processing_jobs`
- `audit_events`

Money should be stored as integer minor units, for example ore for SEK, inside
the accounting module.

The review and later installation order is documented in `docs/phase-b.md` and
the later phase documents through `docs/phase-e.md`.

## Background Processing Boundary

Long-running work must not run as an untracked side effect of a user request.
The intended chain is:

User or scheduled trigger -> deduplicated `processing_jobs` row -> leased worker
-> heartbeat -> result, review state or bounded retry.

The hub only reads display-safe job fields. Payloads, results, worker identity
and internal errors stay in the server/database boundary. Worker functions live
in an unexposed private schema and are not available to authenticated clients.
The current local memory adapter exists for tests only and rejects production.

## Deterministic Posting Rules

Rules live in code and later in the database as versioned records. Each rule
needs:

- Stable ID.
- Version.
- Supported company form.
- Supported accounting method.
- Supported VAT condition.
- Required fields.
- Generated journal lines.
- Plain Swedish explanation.
- Golden tests.

AI may later help interpret documents or ask follow-up questions, but it must
not post bookkeeping on its own.

## Immutable Bookkeeping

Posted journal entries are append-only. Corrections must create a new correction
event and a new linked journal entry. The original must remain readable.

Before posting, the system must validate:

- Debit equals credit exactly.
- At least two lines exist.
- Amounts are valid integer minor units.
- The date is inside an open fiscal year and open accounting period.
- The journal number is unique inside its series.
- The source document or business event has not already been posted.
- The user has permission to post.

## Free-Only Principle

Until explicitly approved, the app may only add:

- Local code.
- Documentation.
- TypeScript interfaces.
- Tests.
- Additive SQL files.
- Feature flags defaulting to off.

It must not provision external services, create paid subscriptions, deploy
changes, or store secrets in Git.
