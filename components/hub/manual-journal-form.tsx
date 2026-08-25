"use client";

import { useId, useState } from "react";
import { saveManualBookkeepingDraftAction } from "@/app/hub/accounting-actions";
import { buildManualPostingResult } from "@/src/lib/hub/accounting";
import type { AccountingAccount } from "@/src/lib/hub/accounting";
import { SubmitButton } from "./submit-button";
import { Field, inputClassName, textareaClassName } from "./ui";

type EditableLine = {
  id: string;
  accountNumber: string;
  side: "debit" | "credit";
  amountSek: string;
  description: string;
};

function createLine(id: string, side: "debit" | "credit", accountNumber = ""):
  EditableLine {
  return { id, accountNumber, side, amountSek: "", description: "" };
}

function formatMinor(amountMinor: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(
    amountMinor / 100,
  );
}

export function ManualJournalForm({
  organizationId,
  accounts,
  canPersist,
}: {
  organizationId: string;
  accounts: AccountingAccount[];
  canPersist: boolean;
}) {
  const baseId = useId().replace(/:/g, "");
  const [nextLine, setNextLine] = useState(3);
  const [lines, setLines] = useState<EditableLine[]>([
    createLine(`${baseId}-1`, "debit", accounts.find((item) => item.number === "1930")?.number),
    createLine(`${baseId}-2`, "credit"),
  ]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewTotal, setPreviewTotal] = useState<number | null>(null);

  function updateLine(id: string, patch: Partial<EditableLine>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
    setPreviewError(null);
    setPreviewTotal(null);
  }

  function addLine() {
    if (lines.length >= 50) return;
    setLines((current) => [...current, createLine(`${baseId}-${nextLine}`, "debit")]);
    setNextLine((current) => current + 1);
  }

  function preview() {
    try {
      const result = buildManualPostingResult(lines, accounts);
      setPreviewTotal(
        result.lines.filter((line) => line.side === "debit").reduce((sum, line) => sum + line.amountMinor, 0),
      );
      setPreviewError(null);
    } catch (error) {
      setPreviewTotal(null);
      setPreviewError(error instanceof Error ? error.message : "Verifikationen kunde inte kontrolleras.");
    }
  }

  return (
    <form action={canPersist ? saveManualBookkeepingDraftAction : undefined} className="space-y-5">
      <input type="hidden" name="organization_id" value={organizationId} />
      <input type="hidden" name="client_request_key" value={`manual-${baseId}`} />
      <input type="hidden" name="lines_json" value={JSON.stringify(lines)} />
      <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
        <Field label="Verifikationsdatum">
          <input type="date" name="posted_on" className={inputClassName} required />
        </Field>
        <Field label="Beskrivning">
          <input name="description" className={inputClassName} maxLength={500} required />
        </Field>
      </div>

      <datalist id={`${baseId}-accounts`}>
        {accounts.map((item) => (
          <option key={item.number} value={item.number}>{item.name}</option>
        ))}
      </datalist>

      <div className="overflow-hidden rounded-[1.3rem] border border-black/8">
        <div className="hidden grid-cols-[7rem_7rem_9rem_1fr_2.5rem] gap-3 bg-[var(--hub-card-soft)] px-4 py-3 text-xs font-medium uppercase tracking-[0.1em] text-[var(--hub-muted)] md:grid">
          <span>Konto</span><span>Sida</span><span>Belopp</span><span>Radtext</span><span />
        </div>
        {lines.map((line, index) => (
          <div key={line.id} className="grid gap-3 border-t border-black/8 p-4 first:border-t-0 md:grid-cols-[7rem_7rem_9rem_1fr_2.5rem] md:items-center">
            <label className="grid gap-1 text-xs text-[var(--hub-muted)] md:block">
              <span className="md:hidden">Konto</span>
              <input
                list={`${baseId}-accounts`}
                value={line.accountNumber}
                onChange={(event) => updateLine(line.id, { accountNumber: event.target.value })}
                className={inputClassName}
                placeholder="1930"
                pattern="[0-9]{4}"
                aria-label={`Konto på rad ${index + 1}`}
                required
              />
            </label>
            <label className="grid gap-1 text-xs text-[var(--hub-muted)] md:block">
              <span className="md:hidden">Sida</span>
              <select
                value={line.side}
                onChange={(event) => updateLine(line.id, { side: event.target.value as "debit" | "credit" })}
                className={inputClassName}
                aria-label={`Sida på rad ${index + 1}`}
              >
                <option value="debit">Debet</option>
                <option value="credit">Kredit</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs text-[var(--hub-muted)] md:block">
              <span className="md:hidden">Belopp</span>
              <input
                value={line.amountSek}
                onChange={(event) => updateLine(line.id, { amountSek: event.target.value })}
                className={inputClassName}
                inputMode="decimal"
                placeholder="0,00"
                aria-label={`Belopp på rad ${index + 1}`}
                required
              />
            </label>
            <label className="grid gap-1 text-xs text-[var(--hub-muted)] md:block">
              <span className="md:hidden">Radtext</span>
              <input
                value={line.description}
                onChange={(event) => updateLine(line.id, { description: event.target.value })}
                className={inputClassName}
                maxLength={200}
                aria-label={`Radtext på rad ${index + 1}`}
              />
            </label>
            <button
              type="button"
              onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}
              disabled={lines.length <= 2}
              className="min-h-11 rounded-xl text-sm text-[var(--hub-muted)] hover:bg-red-50 hover:text-red-700 disabled:opacity-30"
              aria-label={`Ta bort rad ${index + 1}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={addLine} className="text-sm font-medium text-[var(--hub-accent-strong)]">
        + Lägg till konteringsrad
      </button>

      {previewError ? <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{previewError}</p> : null}
      {previewTotal !== null ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Verifikationen balanserar: {formatMinor(previewTotal)} i debet och kredit.
        </p>
      ) : null}

      <Field label="Intern anteckning (valfritt)">
        <textarea name="note" className={textareaClassName} maxLength={500} />
      </Field>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={preview} className="min-h-11 rounded-2xl bg-[var(--hub-panel)] px-5 py-3 text-sm font-medium text-[var(--hub-panel-contrast)]">
          Kontrollera balans
        </button>
        {canPersist ? <SubmitButton>Spara för granskning</SubmitButton> : null}
      </div>
      <p className="text-xs leading-5 text-[var(--hub-muted)]">
        En manuell verifikation bokförs aldrig direkt. Den sparas som utkast och måste godkännas av ägare eller administratör.
      </p>
    </form>
  );
}
