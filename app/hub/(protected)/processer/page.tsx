import { ProcessingJobList } from "@/components/hub/processing-jobs";
import { HubCard, HubShell, StatCard } from "@/components/hub/ui";
import { getProcessingJobOverview } from "@/src/lib/hub-jobs-server";

export default async function HubProcessingJobsPage() {
  const overview = await getProcessingJobOverview();

  return (
    <HubShell
      title="Aktivitetscenter"
      description="Följ längre processer, se vad som behöver granskas och återuppta säkert om något avbryts."
    >
      <section className="overflow-hidden rounded-[1.8rem] bg-[var(--hub-panel)] text-[var(--hub-panel-contrast)] shadow-[0_32px_80px_-54px_rgba(0,0,0,0.65)]">
        <div className="grid gap-8 p-6 md:p-8 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--hub-accent)]">
              Arbetet fortsätter tryggt
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
              Du kan lämna sidan utan att tappa bort en pågående process.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--hub-panel-muted)]">
              Varje process får en tydlig status, begränsade återförsök och en säker
              väg till manuell granskning. Känsligt underlag visas aldrig här.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["01", "Läggs i kö"],
              ["02", "Bearbetas"],
              ["03", "Granskas"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
              >
                <span className="font-mono text-xs text-[var(--hub-accent)]">
                  {number}
                </span>
                <p className="mt-2 text-xs text-[var(--hub-panel-muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!overview.runtimeEnabled ? (
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
          <p className="font-semibold">Förhandsläge, inga processer startas</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Aktivitetscentret är färdigbyggt lokalt. Köbearbetning förblir
            avstängd tills SQL-kontraktet har granskats och säkerhetsflaggorna
            aktiverats i en kontrollerad miljö.
          </p>
        </div>
      ) : !overview.databaseReady ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-red-950">
          <p className="font-semibold">Processdatabasen är inte installerad</p>
          <p className="mt-1 text-sm leading-6 text-red-800">
            Flaggorna är aktiva men databasmigreringen för fas E saknas. Inga
            processer kan därför skapas eller ändras.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Väntar" value={overview.stats.queued} hint="i kö" />
        <StatCard
          label="Pågår"
          value={overview.stats.processing}
          hint="bearbetas"
        />
        <StatCard
          label="Granskning"
          value={overview.stats.needsReview}
          hint="kräver beslut"
        />
        <StatCard
          label="Problem"
          value={overview.stats.failed}
          hint="kan återförsökas"
        />
        <StatCard
          label="Klara"
          value={overview.stats.succeeded}
          hint="slutförda"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <HubCard>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
                Senaste processer
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">
                Status och åtgärder
              </h2>
            </div>
            <p className="text-sm text-[var(--hub-muted)]">
              Visar högst 50 processer
            </p>
          </div>
          <ProcessingJobList
            jobs={overview.jobs}
            canCancel={overview.runtimeEnabled && overview.permissions.canCancel}
            canRetry={overview.runtimeEnabled && overview.permissions.canRetry}
          />
        </HubCard>

        <div className="space-y-6">
          <HubCard>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
              Säker återhämtning
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--hub-text)]">
              Inget tyst dubbelarbete
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--hub-muted)]">
              Identiska anrop återanvänder samma process. Ett tidsbegränsat
              arbetslås gör att avbrutet arbete kan tas över, samtidigt som bara
              arbetaren med det aktuella låset får spara resultatet.
            </p>
          </HubCard>
          <HubCard>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
              Din åtkomst
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--hub-muted)]">
              {overview.permissions.canRetry
                ? "Du kan läsa, avbryta och återförsöka processer för företaget."
                : "Du kan följa företagets processer. Ägare eller admin hanterar avbrott och återförsök."}
            </p>
          </HubCard>
        </div>
      </div>
    </HubShell>
  );
}
