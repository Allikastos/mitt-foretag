import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { siteConfig } from "@/lib/site";

export const metadata = createMetadata(
  "Kontakt",
  "Kontakta Bidewind Consulting för redovisning, finansiell rapportering och ekonomisk rådgivning. Möten kan hållas digitalt eller i Linköping."
);

export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow="Kontakt"
        title="Ett första samtal om redovisning, rapportering eller ekonomisk rådgivning."
        description="Ta kontakt om du vill diskutera hur Bidewind Consulting kan hjälpa din verksamhet med bättre struktur, tydligare siffror och lugnare ekonomisk styrning."
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
                  {siteConfig.name}
                </h2>
                <div className="mt-6 space-y-3 text-base leading-7 text-white/72">
                  <p>{siteConfig.email}</p>
                  <p>{siteConfig.phoneDisplay}</p>
                  <p>
                    {siteConfig.city}, {siteConfig.country}
                  </p>
                </div>
              </div>

              <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)]">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  Mötesform
                </p>
                <p className="mt-5 text-lg leading-8 text-[#5F5F5F]">
                  Möten kan hållas digitalt eller på plats beroende på vad som passar
                  bäst. För företag i Linköping är det naturligt att ses lokalt, men
                  samarbeten fungerar lika väl med företag i övriga Sverige.
                </p>
              </div>
            </div>

            <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                Skicka en förfrågan
              </h2>
              <p className="mt-4 text-base leading-7 text-[#5F5F5F]">
                Beskriv kort vad ni behöver hjälp med, så återkommer jag så snart
                jag kan.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
