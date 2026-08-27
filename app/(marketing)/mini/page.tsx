import Link from "next/link";
import { CTABlock } from "@/components/cta-block";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Enkel hemsida för företag – 2 995 kr",
  "En kompakt ensideshemsida från en fast grundlayout för 2 995 kr exklusive moms.",
  { pathname: "/mini" },
);

const included = [
  "En kompakt, mobilanpassad ensideshemsida",
  "Anpassning av en utvald fast grundlayout",
  "Företagets färger, logotyp och kontaktuppgifter",
  "Kontaktväg och grundläggande teknisk SEO",
  "Publiceringshjälp på befintlig eller ny domän",
];

const boundaries = [
  "Du levererar färdiga texter och användbara bilder",
  "En fast grundlayout används utan större strukturändringar",
  "En samlad mindre korrigeringsomgång ingår",
  "Specialfunktioner, textproduktion och bildinköp ingår inte",
];

export default function MiniPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Hem", href: "/" }, { label: "Altura Mini" }]} />
      <PageIntro
        eyebrow="Begränsat pilotpaket"
        title="En professionell väg online när allt innehåll redan är klart."
        description="Altura Mini är ett avgränsat ensidespaket för företag som kan leverera färdiga texter, bilder och en tydlig riktning. Du får en genomarbetad webbplats från en fast grundlayout, utan att betala för ett större designprojekt."
        aside={
          <div className="rounded-[2rem] bg-[#173f35] p-7 text-white shadow-[0_30px_70px_-45px_rgba(23,63,53,.8)]">
            <p className="text-xs font-bold tracking-[0.2em] text-[#f3b89f] uppercase">Altura Mini</p>
            <p className="mt-4 text-5xl font-semibold tracking-[-0.055em]">2 995 kr</p>
            <p className="mt-2 text-sm text-white/55">exklusive moms</p>
          </div>
        }
      />

      <section className="pb-12">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <article className="rounded-[2.25rem] border border-[#173f35]/10 bg-[#fffdf8] p-7 md:p-10">
              <p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">Det här ingår</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.05em] text-[#173f35]">Litet i omfattning, seriöst i utförandet.</h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex gap-3 rounded-[1.25rem] bg-[#eef2ec] p-4 text-sm leading-6 text-[#52645b]">
                    <span aria-hidden="true" className="font-bold text-[#e86f44]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <aside className="rounded-[2.25rem] bg-[#e8c8ad] p-7 text-[#173f35] md:p-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase">Rätt för dig om</p>
              <ul className="mt-6 space-y-4">
                {boundaries.map((item, index) => (
                  <li key={item} className="grid grid-cols-[auto_1fr] gap-3 border-t border-[#173f35]/15 pt-4 text-sm leading-6">
                    <span className="font-bold text-[#9c4223]">0{index + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-[#173f35]/10 bg-white/55 p-7 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold text-[#173f35]">Behöver du unik design eller hjälp med innehållet?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#617169]">Då är Altura Start det ordinarie instegspaketet. Mini hålls medvetet smalt för att pris, ansvar och leverans ska vara tydliga.</p>
            </div>
            <Link href="/tjanster/start" className="shrink-0 rounded-full border border-[#173f35]/20 px-5 py-3 text-sm font-semibold text-[#173f35] transition hover:bg-[#173f35] hover:text-white">Jämför med Start</Link>
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title="Har du materialet redo för Altura Mini?"
        description="Skicka en kort beskrivning och länka gärna till befintligt material. Jag bekräftar om pilotpaketet passar innan något arbete startar."
        primary={{ href: "/kontakt", label: SITE_CONFIG.cta.primary }}
        secondary={{ href: "/exempel", label: "Se designexempel" }}
      />
    </>
  );
}
