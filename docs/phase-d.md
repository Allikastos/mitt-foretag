# Phase D: Manual Document Review

Last updated: 2026-08-14

Phase D is implemented as a guarded document inbox and review flow. Its reviewed
migration is installed and verified only in `altura-nova-hub-staging`; no OCR
provider is connected. Bidewind Consulting and production remain untouched.

## What Is Available Locally

- A redesigned Swedish document inbox with review status.
- A detail page for every original file.
- Manual receipt and supplier-invoice facts: supplier, document number, dates,
  total, VAT, description and suggested purchase event.
- Exact VAT and amount validation using the same deterministic accounting rules
  as the accounting studio.
- A proposed tenant-safe database workflow from original to source document,
  manual facts, business event and bookkeeping draft.
- A pgTAP contract for a later disposable local Supabase environment.

The preview form works while the feature flags are off but does not save data.

## Safety Boundary

- Original file metadata remains in `documents` and accounting lifecycle data
  remains in `source_documents`.
- Structured values live in `document_facts`; the original is never replaced by
  extracted or manually entered text.
- Saving facts locks the original against deletion and the lock is one-way.
- Facts are editable until linked to a bookkeeping draft. Linked facts are
  locked and corrections must happen in the accounting workflow.
- Every update increments a revision used in the draft idempotency key.
- Direct writes to `document_facts` and `source_documents` are revoked.
- No upload automatically creates or posts a journal entry.

## OCR Status Without OCR

The schema contains `extraction_method`, `ocr_status` and `ocr_provider`, but
the current UI always uses `manual`, `not_requested` and no provider. No file or
document content leaves the existing private storage flow.

## Safe Installation Order

1. Prepare a disposable local Supabase environment from the real remote schema
   baseline.
2. Review and convert `hub.sql`, `phase-b.sql`, `accounting.sql`, `phase-c.sql`
   and `phase-d.sql` into timestamped migrations in that order.
3. Run `supabase db reset`, `supabase db lint` and `supabase test db` locally.
4. Regenerate TypeScript database types and compare them with
   `src/lib/supabase.ts`.
5. Test storage RLS, cross-tenant document IDs, duplicate uploads, one-way
   retention locks and repeated draft creation.
6. Enable `HUB_FEATURE_SAFE_MUTATIONS=true`, `HUB_FEATURE_ACCOUNTING=true` and
   `HUB_FEATURE_DOCUMENT_PROCESSING=true` only in a controlled preview.

## Deliberate Limits

The manual flow supports paid domestic purchases with 25 percent VAT and
purchases without deductible VAT. Unpaid supplier invoices, credit notes,
foreign trade, reverse charge, representation and mixed VAT require separate
reviewed rules and remain unsupported.
