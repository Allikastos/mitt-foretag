import { CTABlock } from "@/components/cta-block";
import { SITE_CONFIG } from "@/config/site";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { values, workSteps } from "@/lib/site";

export const metadata = createMetadata(
  `Om ${SITE_CONFIG.name}`,
  `Lär känna ${SITE_CONFIG.name}, varför verksamheten finns och hur samarbetet är utformat för företag som vill ha tydligare ekonomisk struktur och bättre beslutsstöd.`,
  { pathname: "/om" }
);

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="Om"
        title={`${SITE_CONFIG.name} finns för företag som vill göra ekonomin mer användbar i vardagen.`}
        description="Målet är inte bara korrekt redovisning, utan ett arbetssätt som ger tydligare uppföljning, bättre beslutsunderlag och större trygghet i den ekonomiska styrningen."
      />

      <section className="pb-8 pt-8 md:pb-12 md:pt-10">
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
            <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                Varför {SITE_CONFIG.name} finns
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Många företag har tillgång till siffror, men inte alltid till den
                tydlighet som krävs för att använda dem i vardagen. {SITE_CONFIG.name}{" "}
                finns för att göra ekonomin mer begriplig, mer strukturerad och
                mer användbar i praktiska beslut.
              </p>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Det innebär redovisning som håller kvalitet, rapportering som går
                att agera på och ekonomiska samtal som skapar bättre styrning
                över tid. Ambitionen är att göra ekonomifunktionen till en
                tillgång i verksamheten, inte bara en administrativ nödvändighet.
              </p>
            </div>

            <div className="rounded-[2.15rem] bg-[#0B0B0C] p-8 text-white shadow-[0_28px_60px_-50px_rgba(0,0,0,0.45)]">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Bakom {SITE_CONFIG.name}
              </p>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                Albin Holmberg
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/72">
                Albin Holmberg arbetar med redovisning och ekonomisk analys för
                företag som vill ha större tydlighet i vardagen. Fokus ligger på
                struktur, relevanta underlag och ett samarbete som är lugnt,
                precist och förtroendeingivande.
              </p>
              <div className="mt-8 text-sm leading-7 text-white/72">
                <p>{SITE_CONFIG.contact.email}</p>
                <p>{SITE_CONFIG.contact.phoneDisplay}</p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="max-w-[48rem]">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Samarbetet
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] md:text-4xl">
              Så fungerar ett samarbete med {SITE_CONFIG.name}.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
              Upplägget ska vara tydligt från början. Ni ska veta vad som händer,
              vad som prioriteras och hur ekonomiarbetet skapar värde i
              verksamheten.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {workSteps.map((step) => (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)]"
              >
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[#5F5F5F]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="pb-24">
        <SectionContainer>
          <div className="max-w-[48rem]">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Det ni ska kunna förvänta er
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] md:text-4xl">
              Principer som ska märkas i det dagliga samarbetet.
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-[1.75rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)]"
              >
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
                  {value.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[#5F5F5F]">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title={`Vill du veta hur ett samarbete med ${SITE_CONFIG.name} kan se ut?`}
        description="Boka ett första samtal om verksamheten, nuläget och vilka delar av ekonomin som behöver mest struktur, tydlighet eller uppföljning."
        primary={{ href: "/kontakt", label: SITE_CONFIG.cta.primary }}
        secondary={{ href: "/tjanster", label: SITE_CONFIG.cta.services }}
      />
    </>
  );
}
