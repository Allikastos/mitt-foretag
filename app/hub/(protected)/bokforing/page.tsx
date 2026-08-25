import { AccountCatalog } from "@/components/hub/account-catalog";
import { AccountingSetupForm, DraftWorkflowActions } from "@/components/hub/accounting-forms";
import { AccountingPreview } from "@/components/hub/accounting-preview";
import { AccountingPeriodControls } from "@/components/hub/accounting-period-controls";
import { AccountingReports } from "@/components/hub/accounting-reports";
import { ManualJournalForm } from "@/components/hub/manual-journal-form";
import { EmptyState, HubCard, HubShell, StatCard, StatusBadge } from "@/components/hub/ui";
import {
  accountingEventLabel,
  accountingStatusLabel,
  accountingStatusTone,
  buildAccountingReports,
} from "@/src/lib/hub/accounting";
import { getAccountingOverview } from "@/src/lib/hub-accounting-server";
import { createCorrectionDraftAction } from "@/app/hub/accounting-actions";

function formatMinor(amountMinor: number | null) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format((amountMinor ?? 0) / 100);
}

function descriptionFromFacts(facts: unknown) {
  if (
    facts &&
    typeof facts === "object" &&
    "description" in facts &&
    typeof facts.description === "string"
  ) {
    return facts.description;
  }

  return "Ingen beskrivning";
}

export default async function HubAccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const filters = await searchParams;
  const from = /^\d{4}-\d{2}-\d{2}$/.test(filters.from ?? "") ? filters.from : null;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(filters.to ?? "") ? filters.to : null;
  const overview = await getAccountingOverview();
  const isConfigured = Boolean(overview.settings?.accounting_enabled);
  const canPersist =
    overview.runtimeEnabled &&
    overview.databaseReady &&
    isConfigured &&
    overview.permissions.canCreateDraft;
  const eventsById = new Map(overview.events.map((event) => [event.id, event]));
  const reportEntriesById = new Map(
    overview.reportEntries.map((entry) => [entry.id, entry]),
  );
  const reportAccounts = overview.accounts.map((account) => ({
    number: account.account_number,
    name: account.name,
    kind: account.kind,
  }));
  const accountingReports = buildAccountingReports({
    accounts: reportAccounts,
    lines: overview.journalLines.flatMap((line) => {
      const entry = reportEntriesById.get(line.journal_entry_id);
      return entry ? [{
        journalEntryId: line.journal_entry_id,
        journalLabel: `${entry.journal_series}${entry.journal_number}`,
        description: entry.description,
        postedOn: entry.posted_on,
        accountNumber: line.account_number,
        debitMinor: line.debit_minor,
        creditMinor: line.credit_minor,
      }] : [];
    }),
    from,
    to,
  });
  const manualAccounts = overview.accounts.map((account) => ({
    number: account.account_number,
    name: account.name,
    kind: account.kind,
    reviewRequired: account.review_required,
  }));
  const exportQuery = new URLSearchParams();
  if (from) exportQuery.set("from", from);
  if (to) exportQuery.set("to", to);

  return (
    <HubShell
      title="Bokföring – förhandsversion"
      description="Skapa manuella verifikationer, följ kontoplanen och granska företagets ekonomiska rapporter. Funktionen är fortfarande en förhandsversion."
    >
      <section className="overflow-hidden rounded-[1.8rem] bg-[var(--hub-panel)] text-[var(--hub-panel-contrast)] shadow-[0_32px_80px_-54px_rgba(0,0,0,0.65)]">
        <div className="grid gap-7 p-6 md:p-8 xl:grid-cols-[1.35fr_0.65fr] xl:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--hub-accent)]">
              Bokföringsstudio – förhandsversion
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
              Från händelse till verifierad verifikation, utan dolda steg.
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Beskriv vad som hänt"],
                ["02", "Granska konteringen"],
                ["03", "Godkänn och bokför"],
              ].map(([number, label]) => (
                <div key={number} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <span className="font-mono text-xs text-[var(--hub-accent)]">{number}</span>
                  <p className="mt-2 text-sm leading-5 text-[var(--hub-panel-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--hub-accent)]">Automatisk hjälp – avgränsad</p>
            <p className="mt-3 text-lg font-semibold">Sju säkra standardregler</p>
            <p className="mt-1 text-sm leading-6 text-[var(--hub-panel-muted)]">De automatiska reglerna stöder ännu bara enskild firma, kontantmetoden, kalenderår och SEK. Manuell bokföring och egna konton finns separat nedan.</p>
          </div>
        </div>
      </section>

      {!overview.runtimeEnabled ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
          <p className="font-semibold">Förhandsläge, inget sparas</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Du kan prova alla konteringsregler lokalt. Databassparande, godkännande och bokföring är avstängt tills SQL-förslaget är granskat och båda säkerhetsflaggorna aktiveras.
          </p>
        </div>
      ) : !overview.databaseReady ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-red-950">
          <p className="font-semibold">Bokföringsdatabasen är inte installerad</p>
          <p className="mt-1 text-sm leading-6 text-red-800">Funktionsflaggorna är aktiva, men de granskade databasmigreringarna saknas. Sparande förblir blockerat.</p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Att granska" value={overview.stats.needsReview} hint="utkast" />
        <StatCard label="Godkända" value={overview.stats.readyToPost} hint="redo att bokföra" />
        <StatCard label="Bokförda" value={overview.stats.posted} hint="verifikationer" />
        <StatCard label="Öppna" value={overview.stats.openPeriods} hint="perioder" />
      </div>

      {overview.runtimeEnabled && overview.databaseReady && !isConfigured ? (
        <HubCard className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--hub-accent-strong)]">Grundinställning</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">Skapa ett avgränsat räkenskapsår</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--hub-muted)]">Den här versionen accepterar bara kalenderår för enskild firma, kontantmetoden och SEK.</p>
          </div>
          {overview.permissions.canConfigure ? (
            <AccountingSetupForm fiscalYear={new Date().getFullYear()} />
          ) : (
            <p className="rounded-2xl bg-[var(--hub-card-soft)] p-4 text-sm leading-6 text-[var(--hub-muted)]">En ägare eller administratör behöver skapa bokföringsgrunden.</p>
          )}
        </HubCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <AccountingPreview
          organizationId={overview.organization.id}
          canPersist={canPersist}
          smartInputEnabled={overview.featureFlags.smartAccountingInput}
        />
        <div className="space-y-6">
          <HubCard>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Din åtkomst</p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--hub-text)]">{overview.role === "owner" ? "Ägare" : overview.role === "admin" ? "Administratör" : overview.role === "member" ? "Medarbetare" : "Läsbehörighet"}</h2>
            <div className="mt-4 space-y-2 text-sm text-[var(--hub-muted)]">
              <p>{overview.permissions.canCreateDraft ? "Du kan skapa konteringsutkast." : "Du kan inte skapa konteringsutkast."}</p>
              <p>{overview.permissions.canApproveDraft ? "Du kan godkänna och bokföra efter granskning." : "Godkännande kräver ägare eller admin."}</p>
            </div>
          </HubCard>
          <HubCard>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Säkerhetsprincip</p>
            <p className="mt-3 text-sm leading-6 text-[var(--hub-muted)]">Förhandsvisning skapar aldrig en verifikation. Ett sparat förslag måste först godkännas, och bokförda rader kan inte ändras i efterhand.</p>
          </HubCard>
        </div>
      </div>

      <HubCard>
        <div className="grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Manuell bokföring</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">Skapa fri verifikation</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--hub-muted)]">Välj själv konton, debet, kredit och belopp. Hubben kontrollerar att verifikationen balanserar men bedömer inte om ditt kontoval är skattemässigt korrekt.</p>
          </div>
          <ManualJournalForm organizationId={overview.organization.id} accounts={manualAccounts} canPersist={canPersist} />
        </div>
      </HubCard>

      {overview.fiscalYears[0] ? (
        <HubCard>
          <details>
            <summary className="cursor-pointer text-xl font-semibold text-[var(--hub-text)]">Ingående balans</summary>
            <div className="mt-5 grid gap-6 xl:grid-cols-[0.65fr_1.35fr]">
              <div>
                <p className="text-sm leading-6 text-[var(--hub-muted)]">Registrera saldon som företaget hade när räkenskapsåret började. Datumet låses till räkenskapsårets första dag och underlaget går alltid via granskning.</p>
                <p className="mt-3 text-xs leading-5 text-[var(--hub-muted)]">Använd en balanserad motpost för eget kapital eller överförda balanser. Endast en ingående balans tillåts per räkenskapsår.</p>
              </div>
              <ManualJournalForm organizationId={overview.organization.id} accounts={manualAccounts} canPersist={canPersist} entryType="opening_balance" defaultDate={overview.fiscalYears[0].starts_on} />
            </div>
          </details>
        </HubCard>
      ) : null}

      <HubCard>
        <details>
          <summary className="cursor-pointer text-xl font-semibold text-[var(--hub-text)]">Kontoplan och kontokatalog</summary>
          <div className="mt-5 grid gap-6 xl:grid-cols-[0.55fr_1.45fr]">
            <div>
              <p className="text-sm leading-6 text-[var(--hub-muted)]">Aktivera de konton företaget behöver. Katalogen täcker vanliga tillgångar, skulder, eget kapital, intäkter, kostnader, moms, personal och finansiella poster.</p>
              <p className="mt-3 text-xs leading-5 text-[var(--hub-muted)]">Katalogen är en praktisk startpunkt och inte en ersättning för den officiella årliga BAS-kontoplanen eller professionell rådgivning.</p>
            </div>
            <AccountCatalog activeNumbers={overview.accounts.map((account) => account.account_number)} canConfigure={canPersist && overview.permissions.canConfigure} />
          </div>
        </details>
      </HubCard>

      <HubCard>
        <form method="get" action="/hub/bokforing" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="grid gap-2 text-sm font-medium text-[var(--hub-text)]">Från datum<input type="date" name="from" defaultValue={from ?? ""} className="min-h-12 rounded-2xl border border-black/10 bg-[var(--hub-input)] px-4" /></label>
          <label className="grid gap-2 text-sm font-medium text-[var(--hub-text)]">Till datum<input type="date" name="to" defaultValue={to ?? ""} className="min-h-12 rounded-2xl border border-black/10 bg-[var(--hub-input)] px-4" /></label>
          <button type="submit" className="min-h-12 rounded-2xl bg-[var(--hub-panel)] px-5 text-sm font-medium text-[var(--hub-panel-contrast)]">Uppdatera rapporter</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-3 border-t border-black/8 pt-4">
          <a href={`/hub/bokforing/export?format=csv&${exportQuery}`} className="rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium text-[var(--hub-text)]">Ladda ner CSV</a>
          <a href={`/hub/bokforing/export?format=sie&${exportQuery}`} className="rounded-2xl border border-black/10 px-4 py-2.5 text-sm font-medium text-[var(--hub-text)]">Ladda ner preliminär SIE4i</a>
          <p className="self-center text-xs text-[var(--hub-muted)]">Exporten följer samma datumfilter som rapporterna.</p>
        </div>
      </HubCard>

      <AccountingReports reports={accountingReports} />

      <HubCard>
        <details>
          <summary className="cursor-pointer text-xl font-semibold text-[var(--hub-text)]">Perioder och låsning</summary>
          <div className="mt-5">
            <p className="mb-4 max-w-3xl text-sm leading-6 text-[var(--hub-muted)]">Lås först när periodens underlag är granskat. Åtgärden är medvetet enkelriktad i förhandsversionen för att skydda bokföringen mot efterhandsändringar.</p>
            <AccountingPeriodControls periods={overview.periods} canConfigure={overview.runtimeEnabled && overview.permissions.canConfigure} />
          </div>
        </details>
      </HubCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <HubCard>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Arbetskö</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">Konteringsutkast</h2>
            </div>
            <p className="text-sm text-[var(--hub-muted)]">Senaste {overview.drafts.length}</p>
          </div>
          <div className="mt-5 space-y-3">
            {overview.drafts.length ? overview.drafts.map((draft) => {
              const event = eventsById.get(draft.business_event_id);
              return (
                <article key={draft.id} className="rounded-[1.3rem] border border-black/8 bg-[var(--hub-card-soft)] p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[var(--hub-text)]">{event ? accountingEventLabel(event.event_type) : "Konteringsutkast"}</p>
                        <StatusBadge tone={accountingStatusTone(draft.status)}>{accountingStatusLabel(draft.status)}</StatusBadge>
                      </div>
                      <p className="mt-2 text-sm text-[var(--hub-muted)]">{event ? `${descriptionFromFacts(event.facts)} · ${formatMinor(event.amount_minor)}` : draft.explanation ?? "Underlag saknas"}</p>
                    </div>
                    <DraftWorkflowActions draftId={draft.id} status={draft.status} canApprove={overview.permissions.canApproveDraft} canPost={overview.permissions.canPostJournal} />
                  </div>
                </article>
              );
            }) : (
              <EmptyState title="Inga utkast ännu" description="Förhandsvisa en händelse ovan. När databasen senare aktiveras kan behöriga användare spara den för granskning." />
            )}
          </div>
        </HubCard>

        <HubCard>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">Verifikationsserie A</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">Senast bokfört</h2>
          <div className="mt-5 space-y-3">
            {overview.journalEntries.length ? overview.journalEntries.map((entry) => (
              <div key={entry.id} className="rounded-[1.2rem] border border-black/8 bg-[var(--hub-card-soft)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm font-semibold text-[var(--hub-accent-strong)]">{entry.journal_series}{entry.journal_number}</p>
                  <StatusBadge tone="success">Bokförd</StatusBadge>
                </div>
                <p className="mt-2 text-sm font-medium text-[var(--hub-text)]">{entry.description}</p>
                <p className="mt-1 text-xs text-[var(--hub-muted)]">{entry.posted_on}</p>
                {overview.permissions.canConfigure ? (
                  <details className="mt-3 border-t border-black/8 pt-3">
                    <summary className="cursor-pointer text-xs font-medium text-[var(--hub-accent-strong)]">Skapa rättelseutkast</summary>
                    <form action={createCorrectionDraftAction} className="mt-3 grid gap-3">
                      <input type="hidden" name="journal_entry_id" value={entry.id} />
                      <label className="grid gap-1 text-xs text-[var(--hub-muted)]">Rättelsedatum<input type="date" name="happened_on" className="min-h-11 rounded-xl border border-black/10 bg-[var(--hub-input)] px-3" required /></label>
                      <label className="grid gap-1 text-xs text-[var(--hub-muted)]">Anledning<input name="reason" maxLength={500} className="min-h-11 rounded-xl border border-black/10 bg-[var(--hub-input)] px-3" required /></label>
                      <button type="submit" className="min-h-11 rounded-xl border border-black/10 px-3 text-sm font-medium text-[var(--hub-text)]">Skapa rättelse</button>
                    </form>
                  </details>
                ) : null}
              </div>
            )) : (
              <p className="rounded-[1.2rem] bg-[var(--hub-card-soft)] p-4 text-sm leading-6 text-[var(--hub-muted)]">Inga verifikationer har bokförts. Förhandsläget påverkar inte denna lista.</p>
            )}
          </div>
        </HubCard>
      </div>
    </HubShell>
  );
}
