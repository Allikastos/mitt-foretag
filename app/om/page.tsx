import { CTABlock } from "@/components/cta-block";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { siteConfig, values } from "@/lib/site";

export const metadata = createMetadata(
  "Om Bidewind Consulting",
  "Lär känna Bidewind Consulting och Albin Holmberg. Fokus ligger på att kombinera redovisning med tydlighet, ekonomisk struktur och bättre beslutsstöd."
);

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="Om"
        title="Bidewind Consulting kombinerar redovisning med klarhet, struktur och bättre beslutsstöd."
        description="Arbetet riktar sig till mindre företag som vill ha hög kvalitet i redovisningen, tydligare ekonomisk uppföljning och ett lugnare sätt att arbeta med siffror."
      />

      <section className="pb-8 pt-8 md:pb-12 md:pt-10">
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)]">
            <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                Om Bidewind Consulting
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Fokus ligger på att skapa en tydligare ekonomisk struktur för
                mindre företag. Det innebär redovisning som håller kvalitet,
                rapportering som går att förstå och ekonomiska samtal som hjälper
                företagaren att fatta bättre beslut.
              </p>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Tonen i samarbetet är lugn, analytisk och långsiktig. Målet är att
                ekonomin ska kännas mer förutsägbar och mer användbar i praktiken,
                både i Linköping och i uppdrag över hela Sverige.
              </p>
            </div>

            <div className="rounded-[2.15rem] bg-[#0B0B0C] p-8 text-white shadow-[0_28px_60px_-50px_rgba(0,0,0,0.45)]">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Grundare
              </p>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                Albin Holmberg
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/72">
                Albin Holmberg arbetar med redovisning och ekonomisk analys för
                mindre företag och fokuserar på att skapa tydlighet, struktur och
                bättre beslutsunderlag, inte bara leverera siffror.
              </p>
              <div className="mt-8 text-sm leading-7 text-white/72">
                <p>{siteConfig.email}</p>
                <p>{siteConfig.phoneDisplay}</p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="max-w-[48rem]">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Arbetssätt
            </p>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] md:text-4xl">
              Värderingar som präglar varje uppdrag.
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
        title="Vill du veta hur ett samarbete med Bidewind kan se ut?"
        description="Ta kontakt för ett första samtal om din verksamhet, nuläge och vilka delar av ekonomin som behöver mest tydlighet."
        primary={{ href: "/kontakt", label: "Kontakta Bidewind" }}
      />
    </>
  );
}
