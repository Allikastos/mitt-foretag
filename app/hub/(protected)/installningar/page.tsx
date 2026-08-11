import { SettingsForm } from "@/components/hub/forms";
import { HubCard, HubShell, StatusBadge } from "@/components/hub/ui";
import {
  emailConnectionStatusLabel,
  emailProviderLabel,
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
            <h2 className="text-lg font-semibold text-[#0B0B0C]">Kommande integrationer</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[#5F5F5F]">
              <p>
                E-postintegrationer, AI-händelser och bokföringsexport är förberedda
                i arkitekturen men inte aktiverade i v1.
              </p>
              <p>
                När nästa steg tas finns redan tabeller och tydliga TODO-spår i
                serverlagret för Gmail/Outlook, PDF-generering, e-postutskick,
                bokföringsexport och AI-assistent.
              </p>
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
