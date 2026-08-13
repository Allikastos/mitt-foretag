import { AccountingSetupForm, DraftWorkflowActions } from "@/components/hub/accounting-forms";
import { AccountingPreview } from "@/components/hub/accounting-preview";
import { EmptyState, HubCard, HubShell, StatCard, StatusBadge } from "@/components/hub/ui";
import {
  accountingEventLabel,
  accountingStatusLabel,
  accountingStatusTone,
} from "@/src/lib/hub/accounting";
import { getAccountingOverview } from "@/src/lib/hub-accounting-server";

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

export default async function HubAccountingPage() {
  const overview = await getAccountingOverview();
  const isConfigured = Boolean(overview.settings?.accounting_enabled);
  const canPersist =
    overview.runtimeEnabled &&
    overview.databaseReady &&
    isConfigured &&
    overview.permissions.canCreateDraft;
  const eventsById = new Map(overview.events.map((event) => [event.id, event]));

  return (
    <HubShell
      title="Bokföring – förhandsversion"
      description="Förhandsgranska enkla svenska affärshändelser. Funktionen är inte redo för faktisk bokföring."
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
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--hub-accent)]">Avgränsad första version</p>
            <p className="mt-3 text-lg font-semibold">Enskild firma</p>
            <p className="mt-1 text-sm leading-6 text-[var(--hub-panel-muted)]">Endast enskild firma, kontantmetoden, kalenderår och SEK. Lön, lån, EU-handel, periodisering och bokslut stoppas.</p>
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
        <AccountingPreview organizationId={overview.organization.id} canPersist={canPersist} />
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
