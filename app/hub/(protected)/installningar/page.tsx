import { SettingsForm } from "@/components/hub/forms";
import {
  HubCard,
  HubShell,
  SecondaryLink,
  StatusBadge,
} from "@/components/hub/ui";
import {
  billingPlanLabel,
  billingStatusLabel,
  employeeCustomerScopeLabel,
  emailConnectionStatusLabel,
  emailProviderLabel,
  hubThemeLabel,
  roleLabel,
} from "@/src/lib/hub";
import { getSettingsData, requireHubContext } from "@/src/lib/hub-server";

export default async function HubSettingsPage() {
  const [{ membership }, settings] = await Promise.all([
    requireHubContext(),
    getSettingsData(),
  ]);

  return (
    <HubShell
      title="Inställningar"
      description="Hantera företagsuppgifter, fakturainställningar och förberedelser för framtida integrationer."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <SettingsForm organization={settings.organization} />

          <HubCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">
                Företagsstruktur
              </h2>
              <StatusBadge>{roleLabel(membership.role)}</StatusBadge>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.2rem] bg-[#FBFBF9] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                  Tema
                </p>
                <p className="mt-2 font-medium text-[#0B0B0C]">
                  {hubThemeLabel(settings.organization.hub_theme)}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-[#FBFBF9] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                  Kundåtkomst
                </p>
                <p className="mt-2 font-medium text-[#0B0B0C]">
                  {employeeCustomerScopeLabel(
                    settings.organization.employee_customer_scope,
                  )}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5F5F5F]">
              Ägare och admin kan alltid se hela företagets hubb. Anställda kan
              antingen se alla företagskunder eller bara kunder de själva skapat
              eller ansvarar för, beroende på valet ovan.
            </p>
          </HubCard>

          <HubCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Abonnemang</h2>
              <StatusBadge
                tone={
                  settings.organization.billing_status === "active"
                    ? "success"
                    : settings.organization.billing_status === "past_due" ||
                        settings.organization.billing_status === "unpaid"
                      ? "danger"
                      : "warning"
                }
              >
                {billingStatusLabel(settings.organization.billing_status)}
              </StatusBadge>
            </div>
            <div className="mt-5 rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A8A8A]">
                Nuvarande plan
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#0B0B0C]">
                {billingPlanLabel(settings.organization.billing_plan)}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#5F5F5F]">
                Rekommenderad betalningslösning är Stripe Checkout för
                månadsabonnemang, med webhook som uppdaterar organisationens
                abonnemangsstatus när betalning lyckas, misslyckas eller sägs upp.
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5F5F5F]">
              Betalknappar aktiveras när Stripe-produkt, pris-ID och
              webhook-secret finns i miljövariablerna. Datamodellen är förberedd
              med Stripe kund-ID och abonnemangs-ID.
            </p>
          </HubCard>

          <HubCard>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">Medlemmar</h2>
              <StatusBadge>{roleLabel(membership.role)}</StatusBadge>
            </div>
            <div className="mt-5 space-y-3">
              {settings.members.map((member) => (
                <div key={member.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                  <p className="font-medium text-[#0B0B0C]">
                    {member.profiles?.full_name || member.profiles?.email || "Användare"}
                  </p>
                  <p className="mt-1 text-sm text-[#6B6B6B]">
                    {member.profiles?.email || "Ingen e-post"} • {roleLabel(member.role)}
                  </p>
                </div>
              ))}
            </div>
          </HubCard>
        </div>

        <div className="space-y-6">
          <HubCard>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--hub-accent-strong)]">
                  Drift och kopplingar
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--hub-text)]">
                  Integrationscenter
                </h2>
              </div>
              <StatusBadge>Lokalt förberett</StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--hub-muted)]">
              Se vilka externa tjänster som redan används, vilken kod som är
              förberedd och vilka kostnads- och säkerhetsbeslut som återstår.
              Inget aktiveras automatiskt.
            </p>
            <div className="mt-5">
              <SecondaryLink href="/hub/integrationer">
                Öppna integrationscenter
              </SecondaryLink>
            </div>
          </HubCard>

          <HubCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#0B0B0C]">
                Uppföljningspåminnelser
              </h2>
              <StatusBadge
                tone={
                  settings.organization.follow_up_email_alerts_enabled
                    ? "warning"
                    : "neutral"
                }
              >
                {settings.organization.follow_up_email_alerts_enabled
                  ? "Förberedd"
                  : "Avstängd"}
              </StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5F5F5F]">
              Digest skickas senare till{" "}
              {settings.organization.follow_up_alert_email ||
                settings.organization.email ||
                "vald e-postadress"}{" "}
              när utskicksmotorn kopplas på. Tills dess används inställningen
              för att visa rätt uppföljningsläge i hubben.
            </p>
          </HubCard>

          <HubCard>
            <h2 className="text-lg font-semibold text-[#0B0B0C]">E-postkopplingar</h2>
            <div className="mt-5 space-y-3">
              {settings.emailConnections.length ? (
                settings.emailConnections.map((connection) => (
                  <div key={connection.id} className="rounded-[1.25rem] border border-black/8 bg-[#FBFBF9] p-4">
                    <p className="font-medium text-[#0B0B0C]">
                      {emailProviderLabel(connection.provider)}
                    </p>
                    <p className="mt-1 text-sm text-[#6B6B6B]">
                      {connection.email_address || "Ingen adress kopplad"} •{" "}
                      {emailConnectionStatusLabel(connection.status)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#6B6B6B]">
                  Inga e-postkopplingar ännu. Detta aktiveras i en senare version.
                </p>
              )}
            </div>
          </HubCard>
        </div>
      </div>
    </HubShell>
  );
}
