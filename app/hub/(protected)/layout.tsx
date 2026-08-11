import type { ReactNode } from "react";
import { SITE_CONFIG } from "@/config/site";
import { HubAppShell } from "@/components/hub/app-shell";
import { SectionContainer } from "@/components/section-container";
import { roleLabel } from "@/src/lib/hub";
import { requireHubContext } from "@/src/lib/hub-server";

export const dynamic = "force-dynamic";

export default async function HubProtectedLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { organization, membership, user } = await requireHubContext();

  return (
    <section
      data-hub-theme={organization.hub_theme}
      className="min-h-screen bg-[var(--hub-page-bg)] py-4 text-[var(--hub-text)] md:py-6"
    >
      <SectionContainer className="max-w-[1440px]">
        <HubAppShell
          organizationName={organization.name}
          userEmail={user.email ?? "okänd användare"}
          membershipRoleLabel={roleLabel(membership.role)}
          supportEmail={SITE_CONFIG.contact.email}
        >
          {children}
        </HubAppShell>
      </SectionContainer>
    </section>
  );
}
