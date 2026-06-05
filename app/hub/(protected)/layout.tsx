import type { ReactNode } from "react";
import { SITE_CONFIG } from "@/config/site";
import Link from "next/link";
import { HubNav } from "@/components/hub/nav";
import { HubSignOutButton } from "@/components/hub/sign-out-button";
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
    <section className="py-4 md:py-6">
      <SectionContainer className="max-w-[1440px]">
        <div className="flex flex-col gap-4 xl:flex-row">
          <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:w-[18.5rem] xl:self-start">
            <div className="flex h-full flex-col rounded-[2rem] border border-black/8 bg-[#111111] p-5 text-white shadow-[0_30px_80px_-52px_rgba(0,0,0,0.55)] md:p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C6A15B]">
                  Altura Nova Hub
                </p>
                <h1 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.045em] text-white">
                  {organization.name}
                </h1>
                <p className="mt-4 text-sm leading-6 text-white/68">
                  Inloggad som {user.email ?? "okänd användare"} med rollen{" "}
                  {roleLabel(membership.role)}.
                </p>
              </div>

              <div className="mt-8 flex-1">
                <HubNav />
              </div>

              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                  Snabblankar
                </p>
                <div className="mt-4 space-y-1.5">
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="block text-sm text-white/72 transition hover:text-white"
                  >
                    Support
                  </a>
                  <Link
                    href="/"
                    className="block text-sm text-white/72 transition hover:text-white"
                  >
                    Till Altura Nova
                  </Link>
                  <HubSignOutButton compact />
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </SectionContainer>
    </section>
  );
}
