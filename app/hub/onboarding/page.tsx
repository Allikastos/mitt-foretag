import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createOrganizationOnboardingAction } from "@/app/hub/actions";
import { SectionContainer } from "@/components/section-container";
import { inputClassName } from "@/components/hub/ui";
import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export const metadata: Metadata = {
  title: "Hub onboarding",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HubOnboardingPage() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/hub/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/hub/login");
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (membership) {
    redirect("/hub");
  }

  return (
    <section className="pb-20 pt-10 md:pb-24 md:pt-14">
      <SectionContainer>
        <div className="mx-auto max-w-[38rem] rounded-[2.25rem] border border-black/8 bg-white p-8 shadow-[0_30px_70px_-58px_rgba(0,0,0,0.24)] md:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[#C6A15B]">
            Altura Nova Hub
          </p>
          <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#0B0B0C] md:text-4xl">
            Skapa ert företag i hubben
          </h1>
          <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
            För att komma vidare behöver ni skapa ert företag först. Inbjudningar
            till befintliga organisationer kommer i nästa version.
          </p>

          <form action={createOrganizationOnboardingAction} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                Företagsnamn
              </span>
              <input
                name="company_name"
                defaultValue=""
                className={inputClassName}
                placeholder="Exempelbolaget AB"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2.5 block text-sm font-medium text-[#0B0B0C]">
                Organisationsnummer
              </span>
              <input
                name="org_number"
                defaultValue=""
                className={inputClassName}
                placeholder="559123-4567"
              />
            </label>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90"
            >
              Skapa företag och fortsätt
            </button>
          </form>
        </div>
      </SectionContainer>
    </section>
  );
}
