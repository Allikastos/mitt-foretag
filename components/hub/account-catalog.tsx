"use client";

import { useDeferredValue, useState } from "react";
import {
  activateAccountingAccountAction,
  createCustomAccountingAccountAction,
} from "@/app/hub/accounting-actions";
import { accountingAccountCatalog, searchAccountCatalog } from "@/src/lib/hub/accounting/catalog";
import { SubmitButton } from "./submit-button";
import { inputClassName } from "./ui";

export function AccountCatalog({ activeNumbers, canConfigure }: { activeNumbers: string[]; canConfigure: boolean }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const active = new Set(activeNumbers);
  const results = searchAccountCatalog(deferredQuery).slice(0, 40);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="account-search" className="text-sm font-medium text-[var(--hub-text)]">Sök konto</label>
        <input
          id="account-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={`${inputClassName} mt-2`}
          placeholder="Exempel: 1930, programvara eller moms"
          maxLength={80}
        />
      </div>
      <p className="text-xs leading-5 text-[var(--hub-muted)]">
        {accountingAccountCatalog.length} vanliga konton finns i startkatalogen. Företagets valda kontoplan kan kompletteras efter behov.
      </p>
      <div className="max-h-[32rem] divide-y divide-black/8 overflow-y-auto rounded-[1.25rem] border border-black/8">
        {results.map((item) => (
          <div key={item.number} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-[var(--hub-accent-strong)]">{item.number}</span>
                <span className="text-sm font-medium text-[var(--hub-text)]">{item.name}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--hub-muted)]">{item.group}</p>
            </div>
            {active.has(item.number) ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Aktivt</span>
            ) : canConfigure ? (
              <form action={activateAccountingAccountAction}>
                <input type="hidden" name="account_number" value={item.number} />
                <SubmitButton>Lägg till</SubmitButton>
              </form>
            ) : (
              <span className="text-xs text-[var(--hub-muted)]">Kräver administratör</span>
            )}
          </div>
        ))}
      </div>
      {!results.length ? <p className="text-sm text-[var(--hub-muted)]">Inga konton matchar sökningen.</p> : null}
      {canConfigure ? (
        <details className="rounded-[1.25rem] border border-black/8 bg-[var(--hub-card-soft)] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--hub-text)]">
            Lägg till ett eget konto
          </summary>
          <form action={createCustomAccountingAccountAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[var(--hub-text)]">
              Kontonummer
              <input name="account_number" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} className={inputClassName} placeholder="Exempel: 5421" required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--hub-text)]">
              Kontonamn
              <input name="account_name" maxLength={120} className={inputClassName} placeholder="Beskriv kontots användning" required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[var(--hub-text)] sm:col-span-2">
              Kontotyp
              <select name="account_kind" className={inputClassName} required defaultValue="expense">
                <option value="asset">Tillgång</option>
                <option value="liability">Skuld</option>
                <option value="equity">Eget kapital</option>
                <option value="income">Intäkt</option>
                <option value="expense">Kostnad</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <SubmitButton>Lägg till eget konto</SubmitButton>
            </div>
          </form>
          <p className="mt-3 text-xs leading-5 text-[var(--hub-muted)]">
            Kontrollera kontonummer och klassificering mot företagets aktuella kontoplan innan kontot används.
          </p>
        </details>
      ) : null}
    </div>
  );
}
