import { CTABlock } from "@/components/cta-block";
import { SITE_CONFIG } from "@/config/site";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { ServiceCard } from "@/components/service-card";
import { createMetadata } from "@/lib/metadata";
import { companyTypes, services } from "@/lib/site";

export const metadata = createMetadata(
  "Redovisning, rapportering och rådgivning",
  "Tjänster inom redovisning, rapportering och ekonomisk rådgivning för växande och ägarledda bolag som vill ha bättre kontroll och tydligare beslutsunderlag.",
  { pathname: "/tjanster" }
);

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Tjänster"
        title="Tre tjänsteområden för bättre kontroll, tydligare siffror och starkare beslutsunderlag."
        description={`${SITE_CONFIG.name} erbjuder redovisning, rapportering och rådgivning för företag som vill minska ekonomisk osäkerhet och fatta mer välgrundade beslut i vardagen.`}
        aside={
          <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 text-sm leading-7 text-[#5F5F5F] shadow-[0_20px_50px_-45px_rgba(0,0,0,0.2)]">
            Med bas i Linköping och med uppdrag i hela Sverige passar upplägget
            verksamheter som vill minska den ekonomiska friktionen i vardagen och
            få ett mer professionellt stöd i styrningen.
          </div>
        }
      />

      <section className="pb-6 pt-8 md:pb-10 md:pt-10">
        <SectionContainer>
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.slug}
                title={service.title}
                summary={service.summary}
                href={service.href}
                label={service.label}
                ctaLabel={SITE_CONFIG.cta.serviceDetails}
                variant="feature"
              />
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="grid gap-10 rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:p-10">
            <div>
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Passar för
              </p>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] md:text-4xl">
                För företag som vill kombinera stabil redovisning med aktiv ekonomisk styrning.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Upplägget passar särskilt bra för växande företag,
                konsultbolag och entreprenörsdrivna bolag i tillväxt som vill ha
                mer än traditionell bokföring och behöver siffror som går att
                använda i praktiken.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {companyTypes.map((type) => (
                <div
                  key={type}
                  className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] p-5 text-sm leading-7 text-[#5F5F5F]"
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title="Vill du diskutera vilket upplägg som skulle skapa mest värde i ditt företag?"
        description="Boka ett första samtal så går vi igenom nuläge, arbetssätt och vilken kombination av redovisning, rapportering och rådgivning som passar bäst."
        primary={{ href: "/kontakt", label: SITE_CONFIG.cta.primary }}
        secondary={{ href: "/blogg", label: SITE_CONFIG.cta.articles }}
      />
    </>
  );
}
