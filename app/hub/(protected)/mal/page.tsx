import {
  BusinessGoalForm,
  DeleteBusinessGoalForm,
} from "@/components/hub/forms";
import { EmptyState, HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  formatDate,
  goalProgress,
  goalStatusLabel,
} from "@/src/lib/hub";
import { getBusinessGoals, requireHubContext } from "@/src/lib/hub-server";

export default async function HubGoalsPage() {
  const [goals, { membership }] = await Promise.all([
    getBusinessGoals(),
    requireHubContext(),
  ]);

  return (
    <HubShell
      title="Mål"
      description="Samla konkreta sälj-, leverans- och verksamhetsmål och följ utvecklingen över tid."
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <HubCard>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--hub-accent-strong)]">
              Verksamhetsmål
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--hub-text)]">
              Det viktigaste att nå
            </h2>
          </div>
          <div className="mt-5 space-y-4">
            {goals.length ? goals.map((goal) => {
              const progress = goalProgress(goal);
              return (
                <article key={goal.id} className="rounded-[1.35rem] border border-black/8 bg-[var(--hub-card-soft)] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--hub-text)]">{goal.title}</h3>
                      <p className="mt-1 text-sm text-[var(--hub-muted)]">
                        {goal.current_value} av {goal.target_value} {goal.unit}
                        {goal.due_date ? ` · senast ${formatDate(goal.due_date)}` : ""}
                      </p>
                    </div>
                    <StatusBadge tone={goal.status === "completed" ? "success" : goal.status === "paused" ? "warning" : "neutral"}>
                      {goalStatusLabel(goal.status)}
                    </StatusBadge>
                  </div>
                  {goal.description ? <p className="mt-3 text-sm leading-6 text-[var(--hub-muted)]">{goal.description}</p> : null}
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/8" role="progressbar" aria-label={goal.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                    <div className="h-full rounded-full bg-[var(--hub-accent-strong)]" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-right text-xs font-medium text-[var(--hub-accent-strong)]">{progress}%</p>
                  {membership.role !== "viewer" ? (
                    <details className="mt-4 border-t border-black/8 pt-3">
                      <summary className="cursor-pointer text-sm font-medium text-[var(--hub-text)]">Uppdatera mål</summary>
                      <div className="mt-3 space-y-3">
                        <BusinessGoalForm goal={goal} />
                        <DeleteBusinessGoalForm goalId={goal.id} />
                      </div>
                    </details>
                  ) : null}
                </article>
              );
            }) : (
              <EmptyState title="Skapa ditt första mål" description="Exempel: kontakta 25 prospekt, vinna tre webbprojekt eller fakturera ett visst belopp." />
            )}
          </div>
        </HubCard>

        {membership.role === "viewer" ? (
          <HubCard>
            <p className="font-semibold text-[var(--hub-text)]">Läsbehörighet</p>
            <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">Du kan följa målen men inte ändra dem.</p>
          </HubCard>
        ) : <BusinessGoalForm />}
      </div>
    </HubShell>
  );
}
