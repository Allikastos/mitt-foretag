import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SITE_CONFIG } from "@/config/site";
import { AdminLoginForm } from "@/components/admin-login-form";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { getLoggedInUser } from "@/src/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata(
    "Admin login",
    `Logga in till ${SITE_CONFIG.name}s admin för att hantera blogginlägg.`
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const user = await getLoggedInUser();

  if (user) {
    redirect("/admin");
  }

  return (
    <section className="pb-20 pt-10 md:pb-24 md:pt-14">
      <SectionContainer>
        <div className="mx-auto max-w-[34rem] rounded-[2.25rem] border border-black/8 bg-white p-8 shadow-[0_30px_70px_-58px_rgba(0,0,0,0.24)] md:p-10">
          <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
            Admin
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#0B0B0C] md:text-4xl">
            Logga in för att hantera bloggen
          </h1>
          <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
            Använd din Supabase-användare med e-post och lösenord. När
            inloggningen är aktiv skickas du vidare till adminpanelen.
          </p>

          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
