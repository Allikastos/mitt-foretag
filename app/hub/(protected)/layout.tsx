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
  children: React.ReactNode;
}>) {
  const { organization, membership, user } = await requireHubContext();

  return (
    <section className="pb-16 pt-8 md:pb-24 md:pt-10">
      <SectionContainer className="space-y-6">
        <div className="rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,#f3efe4_0%,#fbfaf6_100%)] p-6 shadow-[0_24px_60px_-48px_rgba(0,0,0,0.22)] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#8A6A2F]">
                  Altura Nova Hub
                </p>
                <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[#0B0B0C] md:text-[2.6rem]">
                  {organization.name}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5F5F5F] md:text-base">
                  Inloggad som {user.email ?? "okänd användare"} med rollen{" "}
                  {roleLabel(membership.role)}.
                </p>
              </div>

              <HubNav />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:bg-[#F7F7F5]"
              >
                Till webbplatsen
              </Link>
              <HubSignOutButton />
            </div>
          </div>
        </div>

        {children}
      </SectionContainer>
    </section>
  );
}
