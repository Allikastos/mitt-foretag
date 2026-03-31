/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata(
  "Redovisning och ekonomisk rådgivning",
  "Redovisning och ekonomisk rådgivning för mindre företag. Bidewind Consulting hjälper företag med bokföring, rapportering och analys för bättre kontroll på ekonomin och bättre beslut."
);

const helpItems = [
  "Löpande redovisning och bokföring",
  "Månadsrapportering och uppföljning",
  "Ekonomisk analys och rådgivning",
];

const serviceSections = [
  {
    label: "Redovisning",
    title: "Redovisning",
    href: "/tjanster/redovisning",
    paragraphs: [
      "Jag hjälper dig med löpande bokföring, moms och grundläggande redovisning. Målet är att du ska ha ordning på siffrorna utan att behöva lägga tid på det själv.",
      "Du får en struktur som fungerar över tid och en tydlig bild av företagets ekonomi.",
    ],
  },
  {
    label: "Rapportering",
    title: "Rapportering",
    href: "/tjanster/rapportering",
    paragraphs: [
      "Genom löpande rapportering får du en tydlig bild av hur verksamheten går. Jag sammanställer siffror på ett sätt som gör dem enkla att förstå och använda.",
      "Du ser vad som fungerar, vad som kan förbättras och hur du ligger till över tid.",
    ],
  },
  {
    label: "Rådgivning",
    title: "Rådgivning",
    href: "/tjanster/radgivning",
    paragraphs: [
      "Jag hjälper dig att förstå siffrorna bakom verksamheten och vad de faktiskt betyder. Det kan handla om lönsamhet, kostnader eller hur du planerar framåt.",
      "Målet är att du ska kunna fatta bättre beslut med ett tydligt ekonomiskt underlag.",
    ],
  },
];

const workItems = [
  "Tydlig struktur i redovisningen",
  "Löpande uppföljning av siffror",
  "Enkelt och direkt samarbete",
  "Fokus på att göra ekonomin användbar",
];

export default function HomePage() {
  return (
    <>
      <section className="pb-16 pt-8 md:pb-20 md:pt-16 lg:pt-20">
        <SectionContainer>
          <div className="overflow-hidden rounded-[2.75rem] border border-black/6 bg-white shadow-[0_36px_90px_-62px_rgba(0,0,0,0.24)]">
            <div className="grid gap-12 px-8 py-10 md:px-12 md:py-14 lg:grid-cols-[minmax(0,1.06fr)_minmax(18rem,0.94fr)] lg:items-center lg:gap-14 lg:px-14 lg:py-16">
              <div className="max-w-[39rem]">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  {siteConfig.tagline}
                </p>
                <p className="mt-6 text-sm font-medium tracking-[0.18em] text-[#6B6B6B] uppercase">
                  {siteConfig.name}
                </p>
                <h1 className="mt-7 text-4xl font-semibold tracking-[-0.055em] text-[#0B0B0C] text-balance md:text-5xl lg:text-[4.2rem] lg:leading-[0.98]">
                  Redovisning och ekonomisk rådgivning för mindre företag
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5F5F5F] md:text-[1.125rem]">
                  Jag hjälper företag med bokföring, rapportering och analys, så
                  att du får bättre kontroll på ekonomin och kan fatta bättre
                  beslut.
                </p>

                <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#0B0B0C] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Kontakta Bidewind
                  </Link>
                  <Link
                    href="/tjanster"
                    className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-6 py-3 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#F7F7F5]"
                  >
                    Se tjänster
                  </Link>
                </div>
              </div>

              <div className="space-y-6 lg:pl-2">
                <div className="overflow-hidden rounded-[2.1rem] bg-[#0B0B0C] shadow-[0_26px_60px_-44px_rgba(0,0,0,0.35)]">
                  <img
                    src="https://images.pexels.com/photos/20251480/pexels-photo-20251480.jpeg?cs=srgb&dl=pexels-jakubzerdzicki-20251480.jpg&fm=jpg"
                    alt="Finansiella rapporter, kalkylator och anteckningar på skrivbord"
                    className="h-[24rem] w-full object-cover opacity-92 md:h-[30rem]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.6rem] border border-black/8 bg-[#F7F7F5] p-6">
                    <p className="text-xs font-medium tracking-[0.2em] text-[#C6A15B] uppercase">
                      Fokus
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#5F5F5F]">
                      Struktur och tydlighet i ekonomin för företag som vill arbeta
                      mer genomtänkt.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-black/8 bg-[#F7F7F5] p-6">
                    <p className="text-xs font-medium tracking-[0.2em] text-[#C6A15B] uppercase">
                      Inriktning
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#5F5F5F]">
                      Bättre kontroll, tydligare uppföljning och användbara
                      beslutsunderlag.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start lg:gap-12">
            <div className="max-w-[48rem]">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Vad jag hjälper till med
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] text-balance md:text-4xl">
                Vad jag hjälper till med
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Jag arbetar med redovisning, rapportering och ekonomisk rådgivning
                för mindre företag. Fokus ligger på att skapa struktur och tydlighet
                i ekonomin, så att du som företagare vet hur verksamheten faktiskt
                går.
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/8 bg-[#F7F7F5] p-6 shadow-[0_22px_60px_-54px_rgba(0,0,0,0.14)] md:p-7">
              <ul className="space-y-3">
                {helpItems.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.25rem] border border-black/8 bg-white px-5 py-4 text-sm leading-6 text-[#5F5F5F]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-3">
            {serviceSections.map((service) => (
              <article
                key={service.title}
                className="flex h-full flex-col rounded-[2rem] border border-black/8 bg-white p-7 shadow-[0_22px_60px_-50px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_-48px_rgba(0,0,0,0.24)] md:p-8"
              >
                <p className="text-xs font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  {service.label}
                </p>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
                  {service.title}
                </h2>
                <div className="mt-5 flex-1 space-y-4 text-base leading-7 text-[#5F5F5F]">
                  {service.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                <Link
                  href={service.href}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:border-[#0B0B0C] hover:bg-[#F7F7F5]"
                >
                  Läs mer
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="rounded-[2.5rem] bg-[#0B0B0C] px-8 py-12 text-white shadow-[0_34px_90px_-60px_rgba(0,0,0,0.4)] md:px-12 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-start lg:gap-12">
              <div className="max-w-[46rem]">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  Hur jag arbetar
                </p>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-balance md:text-4xl">
                  Hur jag arbetar
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/72">
                  Mitt arbetssätt är enkelt och strukturerat. Du ska alltid veta
                  vad som händer och vad du får.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {workItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-sm leading-6 text-white/78"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(18rem,0.98fr)]">
            <div className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                För vilka företag
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] text-balance md:text-4xl">
                För vilka företag
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Jag arbetar främst med mindre företag, konsulter och tjänstebolag
                som vill få bättre kontroll på sin ekonomi.
              </p>
              <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
                Det passar dig som vill ha en enkel och tydlig lösning utan onödig
                komplexitet, men ändå ha koll på hur verksamheten faktiskt går.
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/8 bg-[#F7F7F5] p-8 md:p-10">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Om Bidewind Consulting
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] text-balance">
                Om Bidewind Consulting
              </h2>
              <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                Bidewind Consulting arbetar med redovisning och ekonomisk
                rådgivning för mindre företag.
              </p>
              <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
                Fokus ligger på att skapa tydlighet i ekonomin, inte bara leverera
                siffror, utan göra dem användbara i verksamheten.
              </p>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="pb-24 pt-4 md:pb-28">
        <SectionContainer>
          <div className="rounded-[2.5rem] bg-[#0B0B0C] px-8 py-12 text-white shadow-[0_34px_90px_-60px_rgba(0,0,0,0.42)] md:px-12 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-[48rem]">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  Kontakt
                </p>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-balance md:text-4xl lg:text-[2.9rem] lg:leading-[1.05]">
                  Vill du få bättre kontroll på ditt företag?
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/72">
                  Hör av dig så bokar vi ett första samtal.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:justify-items-end">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:opacity-90"
                >
                  {siteConfig.email}
                </a>
                <a
                  href={siteConfig.phoneHref}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:bg-white/8"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
