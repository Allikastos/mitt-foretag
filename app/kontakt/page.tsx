import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { SITE_CONFIG } from "@/config/site";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";

const contactSteps = [
  {
    title: "Ni beskriver nuläget",
    description:
      "Berätta kort om verksamheten, vad ni vill få bättre ordning i och vilka frågor som är viktigast just nu.",
  },
  {
    title: "Första avstämning",
    description:
      "Ni får en personlig återkoppling för att gå igenom behov, prioriteringar och om det finns ett bra upplägg att gå vidare med.",
  },
  {
    title: "Tydligt nästa steg",
    description:
      "Ni får en tydlig bild av hur ett samarbete kan se ut, eller vad som är mest rimligt att prioritera först.",
  },
];

export const metadata = createMetadata(
  "Kontakt",
  `Boka ett första samtal med ${SITE_CONFIG.name} om redovisning, rapportering eller ekonomisk rådgivning. Vi återkopplar vanligtvis inom 24 timmar.`,
  { pathname: "/kontakt" }
);

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Kontakt"
        title="Boka ett första samtal om redovisning, rapportering eller ekonomisk rådgivning."
        description={`Du behöver inte ha ett färdigt upplägg. Beskriv nuläge, frågor eller vad som känns oklart, så återkommer ${SITE_CONFIG.name} med ett tydligt nästa steg. Vi återkopplar vanligtvis inom 24 timmar.`}
      />

      <section className="pb-8 pt-8 md:pb-12 md:pt-10">
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-6">
              <div className="rounded-[2.15rem] bg-[#0B0B0C] p-8 text-white shadow-[0_28px_60px_-50px_rgba(0,0,0,0.45)]">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  Kontaktuppgifter
                </p>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">
                  {SITE_CONFIG.name}
                </h2>
                <div className="mt-6 space-y-3 text-base leading-7 text-white/72">
                  <p>Ni kan höra av er via formuläret, mejl eller telefon.</p>
                  <p>{SITE_CONFIG.contact.email}</p>
                  <p>{SITE_CONFIG.contact.phoneDisplay}</p>
                  <p>
                    {SITE_CONFIG.contact.city}, {SITE_CONFIG.contact.country}
                  </p>
                </div>
              </div>

              <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)]">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  Så går det till
                </p>
                <div className="mt-5 space-y-4">
                  {contactSteps.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] p-5"
                    >
                      <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#0B0B0C]">
                        {step.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[#5F5F5F]">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-7 text-[#5F5F5F]">
                  Möten kan hållas digitalt eller på plats beroende på vad som
                  passar bäst. För företag i Linköping är det naturligt att ses
                  lokalt, men samarbeten fungerar lika väl med företag i övriga
                  Sverige. Vi återkopplar vanligtvis inom 24 timmar.
                </p>
              </div>
            </div>

            <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                Boka ett första samtal
              </h2>
              <p className="mt-4 text-base leading-7 text-[#5F5F5F]">
                Det räcker med några meningar om verksamheten, nuläget och vad
                ni vill få bättre ordning i. Ni behöver inte ha alla svar klara
                innan ni hör av er.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
              <div className="mt-8 rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] p-5 text-sm leading-7 text-[#5F5F5F]">
                Vill ni förbereda mötet? Se{" "}
                <Link href="/tjanster" className="font-medium text-[#0B0B0C] underline underline-offset-4">
                  tjänsteområden
                </Link>{" "}
                eller läs relevanta artiklar i{" "}
                <Link href="/blogg" className="font-medium text-[#0B0B0C] underline underline-offset-4">
                  bloggen
                </Link>
                .
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
