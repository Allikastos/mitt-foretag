"use client";

import { useActionState, useState } from "react";
import {
  importProspectBatchAction,
  type ProspectBatchActionState,
} from "@/app/hub/actions";
import {
  PROSPECT_BATCH_MAX_ROWS,
  parseProspectBatch,
} from "@/src/lib/hub/prospect-batch";
import { HubCard, textareaClassName } from "./ui";

const initialState: ProspectBatchActionState = {
  status: "idle",
  message: "",
  importedCount: 0,
  skippedCount: 0,
  errors: [],
};

export function ProspectBatchForm() {
  const [source, setSource] = useState("");
  const [state, formAction, pending] = useActionState(
    importProspectBatchAction,
    initialState,
  );
  const preview = parseProspectBatch(source);
  const canSubmit = preview.rows.length > 0 && preview.errors.length === 0;

  return (
    <HubCard>
      <details>
        <summary className="cursor-pointer list-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--hub-accent)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
                Prospektering i mindre omgångar
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--hub-text)]">
                Klistra in utvalda prospekt
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                Lägg till högst {PROSPECT_BATCH_MAX_ROWS} relevanta företag från
                ett kalkylark. Inget meddelande skickas automatiskt.
              </p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--hub-card-soft)] text-lg text-[var(--hub-text)]"
            >
              +
            </span>
          </div>
        </summary>

        <form action={formAction} className="mt-6 space-y-5">
          <div className="rounded-2xl bg-[var(--hub-card-soft)] p-4 text-sm leading-6 text-[var(--hub-muted)]">
            <p className="font-medium text-[var(--hub-text)]">Kolumnordning</p>
            <p className="mt-1">
              Företagsnamn, kontaktperson, e-post, telefon, återkopplingsdatum
              och behovsanteckning. Kopiera raderna direkt från kalkylarket så
              följer tabbavgränsningen med.
            </p>
          </div>

          <label className="block" htmlFor="prospect-batch">
            <span className="mb-2 block text-sm font-medium text-[var(--hub-text)]">
              Prospektrader
            </span>
            <textarea
              id="prospect-batch"
              name="prospect_batch"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className={`${textareaClassName} min-h-44 font-mono text-xs`}
              placeholder={
                "Exempel AB\tAnna Andersson\tanna@example.se\t\t2026-08-31\tBehöver ett tydligare bokningsflöde"
              }
              aria-describedby="prospect-batch-help"
            />
          </label>
          <p id="prospect-batch-help" className="text-xs leading-5 text-[var(--hub-subtle)]">
            Företagsnamn, kontaktväg, datum och behov krävs. Ansvarig blir den
            inloggade användaren och säljläget blir Nytt prospekt.
          </p>

          {source.trim() ? (
            <div aria-live="polite">
              {preview.errors.length ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                  <p className="font-semibold">Rätta innan du sparar</p>
                  <ul className="mt-2 space-y-1">
                    {preview.errors.slice(0, 8).map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--hub-text)]">
                      Förhandsgranskning
                    </p>
                    <p className="text-xs text-[var(--hub-muted)]">
                      {preview.rows.length} prospekt
                    </p>
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-2xl border border-black/8">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-[var(--hub-card-soft)] text-xs uppercase tracking-[0.12em] text-[var(--hub-subtle)]">
                        <tr>
                          <th className="px-4 py-3 font-medium">Företag</th>
                          <th className="px-4 py-3 font-medium">Kontakt</th>
                          <th className="px-4 py-3 font-medium">Återkoppling</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.rows.map((row) => (
                          <tr key={`${row.lineNumber}-${row.companyName}`} className="border-t border-black/8">
                            <td className="px-4 py-3 font-medium text-[var(--hub-text)]">
                              {row.companyName}
                            </td>
                            <td className="px-4 py-3 text-[var(--hub-muted)]">
                              {row.email || row.phone}
                            </td>
                            <td className="px-4 py-3 text-[var(--hub-muted)]">
                              {row.followUpDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {state.message ? (
            <div
              aria-live="polite"
              className={`rounded-2xl p-4 text-sm ${
                state.status === "success"
                  ? "bg-emerald-50 text-emerald-900"
                  : "bg-red-50 text-red-900"
              }`}
            >
              <p className="font-semibold">{state.message}</p>
              {state.skippedCount ? (
                <p className="mt-1">
                  {state.skippedCount} befintliga poster hoppades över.
                </p>
              ) : null}
              {state.errors.length ? (
                <ul className="mt-2 space-y-1">
                  {state.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit || pending}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--hub-panel)] px-6 py-3 text-sm font-semibold text-[var(--hub-panel-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pending ? "Sparar prospekt..." : "Lägg till granskade prospekt"}
          </button>
        </form>
      </details>
    </HubCard>
  );
}
