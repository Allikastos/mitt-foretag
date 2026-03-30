/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { CTABlock } from "@/components/cta-block";
import { SectionContainer } from "@/components/section-container";
import { ServiceCard } from "@/components/service-card";
import { createMetadata } from "@/lib/metadata";
import { services, siteConfig, workSteps } from "@/lib/site";

export const metadata = createMetadata(
  "Ekonomisk styrning och redovisning",
  "Redovisning och ekonomisk rådgivning för mindre företag. Bidewind Consulting hjälper företag med bokföring, rapportering och analys för bättre kontroll och bättre beslut."
);

export default function HomePage() {
  return (
    <>
      <section className="pb-16 pt-8 md:pb-20 md:pt-16 lg:pt-20">
        <SectionContainer>
          <div className="overflow-hidden rounded-[2.75rem] border border-black/6 bg-white shadow-[0_36px_90px_-62px_rgba(0,0,0,0.24)]">
            <div className="grid gap-12 px-8 py-10 md:px-12 md:py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] lg:items-center lg:gap-14 lg:px-14 lg:py-16">
              <div className="max-w-[37rem]">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  {siteConfig.tagline}
                </p>
                <p className="mt-6 text-sm font-medium tracking-[0.18em] text-[#6B6B6B] uppercase">
                  {siteConfig.name}
                </p>
                <h1 className="mt-7 text-4xl font-semibold tracking-[-0.055em] text-[#0B0B0C] text-balance md:text-5xl lg:text-[4.35rem] lg:leading-[0.98]">
                  Redovisning och ekonomisk rådgivning för mindre företag
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-8 text-[#5F5F5F] md:text-[1.125rem]">
                  Jag hjälper företag med bokföring, rapportering och analys så att
                  du får bättre kontroll och kan fatta bättre beslut.
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
                    Utforska tjänster
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
                      Struktur, kontroll och tydligare siffror i det löpande arbetet.
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] border border-black/8 bg-[#F7F7F5] p-6">
                    <p className="text-xs font-medium tracking-[0.2em] text-[#C6A15B] uppercase">
                      Resultat
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#5F5F5F]">
                      Bättre beslutsunderlag för företag som vill arbeta mer genomtänkt.
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
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-end lg:gap-12">
            <div className="max-w-[48rem]">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Tjänster
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] text-balance md:text-4xl">
                Redovisning, rapportering och rådgivning med premiumkänsla och tydlig riktning.
              </h2>
            </div>
            <p className="text-base leading-7 text-[#5F5F5F]">
              Erbjudandet är utformat för mindre företag som vill ha hög kvalitet,
              lugnare ekonomisk struktur och ett mer användbart beslutsstöd.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard
                key={service.slug}
                title={service.title}
                summary={service.summary}
                href={service.href}
                label={service.label}
              />
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="rounded-[2.5rem] bg-[#0B0B0C] px-8 py-12 text-white shadow-[0_34px_90px_-60px_rgba(0,0,0,0.4)] md:px-12 md:py-16">
            <div className="max-w-[48rem]">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Så arbetar vi
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-balance md:text-4xl">
                Ett lugnt och strukturerat upplägg för bättre ekonomisk kontroll.
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {workSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-[1.9rem] border border-white/10 bg-white/5 p-7"
                >
                  <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B]">
                    0{index + 1}
                  </p>
                  <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em]">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-white/72">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(19rem,0.88fr)] lg:gap-8">
            <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Om Bidewind
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.045em] text-[#0B0B0C] text-balance md:text-4xl">
                En ekonomipartner för mindre företag som vill ha större klarhet och bättre beslut.
              </h2>
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                Bidewind Consulting kombinerar redovisning med tydlighet,
                ekonomisk struktur och bättre beslutsstöd. Tonen är lugn,
                analytisk och professionell, med fokus på det som hjälper
                företagaren att arbeta mer genomtänkt över tid.
              </p>
            </div>

            <div className="rounded-[2.15rem] border border-black/8 bg-[#F7F7F5] p-8">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Grund i arbetet
              </p>
              <ul className="mt-8 space-y-4">
                <li className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm leading-6 text-[#5F5F5F]">
                  Precision i detaljerna och lugn i leveransen
                </li>
                <li className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm leading-6 text-[#5F5F5F]">
                  Tydliga siffror som går att agera på
                </li>
                <li className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm leading-6 text-[#5F5F5F]">
                  Samarbete för företag i Linköping och i övriga Sverige
                </li>
              </ul>
            </div>
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title="Vill du få större kontroll i ekonomin och bättre underlag för nästa beslut?"
        description="Hör av dig för ett första samtal om redovisning, rapportering eller rådgivning och hur upplägget kan anpassas till din verksamhet."
        primary={{ href: "/kontakt", label: "Gå till kontakt" }}
        secondary={{ href: "/tjanster", label: "Läs om tjänsterna" }}
      />
    </>
  );
}
