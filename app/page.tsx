/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Redovisning, rapportering och rådgivning för växande företag",
  `${SITE_CONFIG.name} hjälper växande och ägarledda bolag med redovisning, rapportering och rådgivning för bättre kontroll, tydligare siffror och snabbare beslut i verksamheten.`,
  { pathname: "/" }
);

const helpItems = [
  "tydlig ekonomisk överblick",
  "bättre uppföljning över tid",
  "underlag för beslut",
  "en stabil grund för tillväxt",
];

const serviceSections = [
  {
    label: "Redovisning",
    title: "Redovisning",
    href: "/tjanster/redovisning",
    paragraphs: [
      "Löpande bokföring, moms och avstämningar byggs upp i ett tydligt arbetssätt som fungerar över tid.",
      "Resultatet är uppdaterade siffror, lägre risk för fel och mer tid till verksamheten.",
    ],
  },
  {
    label: "Rapportering",
    title: "Rapportering",
    href: "/tjanster/rapportering",
    paragraphs: [
      "Löpande rapportering visar utveckling, avvikelser och nyckeltal som är relevanta för styrningen.",
      "Ni får bättre överblick och snabbare underlag för prioriteringar och beslut.",
    ],
  },
  {
    label: "Rådgivning",
    title: "Rådgivning",
    href: "/tjanster/radgivning",
    paragraphs: [
      "Rådgivningen utgår från era siffror och fokuserar på lönsamhet, kostnadsstruktur och nästa steg framåt.",
      "Målet är tydliga rekommendationer som stärker beslutsförmågan i ledning och ägararbete.",
    ],
  },
];

const workItems = [
  "Tydlig struktur i redovisning och underlag",
  "Regelbunden uppföljning av ekonomi och avvikelser",
  "Direkt dialog med fokus på affärsnytta",
  "Siffror som går att använda i beslut",
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
                  {SITE_CONFIG.tagline}
                </p>
                <p className="mt-6 text-sm font-medium tracking-[0.18em] text-[#6B6B6B] uppercase">
                  {SITE_CONFIG.name}
                </p>
                <h1 className="mt-7 text-4xl font-semibold tracking-[-0.055em] text-[#0B0B0C] text-balance md:text-5xl lg:text-[4.2rem] lg:leading-[0.98]">
                  Ekonomisk kontroll som faktiskt driver bättre beslut
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5F5F5F] md:text-[1.125rem]">
                  {SITE_CONFIG.name} hjälper växande och ägarledda företag att
                  få tydliga siffror, bättre struktur och ett stabilt
                  beslutsunderlag - så att du kan fokusera på att driva och
                  utveckla verksamheten.
                </p>

                <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/kontakt"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#0B0B0C] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Kontakta oss
                  </Link>
                  <Link
                    href="/tjanster"
                    className="inline-flex items-center justify-center rounded-2xl border border-black/10 px-6 py-3 text-sm font-medium text-[#0B0B0C] transition hover:bg-[#F7F7F5]"
                  >
                    Se våra tjänster
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
                      Struktur, kontroll och tydlighet för företag som vill
                      arbeta mer analytiskt med ekonomin.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-black/8 bg-[#F7F7F5] p-6">
                    <p className="text-xs font-medium tracking-[0.2em] text-[#C6A15B] uppercase">
                      Inriktning
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#5F5F5F]">
                      Beslutsunderlag som går att agera på i ledning och
                      planering.
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
                Värde
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] text-balance md:text-4xl">
                Få mer än bara bokföring
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Många företag har sin redovisning på plats - men saknar tydlig
                uppföljning, struktur och förståelse för vad siffrorna faktiskt
                innebär.
              </p>
              <p className="mt-5 text-lg leading-8 text-[#5F5F5F]">
                Vi arbetar nära våra kunder för att skapa:
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
                  {SITE_CONFIG.cta.serviceDetails}
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
                  Arbetssätt
                </p>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-balance md:text-4xl">
                  Så byggs ett samarbete som ger kontroll och kontinuitet
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/72">
                  Upplägget är tydligt från start. Ni vet vad som prioriteras,
                  hur uppföljningen sker och vilket nästa steg som skapar mest
                  värde.
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
                För vilka företag upplägget passar bäst
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                {SITE_CONFIG.name} arbetar främst med ägarledda och
                entreprenörsdrivna företag, konsulter och tjänstebolag som vill
                styra med bättre ekonomiska underlag.
              </p>
              <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
                Upplägget passar er som vill minska osäkerheten i ekonomin och
                fatta snabbare beslut med större precision.
              </p>
            </div>

            <div className="rounded-[2rem] border border-black/8 bg-[#F7F7F5] p-8 md:p-10">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Om {SITE_CONFIG.name}
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] text-balance">
                Om {SITE_CONFIG.name}
              </h2>
              <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                {SITE_CONFIG.name} arbetar med redovisning och ekonomisk
                rådgivning för växande företag.
              </p>
              <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
                Fokus ligger på att skapa tydlighet i ekonomin, inte bara leverera
                siffror utan att göra dem användbara i verksamheten.
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
                  Vill ni få bättre kontroll, tydligare siffror och tryggare beslut?
                </h2>
                <p className="mt-6 text-lg leading-8 text-white/72">
                  Hör av er så återkommer vi normalt inom en arbetsdag med ett
                  tydligt nästa steg.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:justify-items-end">
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:opacity-90"
                >
                  {SITE_CONFIG.contact.email}
                </a>
                <a
                  href={SITE_CONFIG.contact.phoneHref}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:bg-white/8"
                >
                  {SITE_CONFIG.contact.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
