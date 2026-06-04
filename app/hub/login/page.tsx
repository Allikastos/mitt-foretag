import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HubLoginForm } from "@/components/hub/login-form";
import { SectionContainer } from "@/components/section-container";
import { getLoggedInUser } from "@/src/lib/supabase-server";

export const metadata: Metadata = {
  title: "Hub login",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HubLoginPage() {
  const user = await getLoggedInUser();

  if (user) {
    redirect("/hub");
  }

  return (
    <section className="pb-20 pt-10 md:pb-24 md:pt-14">
      <SectionContainer>
        <div className="mx-auto max-w-[34rem] rounded-[2.25rem] border border-black/8 bg-white p-8 shadow-[0_30px_70px_-58px_rgba(0,0,0,0.24)] md:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
            Altura Nova Hub
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#0B0B0C] md:text-4xl">
            Logga in till företagets arbetsyta
          </h1>
          <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
            Här samlar ni kunder, uppgifter, dokument och fakturautkast på ett
            ställe. Inloggning sker med er Supabase-användare.
          </p>

          <div className="mt-8">
            <HubLoginForm />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
