import { HubCard, HubShell, StatCard, StatusBadge } from "@/components/hub/ui";
import { getIntegrationOverview } from "@/src/lib/hub-integrations-server";
import {
  integrationGroupLabel,
  integrationReadinessLabel,
  type IntegrationGroup,
  type IntegrationReadiness,
} from "@/src/lib/hub/integrations/catalog";

const groups: IntegrationGroup[] = ["foundation", "business", "operations"];

function statusTone(
  readiness: IntegrationReadiness,
): "neutral" | "success" | "warning" | "danger" {
  switch (readiness) {
    case "active":
      return "success";
    case "ready_for_test":
    case "approval_required":
    case "configuration_required":
      return "warning";
    case "attention_required":
      return "danger";
    case "code_ready":
      return "neutral";
  }
}

export default async function HubIntegrationsPage() {
  const overview = await getIntegrationOverview();

  return (
    <HubShell
      title="Integrationscenter"
      description="Se vad hubben redan använder, vad som är tekniskt förberett och vilka beslut som krävs innan externa tjänster kopplas in. Inget aktiveras eller köps från den här sidan."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Aktiva grunder"
          value={overview.summary.active}
          hint="Redan i bruk"
        />
        <StatCard
          label="Kod förberedd"
          value={overview.summary.prepared}
          hint="Leverantör inte vald"
        />
        <StatCard
          label="Saknar konfiguration"
          value={overview.summary.needsConfiguration}
          hint="Kräver ett ägarbeslut"
        />
        <StatCard
          label="Behöver åtgärdas"
          value={overview.summary.needsAttention}
          hint="Inga dolda fel"
        />
      </div>

      {!overview.canManage ? (
        <HubCard className="border-[color:var(--hub-accent)]/30 bg-[var(--hub-card-soft)]">
          <p className="text-sm font-semibold text-[var(--hub-text)]">
            Företagets ägare eller admin hanterar integrationer
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--hub-muted)]">
            Du kan se vilka funktioner som finns, men leverantörsval,
            kostnadsgodkännande och aktivering styrs centralt för hela företaget.
          </p>
        </HubCard>
      ) : (
        <HubCard className="overflow-hidden bg-[linear-gradient(120deg,var(--hub-panel),color-mix(in_srgb,var(--hub-panel)_80%,var(--hub-accent)))] text-[var(--hub-panel-contrast)]">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--hub-accent)]">
            Säker aktiveringsordning
          </p>
          <p className="mt-3 max-w-4xl text-base leading-7 text-[var(--hub-panel-muted)]">
            Börja med behov och kostnad. Godkänn därefter datadelning och
            behörigheter, lägg hemligheter endast i servermiljön, testa i en
            separat miljö och slå på funktionsflaggan sist.
          </p>
        </HubCard>
      )}

      {groups.map((group) => {
        const integrations = overview.integrations.filter(
          (integration) => integration.group === group,
        );

        return (
          <section key={group} className="space-y-4">
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
                  {integrationGroupLabel(group)}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[var(--hub-text)]">
                  {group === "foundation"
                    ? "Det hubben redan vilar på"
                    : group === "business"
                      ? "Kopplingar som förenklar arbetet"
                      : "Skydd, stabilitet och skala"}
                </h2>
              </div>
              <span className="hidden text-sm text-[var(--hub-muted)] sm:block">
                {integrations.length} delar
              </span>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {integrations.map((integration) => (
                <HubCard
                  key={integration.id}
                  className="relative overflow-hidden"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-[var(--hub-accent)]" />
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-xl">
                      <h3 className="text-lg font-semibold text-[var(--hub-text)]">
                        {integration.name}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--hub-muted)]">
                        {integration.description}
                      </p>
                    </div>
                    <StatusBadge tone={statusTone(integration.readiness)}>
                      {integrationReadinessLabel(integration.readiness)}
                    </StatusBadge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.15rem] bg-[var(--hub-card-soft)] p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--hub-subtle)]">
                        Data som kan delas
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--hub-text)]">
                        {integration.dataShared}
                      </p>
                    </div>
                    <div className="rounded-[1.15rem] bg-[var(--hub-card-soft)] p-4">
                      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--hub-subtle)]">
                        Kostnadsbild
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--hub-text)]">
                        {integration.cost}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-black/8 pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--hub-accent-strong)]">
                      Nästa säkra steg
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                      {integration.nextStep}
                    </p>
                    {integration.note ? (
                      <p className="mt-3 rounded-xl bg-[var(--hub-chip)] px-3 py-2 text-xs leading-5 text-[var(--hub-muted)]">
                        {integration.note}
                      </p>
                    ) : null}
                  </div>

                  {overview.canManage ? (
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--hub-subtle)]">
                      <span>
                        Leverantör: {integration.provider || "Inte vald"}
                      </span>
                      <span>Kontrakt: {integration.providerContract}</span>
                      {integration.featureFlagName ? (
                        <span>
                          Flagga: <code>{integration.featureFlagName}</code>
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </HubCard>
              ))}
            </div>
          </section>
        );
      })}
    </HubShell>
  );
}
