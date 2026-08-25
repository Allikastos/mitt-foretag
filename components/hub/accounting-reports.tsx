import { vatBoxDefinitions, type buildAccountingReports } from "@/src/lib/hub/accounting";
import { HubCard, StatCard, StatusBadge } from "./ui";

type Reports = ReturnType<typeof buildAccountingReports>;

function money(amountMinor: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(
    amountMinor / 100,
  );
}

function ReportRows({ rows }: { rows: Array<{ accountNumber: string; accountName: string; amountMinor: number }> }) {
  if (!rows.length) return <p className="text-sm text-[var(--hub-muted)]">Inga bokförda belopp i perioden.</p>;
  return (
    <div className="divide-y divide-black/8">
      {rows.map((row) => (
        <div key={row.accountNumber} className="grid grid-cols-[4rem_1fr_auto] gap-3 py-2.5 text-sm">
          <span className="font-mono text-[var(--hub-accent-strong)]">{row.accountNumber}</span>
          <span className="text-[var(--hub-text)]">{row.accountName}</span>
          <span className="font-medium text-[var(--hub-text)]">{money(row.amountMinor)}</span>
        </div>
      ))}
    </div>
  );
}

export function AccountingReports({ reports }: { reports: Reports }) {
  const maxSales = Math.max(1, ...reports.sales.map((item) => Math.abs(item.amountMinor)));
  return (
    <section className="space-y-6" aria-labelledby="accounting-reports-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Ekonomirapporter</p>
          <h2 id="accounting-reports-title" className="mt-2 text-2xl font-semibold text-[var(--hub-text)]">Företagets ekonomiska läge</h2>
        </div>
        <StatusBadge tone="warning">Preliminär förhandsversion</StatusBadge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Försäljning" value={money(reports.incomeStatement.incomeMinor)} hint="bokförda intäkter" />
        <StatCard label="Resultat" value={money(reports.incomeStatement.resultMinor)} hint="intäkter minus kostnader" />
        <StatCard label="Likvid förändring" value={money(reports.cashFlow.netChangeMinor)} hint="kassa och bank" />
        <StatCard label="Moms att betala" value={money(reports.vat.payableMinor)} hint="utgående minus ingående" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <HubCard>
          <h3 className="text-lg font-semibold text-[var(--hub-text)]">Försäljning per månad</h3>
          <div className="mt-5 space-y-3">
            {reports.sales.length ? reports.sales.map((item) => (
              <div key={item.month} className="grid grid-cols-[5rem_1fr_auto] items-center gap-3 text-sm">
                <span className="font-mono text-[var(--hub-muted)]">{item.month}</span>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--hub-card-soft)]">
                  <div className="h-full rounded-full bg-[var(--hub-accent-strong)]" style={{ width: `${Math.max(2, Math.abs(item.amountMinor) / maxSales * 100)}%` }} />
                </div>
                <span className="font-medium text-[var(--hub-text)]">{money(item.amountMinor)}</span>
              </div>
            )) : <p className="text-sm text-[var(--hub-muted)]">Ingen bokförd försäljning ännu.</p>}
          </div>
        </HubCard>

        <HubCard>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--hub-text)]">Kassaflöde</h3>
            <StatusBadge>Indirekt klassning</StatusBadge>
          </div>
          <div className="mt-5 space-y-3 text-sm">
            {[
              ["Löpande verksamhet", reports.cashFlow.operating],
              ["Investeringar", reports.cashFlow.investing],
              ["Finansiering", reports.cashFlow.financing],
            ].map(([label, amount]) => (
              <div key={String(label)} className="flex items-center justify-between border-b border-black/8 pb-3">
                <span className="text-[var(--hub-muted)]">{label}</span>
                <span className="font-medium text-[var(--hub-text)]">{money(Number(amount))}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1 font-semibold text-[var(--hub-text)]"><span>Nettoförändring</span><span>{money(reports.cashFlow.netChangeMinor)}</span></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--hub-muted)]">Kassaflödet klassas preliminärt från motkonton. Det ersätter inte en kvalitetssäkrad kassaflödesanalys.</p>
        </HubCard>

        <HubCard>
          <h3 className="text-lg font-semibold text-[var(--hub-text)]">Momsredovisning</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {vatBoxDefinitions.map((definition) => (
              <div key={definition.box} className="rounded-2xl bg-[var(--hub-card-soft)] p-4">
                <p className="font-mono text-xs text-[var(--hub-accent-strong)]">Ruta {definition.box}</p>
                <p className="mt-1 text-sm text-[var(--hub-muted)]">{definition.label}</p>
                <p className="mt-2 font-semibold text-[var(--hub-text)]">{money(reports.vat.boxes[definition.box] ?? 0)}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-[var(--hub-accent-strong)]/20 bg-[var(--hub-card-soft)] p-4 sm:col-span-2">
              <p className="font-mono text-xs text-[var(--hub-accent-strong)]">Ruta 49</p>
              <p className="mt-1 text-sm text-[var(--hub-muted)]">Moms att betala eller få tillbaka</p>
              <p className="mt-2 font-semibold text-[var(--hub-text)]">{money(reports.vat.payableMinor)}</p>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--hub-muted)]">Kontrollera alltid period, momskoder och Skatteverkets aktuella regler innan deklaration lämnas.</p>
        </HubCard>

        <HubCard>
          <h3 className="text-lg font-semibold text-[var(--hub-text)]">Balanskontroll</h3>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--hub-muted)]">Tillgångar</span><strong>{money(reports.balanceSheet.assetsMinor)}</strong></div>
            <div className="flex justify-between"><span className="text-[var(--hub-muted)]">Skulder och eget kapital</span><strong>{money(reports.balanceSheet.liabilitiesAndEquityMinor)}</strong></div>
            <div className="flex justify-between"><span className="text-[var(--hub-muted)]">Beräknat resultat</span><strong>{money(reports.balanceSheet.currentResultMinor)}</strong></div>
            <div className="flex justify-between border-t border-black/8 pt-3"><span className="font-medium text-[var(--hub-text)]">Differens</span><strong>{money(reports.balanceSheet.differenceMinor)}</strong></div>
          </div>
        </HubCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <HubCard>
          <details open>
            <summary className="cursor-pointer text-lg font-semibold text-[var(--hub-text)]">Resultaträkning</summary>
            <div className="mt-5"><p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--hub-muted)]">Intäkter</p><ReportRows rows={reports.incomeStatement.incomeRows} /></div>
            <div className="mt-5"><p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--hub-muted)]">Kostnader</p><ReportRows rows={reports.incomeStatement.expenseRows} /></div>
            <div className="mt-5 flex justify-between border-t border-black/10 pt-4 font-semibold text-[var(--hub-text)]"><span>Periodens resultat</span><span>{money(reports.incomeStatement.resultMinor)}</span></div>
          </details>
        </HubCard>
        <HubCard>
          <details open>
            <summary className="cursor-pointer text-lg font-semibold text-[var(--hub-text)]">Balansräkning</summary>
            <div className="mt-5"><p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--hub-muted)]">Tillgångar</p><ReportRows rows={reports.balanceSheet.assetRows} /></div>
            <div className="mt-5"><p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--hub-muted)]">Eget kapital och skulder</p><ReportRows rows={reports.balanceSheet.liabilityAndEquityRows} /></div>
          </details>
        </HubCard>
      </div>

      <HubCard>
        <details>
          <summary className="cursor-pointer text-lg font-semibold text-[var(--hub-text)]">
            Huvudbok och verifikationsspår
          </summary>
          <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
            Följ varje kontos ingående saldo, rörelser i vald period och utgående saldo tillbaka till bokförd verifikation.
          </p>
          <div className="mt-5 space-y-4">
            {reports.generalLedger.length ? reports.generalLedger.map((account) => (
              <details key={account.number} className="rounded-[1.25rem] border border-black/8 bg-[var(--hub-card-soft)] p-4">
                <summary className="cursor-pointer list-none">
                  <span className="grid gap-2 sm:grid-cols-[4rem_1fr_auto] sm:items-center">
                    <span className="font-mono text-sm text-[var(--hub-accent-strong)]">{account.number}</span>
                    <span className="font-medium text-[var(--hub-text)]">{account.name}</span>
                    <span className="text-sm font-semibold text-[var(--hub-text)]">{money(account.closingMinor)}</span>
                  </span>
                </summary>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-[42rem] w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-[0.08em] text-[var(--hub-muted)]">
                      <tr><th className="pb-2">Datum</th><th className="pb-2">Verifikation</th><th className="pb-2">Beskrivning</th><th className="pb-2 text-right">Förändring</th></tr>
                    </thead>
                    <tbody className="divide-y divide-black/8">
                      <tr><td className="py-2" colSpan={3}>Ingående saldo</td><td className="py-2 text-right font-medium">{money(account.openingMinor)}</td></tr>
                      {account.entries.map((entry, index) => (
                        <tr key={`${entry.journalEntryId}-${entry.accountNumber}-${index}`}>
                          <td className="py-2 font-mono text-xs">{entry.postedOn}</td>
                          <td className="py-2 font-mono text-xs text-[var(--hub-accent-strong)]">{entry.journalLabel ?? "–"}</td>
                          <td className="py-2">{entry.description ?? "Bokförd verifikation"}</td>
                          <td className="py-2 text-right font-medium">{money(entry.amountMinor)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-black/10 font-semibold text-[var(--hub-text)]">
                      <tr><td className="pt-3" colSpan={3}>Utgående saldo</td><td className="pt-3 text-right">{money(account.closingMinor)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              </details>
            )) : <p className="text-sm text-[var(--hub-muted)]">Ingen bokförd huvudbok i vald period.</p>}
          </div>
        </details>
      </HubCard>
    </section>
  );
}
