"use client";

import { useRef, useState } from "react";
import { saveDocumentFactsAction } from "@/app/hub/document-actions";
import { accountingEventLabel, type PostingResult } from "@/src/lib/hub/accounting";
import {
  buildManualDocumentReview,
  documentPurchaseEventTypes,
  manualDocumentKindLabel,
  manualDocumentKinds,
  type DocumentPurchaseEventType,
  type ManualDocumentFactsInput,
} from "@/src/lib/hub/documents";
import { Field, FormGrid, inputClassName, textareaClassName } from "./ui";

type InitialDocumentFacts = {
  document_kind: "receipt" | "supplier_invoice";
  supplier_name: string;
  supplier_org_number: string | null;
  document_number: string | null;
  document_date: string;
  payment_date: string;
  total_minor: number;
  vat_minor: number;
  description: string;
  suggested_event_type: DocumentPurchaseEventType;
} | null;

function formatMinor(amountMinor: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(amountMinor / 100);
}

function amountInput(amountMinor: number | undefined) {
  if (amountMinor === undefined) return "";
  return (amountMinor / 100).toFixed(2).replace(".", ",");
}

export function DocumentFactsForm({
  documentId,
  organizationId,
  defaultKind,
  initialFacts,
  canPersist,
  isLocked,
}: {
  documentId: string;
  organizationId: string;
  defaultKind: "receipt" | "supplier_invoice";
  initialFacts: InitialDocumentFacts;
  canPersist: boolean;
  isLocked: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [eventType, setEventType] = useState<DocumentPurchaseEventType>(
    initialFacts?.suggested_event_type ?? "paid_domestic_purchase_25_vat",
  );
  const [previewFacts, setPreviewFacts] = useState<ManualDocumentFactsInput | null>(null);
  const [posting, setPosting] = useState<PostingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function preview(formData: FormData) {
    try {
      const review = buildManualDocumentReview({
        documentId,
        organizationId,
        documentKind: String(formData.get("document_kind") ?? ""),
        supplierName: String(formData.get("supplier_name") ?? ""),
        supplierOrgNumber: String(formData.get("supplier_org_number") ?? ""),
        documentNumber: String(formData.get("document_number") ?? ""),
        documentDate: String(formData.get("document_date") ?? ""),
        paymentDate: String(formData.get("payment_date") ?? ""),
        totalSek: String(formData.get("total_sek") ?? ""),
        vatSek: String(formData.get("vat_sek") ?? ""),
        description: String(formData.get("description") ?? ""),
        suggestedEventType: String(formData.get("suggested_event_type") ?? ""),
      });
      setPreviewFacts(review.facts);
      setPosting(review.posting);
      setError(null);
    } catch (previewError) {
      setPreviewFacts(null);
      setPosting(null);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Dokumentuppgifterna kunde inte kontrolleras.",
      );
    }
  }

  function previewCurrentForm() {
    if (formRef.current) preview(new FormData(formRef.current));
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-black/8 bg-[var(--hub-card)]">
      <div className="border-b border-black/8 bg-[var(--hub-panel)] px-5 py-5 text-[var(--hub-panel-contrast)] md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--hub-accent)]">
              Manuell granskning
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
              Kontrollera dokumentuppgifter
            </h2>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-[var(--hub-panel-muted)]">
            {isLocked ? "Kopplad och låst" : canPersist ? "Kan sparas" : "Förhandsläge"}
          </span>
        </div>
      </div>

      <form
        ref={formRef}
        action={canPersist ? saveDocumentFactsAction : preview}
        className="space-y-5 p-5 md:p-6"
      >
        <input type="hidden" name="document_id" value={documentId} />
        <FormGrid>
          <Field label="Dokumenttyp">
            <select
              name="document_kind"
              defaultValue={initialFacts?.document_kind ?? defaultKind}
              className={inputClassName}
              disabled={isLocked}
            >
              {manualDocumentKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {manualDocumentKindLabel(kind)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Leverantör">
            <input
              name="supplier_name"
              defaultValue={initialFacts?.supplier_name ?? ""}
              className={inputClassName}
              disabled={isLocked}
              required
            />
          </Field>
          <Field label="Leverantörens organisationsnummer">
            <input
              name="supplier_org_number"
              defaultValue={initialFacts?.supplier_org_number ?? ""}
              className={inputClassName}
              disabled={isLocked}
              placeholder="Valfritt"
            />
          </Field>
          <Field label="Kvitto- eller fakturanummer">
            <input
              name="document_number"
              defaultValue={initialFacts?.document_number ?? ""}
              className={inputClassName}
              disabled={isLocked}
              placeholder="Valfritt"
            />
          </Field>
          <Field label="Dokumentdatum">
            <input
              type="date"
              name="document_date"
              defaultValue={initialFacts?.document_date ?? ""}
              className={inputClassName}
              disabled={isLocked}
              required
            />
          </Field>
          <Field label="Betaldatum">
            <input
              type="date"
              name="payment_date"
              defaultValue={initialFacts?.payment_date ?? ""}
              className={inputClassName}
              disabled={isLocked}
              required
            />
          </Field>
          <Field label="Totalbelopp inklusive moms">
            <input
              name="total_sek"
              inputMode="decimal"
              defaultValue={amountInput(initialFacts?.total_minor)}
              className={inputClassName}
              disabled={isLocked}
              placeholder="Exempel: 1 250,00"
              required
            />
          </Field>
          <Field label="Momsbelopp">
            <input
              name="vat_sek"
              inputMode="decimal"
              defaultValue={amountInput(initialFacts?.vat_minor)}
              className={inputClassName}
              disabled={isLocked}
              placeholder="Exempel: 250,00"
              required
            />
          </Field>
          <Field label="Föreslagen händelse">
            <select
              name="suggested_event_type"
              value={eventType}
              onChange={(event) =>
                setEventType(event.target.value as DocumentPurchaseEventType)
              }
              className={inputClassName}
              disabled={isLocked}
            >
              {documentPurchaseEventTypes.map((type) => (
                <option key={type} value={type}>
                  {accountingEventLabel(type)}
                </option>
              ))}
            </select>
          </Field>
          <div className="rounded-2xl border border-black/8 bg-[var(--hub-card-soft)] px-4 py-3 text-sm leading-6 text-[var(--hub-muted)]">
            {eventType === "paid_domestic_purchase_25_vat"
              ? "Momsbeloppet måste motsvara 25 procent moms inkluderad i totalen."
              : "Hela beloppet föreslås som kostnad utan momsavdrag."}
          </div>
        </FormGrid>
        <Field label="Beskrivning">
          <textarea
            name="description"
            defaultValue={initialFacts?.description ?? ""}
            className={textareaClassName}
            disabled={isLocked}
            placeholder="Vad köptes och varför?"
            required
          />
        </Field>

        {error ? (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!isLocked ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={previewCurrentForm}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--hub-panel)] px-5 py-3 text-sm font-medium text-[var(--hub-panel-contrast)] transition hover:opacity-90"
            >
              Kontrollera uppgifter
            </button>
            {canPersist ? (
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-[var(--hub-card)] px-5 py-3 text-sm font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)]"
              >
                Spara manuella uppgifter
              </button>
            ) : null}
          </div>
        ) : null}
      </form>

      {previewFacts && posting ? (
        <div className="border-t border-black/8 bg-[var(--hub-card-soft)] p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
                Kontrollerat underlag
              </p>
              <p className="mt-2 font-medium text-[var(--hub-text)]">
                {previewFacts.supplierName} · {formatMinor(previewFacts.totalMinor)}
              </p>
              <p className="mt-1 text-sm text-[var(--hub-muted)]">
                Moms {formatMinor(previewFacts.vatMinor)} · betald {previewFacts.paymentDate}
              </p>
            </div>
            <span className="rounded-full border border-black/10 bg-[var(--hub-card)] px-3 py-1.5 text-xs font-medium text-[var(--hub-text)]">
              Regel v{posting.ruleVersion}
            </span>
          </div>
          <div className="mt-5 overflow-hidden rounded-[1.2rem] border border-black/8 bg-[var(--hub-card)]">
            {posting.lines.map((line, index) => (
              <div
                key={`${line.accountNumber}-${line.side}-${index}`}
                className="grid gap-2 border-b border-black/8 px-4 py-3 last:border-b-0 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
              >
                <span className="font-mono text-sm text-[var(--hub-accent-strong)]">
                  {line.accountNumber}
                </span>
                <p className="text-sm text-[var(--hub-text)]">
                  {line.side === "debit" ? "Debet" : "Kredit"} · {line.accountName}
                </p>
                <span className="text-sm font-semibold text-[var(--hub-text)]">
                  {formatMinor(line.amountMinor)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--hub-muted)]">
            Förhandskontrollen sparas inte och skapar ingen verifikation.
          </p>
        </div>
      ) : null}
    </div>
  );
}
