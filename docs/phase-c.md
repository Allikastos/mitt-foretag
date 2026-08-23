# Phase C: Accounting MVP

Last updated: 2026-08-14

Phase C is implemented as a guarded accounting studio. Its reviewed migration
is installed and verified only in `altura-nova-hub-staging`; the protected
Netlify draft uses that staging project. No Phase C SQL or feature activation
has been applied to Bidewind Consulting or production.

## What Is Available Locally

- A Swedish `/hub/bokforing` page with an unsaved posting preview.
- Seven deterministic event types for sole traders using cash basis and SEK.
- Exact integer minor-unit handling and debit/credit validation.
- Explicit accounting capabilities for owner, admin, member and viewer.
- A proposed database workflow for initialization, draft creation, approval
  and immutable posting.
- A pgTAP contract file for a later disposable local Supabase environment.

The preview is intentionally useful while both accounting flags remain off.
It runs the same deterministic TypeScript rules as the future save flow, but it
does not write data.

## Roles

- Owner and admin can configure accounting, create drafts, approve and post.
- Member can create drafts for review, but cannot approve or post.
- Viewer can only read accounting data.

The server actions enforce these rules again on every request. UI visibility is
not treated as authorization.

## Safe Installation Order

Do not paste the proposal files directly into a production database. For a
later reviewed rollout:

1. Link a disposable local Supabase environment to the existing project.
2. Pull the existing remote schema as the migration baseline.
3. Convert and review `hub.sql`, `phase-b.sql`, `accounting.sql` and
   `phase-c.sql` as timestamped migrations in that order.
4. Run `supabase db reset`, `supabase db lint` and `supabase test db` locally.
5. Regenerate the TypeScript database types and compare them with
   `src/lib/supabase.ts`.
6. Have a Swedish bookkeeping specialist review account choices, VAT handling
   and every posting rule.
7. Enable `HUB_FEATURE_SAFE_MUTATIONS=true` and
   `HUB_FEATURE_ACCOUNTING=true` only in a controlled preview environment.
8. Test tenant isolation, retries, approval roles, locked periods and duplicate
   submissions before considering production.

## Deliberate Limits

Phase C blocks limited companies, accrual accounting, currencies other than
SEK, payroll, loans, leasing, fixed assets, inventory, international trade,
reverse-charge VAT, OSS and year-end work. These require separate reviewed
rules and must not fall back to a guessed posting.

The starter accounts are suggestions, not a complete BAS chart. They remain
marked for review even after initialization.
