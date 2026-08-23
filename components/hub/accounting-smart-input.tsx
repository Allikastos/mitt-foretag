"use client";

import { useId, useState } from "react";
import {
  accountingEventLabel,
  buildEventFromInterpretation,
  createBookkeepingDraft,
  interpretedPaymentMethodLabel,
  localSwedishBusinessEventParser,
  type InterpretedBusinessEventV1,
  type PostingResult,
} from "@/src/lib/hub/accounting";
import { textareaClassName } from "./ui";

function formatMinor(amountMinor: number | null) {
  if (amountMinor === null) return "Inte tolkat";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(amountMinor / 100);
}

function localIsoDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function confidenceLabel(confidence: InterpretedBusinessEventV1["confidence"]) {
  if (confidence === "green") return "Hög säkerhet";
  if (confidence === "yellow") return "Behöver granskas";
  return "Stoppad";
}

function confidenceClassName(confidence: InterpretedBusinessEventV1["confidence"]) {
  if (confidence === "green") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (confidence === "yellow") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-red-200 bg-red-50 text-red-800";
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--hub-muted)]">
        {title}
      </h4>
      <ul className="mt-2 space-y-1.5 text-sm leading-6 text-[var(--hub-text)]">
        {items.map((item) => (
          <li key={item} className="rounded-xl bg-[var(--hub-card)] px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostingPreview({ result }: { result: PostingResult }) {
  return (
    <section aria-labelledby="smart-posting-title" className="mt-5 border-t border-black/8 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
            Konteringsförslag
          </p>
          <h3 id="smart-posting-title" className="mt-2 text-lg font-semibold text-[var(--hub-text)]">
            Regelmotorns förslag
          </h3>
        </div>
        <span className="rounded-full border border-black/10 bg-[var(--hub-card)] px-3 py-1.5 text-xs font-medium text-[var(--hub-text)]">
          Regel v{result.ruleVersion}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--hub-muted)]">
        {result.plainLanguageSummary}
      </p>
      <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/8 bg-[var(--hub-card)]">
        {result.lines.map((line, index) => (
          <div
            key={`${line.accountNumber}-${line.side}-${index}`}
            className="grid gap-2 border-b border-black/8 px-4 py-3 last:border-b-0 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
          >
            <span className="font-mono text-sm text-[var(--hub-accent-strong)]">{line.accountNumber}</span>
            <div>
              <p className="text-sm font-medium text-[var(--hub-text)]">{line.accountName}</p>
              <p className="mt-0.5 text-xs text-[var(--hub-muted)]">{line.side === "debit" ? "Debet" : "Kredit"}</p>
            </div>
            <span className="text-sm font-semibold text-[var(--hub-text)]">
              {formatMinor(line.amountMinor)}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
        Fritextflödet kan inte spara, godkänna eller bokföra. Förslaget finns bara i den här förhandsvisningen.
      </p>
    </section>
  );
}

export function AccountingSmartInput({ organizationId }: { organizationId: string }) {
  const requestId = useId().replace(/:/g, "");
  const [text, setText] = useState("");
  const [interpretation, setInterpretation] = useState<InterpretedBusinessEventV1 | null>(null);
  const [postingResult, setPostingResult] = useState<PostingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function interpret(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const nextInterpretation = localSwedishBusinessEventParser.interpret({
        text,
        referenceDate: localIsoDate(),
      });
      setInterpretation(nextInterpretation);
      setPostingResult(null);
      setError(null);
    } catch (interpretationError) {
      setInterpretation(null);
      setPostingResult(null);
      setError(
        interpretationError instanceof Error
          ? interpretationError.message
          : "Texten kunde inte tolkas.",
      );
    }
  }

  function showPostingPreview() {
    if (!interpretation) return;
    try {
      const accountingEvent = buildEventFromInterpretation({
        interpretation,
        id: `smart-preview-${requestId}`,
        organizationId,
      });
      setPostingResult(createBookkeepingDraft(accountingEvent));
      setError(null);
    } catch (previewError) {
      setPostingResult(null);
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Konteringsförslaget kunde inte skapas.",
      );
    }
  }

  return (
    <div className="space-y-5 p-5 md:p-6">
      <div className="rounded-[1.2rem] border border-[color:var(--hub-accent)] bg-[var(--hub-chip)] px-4 py-3 text-sm leading-6 text-[var(--hub-text)]">
        <p className="font-semibold">Förhandsversion: lokal regelbaserad tolkning</p>
        <p className="mt-1 text-[var(--hub-muted)]">
          Detta är inte AI. Texten matchas lokalt mot sju avgränsade bokföringsregler och stoppas om något är osäkert.
        </p>
      </div>

      <form onSubmit={interpret} className="space-y-4">
        <label className="block text-sm font-medium text-[var(--hub-text)]" htmlFor={`smart-accounting-${requestId}`}>
          Beskriv vad som har hänt
        </label>
        <textarea
          id={`smart-accounting-${requestId}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Exempel: Kunden betalade 6 250 kr inklusive 25 % moms till företagets bankkonto 2026-08-14."
          className={textareaClassName}
          required
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--hub-panel)] px-5 py-3 text-sm font-medium text-[var(--hub-panel-contrast)] transition hover:opacity-90"
        >
          Tolka händelsen
        </button>
      </form>

      {error ? (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {interpretation ? (
        <section aria-labelledby="smart-interpretation-title" className="rounded-[1.35rem] border border-black/8 bg-[var(--hub-card-soft)] p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Tolkning före kontering</p>
              <h3 id="smart-interpretation-title" className="mt-2 text-lg font-semibold text-[var(--hub-text)]">Kontrollera uppgifterna</h3>
            </div>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${confidenceClassName(interpretation.confidence)}`}>
              {confidenceLabel(interpretation.confidence)}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--hub-card)] p-3">
              <dt className="text-xs text-[var(--hub-muted)]">Tolkad händelse</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--hub-text)]">{interpretation.eventType ? accountingEventLabel(interpretation.eventType) : "Inte tolkat"}</dd>
            </div>
            <div className="rounded-xl bg-[var(--hub-card)] p-3">
              <dt className="text-xs text-[var(--hub-muted)]">Belopp</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--hub-text)]">{formatMinor(interpretation.amountMinor)}</dd>
            </div>
            <div className="rounded-xl bg-[var(--hub-card)] p-3">
              <dt className="text-xs text-[var(--hub-muted)]">Datum</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--hub-text)]">{interpretation.happenedOn ?? "Inte tolkat"}</dd>
            </div>
            <div className="rounded-xl bg-[var(--hub-card)] p-3">
              <dt className="text-xs text-[var(--hub-muted)]">Betalningssätt</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--hub-text)]">{interpretedPaymentMethodLabel(interpretation.paymentMethod)}</dd>
            </div>
          </dl>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailList title="Saknade uppgifter" items={interpretation.missingInformation} />
            <DetailList title="Följdfrågor" items={interpretation.followUpQuestions} />
            <DetailList title="Varningar" items={interpretation.warnings} />
            <DetailList title="Stoppskäl" items={interpretation.stopReasons} />
          </div>

          {interpretation.canCreatePostingPreview ? (
            <button
              type="button"
              onClick={showPostingPreview}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 bg-[var(--hub-card)] px-5 py-3 text-sm font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)]"
            >
              Visa konteringsförslag
            </button>
          ) : (
            <p className="mt-5 text-sm font-medium text-red-700">
              Konteringsförslag är blockerat tills stoppskälen är lösta.
            </p>
          )}

          {postingResult ? <PostingPreview result={postingResult} /> : null}
        </section>
      ) : null}
    </div>
  );
}
