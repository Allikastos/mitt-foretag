"use client";

import { useId, useRef, useState } from "react";
import { saveBookkeepingDraftAction } from "@/app/hub/accounting-actions";
import {
  accountingEventLabel,
  accountingEventTypes,
  buildAccountingEventInput,
  createBookkeepingDraft,
  type PostingResult,
  type SupportedBusinessEventType,
} from "@/src/lib/hub/accounting";
import { Field, FormGrid, inputClassName, textareaClassName } from "./ui";

function formatMinor(amountMinor: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(amountMinor / 100);
}

export function AccountingPreview({
  organizationId,
  canPersist,
}: {
  organizationId: string;
  canPersist: boolean;
}) {
  const requestId = useId().replace(/:/g, "");
  const formRef = useRef<HTMLFormElement>(null);
  const [eventType, setEventType] = useState<SupportedBusinessEventType>(
    "paid_domestic_service_sale_25_vat",
  );
  const [result, setResult] = useState<PostingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function preview(formData: FormData) {
    try {
      const event = buildAccountingEventInput({
        id: `preview-${requestId}`,
        organizationId,
        type: formData.get("event_type") as SupportedBusinessEventType,
        happenedAt: String(formData.get("happened_on") ?? ""),
        amountSek: String(formData.get("amount_sek") ?? ""),
        description: String(formData.get("description") ?? ""),
        paymentAccount: String(formData.get("payment_account") ?? ""),
        counterAccount: String(formData.get("counter_account") ?? ""),
      });
      const nextResult = createBookkeepingDraft(event);
      setResult(nextResult);
      setError(null);
    } catch (previewError) {
      setResult(null);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Konteringen kunde inte förhandsvisas.",
      );
    }
  }

  function previewCurrentForm() {
    if (formRef.current) preview(new FormData(formRef.current));
  }

  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-black/8 bg-[var(--hub-card)] shadow-[0_24px_60px_-48px_rgba(0,0,0,0.35)]">
      <div className="border-b border-black/8 bg-[var(--hub-panel)] px-5 py-5 text-[var(--hub-panel-contrast)] md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--hub-accent)]">
              Vad har hänt?
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
              Skapa ett bokföringsunderlag
            </h2>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-[var(--hub-panel-muted)]">
            {canPersist ? "Kan sparas som utkast" : "Förhandsläge"}
          </span>
        </div>
      </div>

      <form
        ref={formRef}
        action={canPersist ? saveBookkeepingDraftAction : preview}
        className="space-y-5 p-5 md:p-6"
      >
        <input
          type="hidden"
          name="client_request_key"
          value={`draft-${requestId}`}
        />
        <FormGrid>
          <Field label="Händelse">
            <select
              name="event_type"
              value={eventType}
              onChange={(event) =>
                setEventType(event.target.value as SupportedBusinessEventType)
              }
              className={inputClassName}
            >
              {accountingEventTypes.map((type) => (
                <option key={type} value={type}>
                  {accountingEventLabel(type)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Datum">
            <input
              type="date"
              name="happened_on"
              className={inputClassName}
              required
            />
          </Field>
          <Field label="Belopp inklusive moms">
            <input
              name="amount_sek"
              inputMode="decimal"
              placeholder="Exempel: 1 250,00"
              className={inputClassName}
              required
            />
          </Field>
          {eventType === "transfer_between_own_accounts" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Från konto">
                <input
                  name="payment_account"
                  defaultValue="1930"
                  pattern="[0-9]{4}"
                  className={inputClassName}
                  required
                />
              </Field>
              <Field label="Till konto">
                <input
                  name="counter_account"
                  defaultValue="1940"
                  pattern="[0-9]{4}"
                  className={inputClassName}
                  required
                />
              </Field>
            </div>
          ) : (
            <div className="rounded-2xl border border-black/8 bg-[var(--hub-card-soft)] px-4 py-3 text-sm leading-6 text-[var(--hub-muted)]">
              Konton och moms bestäms av den versionsstyrda regeln. Du får alltid
              granska resultatet innan något kan bokföras.
            </div>
          )}
        </FormGrid>
        <Field label="Beskrivning">
          <textarea
            name="description"
            placeholder="Vad avser betalningen eller överföringen?"
            className={textareaClassName}
            required
          />
        </Field>

        {error ? (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={previewCurrentForm}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--hub-panel)] px-5 py-3 text-sm font-medium text-[var(--hub-panel-contrast)] transition hover:opacity-90"
          >
            Visa kontering
          </button>
          {canPersist ? (
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-[var(--hub-card)] px-5 py-3 text-sm font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)]"
            >
              Spara för granskning
            </button>
          ) : null}
        </div>
      </form>

      {result ? (
        <div className="border-t border-black/8 bg-[var(--hub-card-soft)] p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
                Konteringsförslag
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                {result.plainLanguageSummary}
              </p>
            </div>
            <span className="rounded-full border border-black/10 bg-[var(--hub-card)] px-3 py-1.5 text-xs font-medium text-[var(--hub-text)]">
              Regel v{result.ruleVersion}
            </span>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-black/8 bg-[var(--hub-card)]">
            {result.lines.map((line, index) => (
              <div
                key={`${line.accountNumber}-${line.side}-${index}`}
                className="grid gap-2 border-b border-black/8 px-4 py-3 last:border-b-0 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
              >
                <span className="font-mono text-sm text-[var(--hub-accent-strong)]">
                  {line.accountNumber}
                </span>
                <div>
                  <p className="text-sm font-medium text-[var(--hub-text)]">
                    {line.accountName}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--hub-muted)]">
                    {line.side === "debit" ? "Debet" : "Kredit"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[var(--hub-text)]">
                  {formatMinor(line.amountMinor)}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs leading-5 text-[var(--hub-muted)]">
            {canPersist
              ? "Detta är fortfarande ett utkast. Ägare eller admin måste godkänna det innan bokföring."
              : "Förhandsvisningen sparas inte och påverkar inte företagets bokföring."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
