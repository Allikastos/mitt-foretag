# Future Integrations

Last updated: 2026-08-12

No integration in this file is active by default. Each provider must be enabled
behind a feature flag and approved before setup.

## Production Database

Current provider: Supabase.

Why needed: Already used for auth, database and storage.

When to revisit: If usage, compliance or cost makes the current Supabase setup
insufficient.

Prepared code: Supabase-specific access is currently centralized in
`src/lib/supabase.ts` and `src/lib/supabase-server.ts`.

Manual setup later: Keep secrets in Supabase/Vercel dashboards only. Never paste
service role keys into chat or commit them.

## Private Object Storage

Current provider: Supabase Storage.

Why needed: Documents must not be stored as blobs in Postgres.

When to revisit: If thousands of documents, retention rules, backup needs or
cost require a different storage provider.

Prepared code: `StorageProvider` interface in `src/lib/hub/providers`.

Required future env vars: provider-specific bucket/project credentials. These
must stay server-only unless explicitly public.

Rollback: Keep document metadata provider-neutral so files can be migrated by
storage key.

## Queue Or Workflow Service

Current provider: none.

Why needed later: OCR, bank imports, report generation and recurring email
digests should not run inside user requests.

When to connect: When background jobs need production reliability.

Prepared code: `JobQueueProvider` interface and `processing_jobs` schema.

Important: Do not use an in-memory queue as production infrastructure.

## OCR And AI

Current provider: none.

Why needed later: Reading receipts, supplier invoices and bank statements.

When to connect: After manual document flow, audit trail, review UI and cost
limits exist.

Prepared code: `DocumentProcessor` interface.

Security: OCR output may contain personal data and must not be logged in full.

Accounting rule: AI may suggest facts and categories. It must not post final
debit/credit entries.

## Redis And Rate Limiting

Current provider: none.

Why needed later: Contact forms, login-sensitive endpoints, upload endpoints and
AI endpoints may need throttling.

Prepared code: keep a provider-independent rate-limit interface before adding a
provider.

## Observability

Current provider: Vercel analytics package is installed. No hub-specific error
tracking provider is required yet.

Why needed later: Production support and debugging.

When to connect: Before paid customers depend on the hub daily.

Rule: Do not send full documents, tokens or sensitive accounting data to logs.

## Email Delivery

Current provider: Resend for the public contact form.

Why needed later: Invoice sending, weekly follow-up digests and operational
notifications.

When to connect: After email templates, unsubscribe/notification preferences and
delivery logging are designed.

Prepared code: Email should go through a provider interface before hub emails
are enabled.

## Bank Integration

Current provider: none.

Why needed later: Bank transaction import and reconciliation.

Cost-free first step: CSV import for bank transactions.

When to connect: After manual CSV import, matching rules and audit trail work.

Regulatory note: Real bank integrations may involve provider cost, consent
flows and compliance review.

## Payments

Current provider: none connected for subscriptions. Organization fields already
reserve Stripe IDs.

Why needed later: Monthly SaaS billing.

When to connect: After product packaging, trial policy, cancellation handling
and Swedish invoice/accounting implications are decided.

Manual setup later: The user should create provider account/dashboard settings
directly. Secrets go into Vercel environment variables, never into chat.
