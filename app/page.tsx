/* eslint-disable @next/next/no-img-element */

const services = [
  {
    title: "Redovisning",
    description:
      "Löpande redovisning, moms och avstämningar med fokus på kvalitet, ordning och ett mer tillförlitligt ekonomiskt underlag.",
  },
  {
    title: "Rapportering",
    description:
      "Rapporter som lyfter fram det viktiga i verksamheten och gör det enklare att förstå lönsamhet, kassaflöde och utveckling.",
  },
  {
    title: "Analys och rådgivning",
    description:
      "Ekonomisk analys och löpande beslutsstöd för mindre företag som vill arbeta mer genomtänkt och med större kontroll.",
  },
];

const steps = [
  {
    number: "01",
    title: "Nuläge och prioriteringar",
    description:
      "Vi börjar med att förstå verksamheten, nuvarande arbetssätt och vilka ekonomiska frågor som behöver mest tydlighet.",
  },
  {
    number: "02",
    title: "Struktur och leverans",
    description:
      "Därefter etableras en tydlig process för redovisning, rapportering och uppföljning med rätt nivå av precision.",
  },
  {
    number: "03",
    title: "Kontroll och beslutsstöd",
    description:
      "Ni får en mer stabil ekonomifunktion och ett bättre underlag för beslut, planering och långsiktig utveckling.",
  },
];

const heroPoints = [
  "Ekonomisk kontroll med högre kvalitet i varje steg",
  "Rapportering som stödjer beslut, inte bara administration",
  "Lugn, analytisk och affärsnära rådgivning för småföretag",
];

const trustPoints = [
  "Premium, analytisk och lugn leverans",
  "Fokus på ekonomisk kontroll och beslutsstöd",
  "Passar mindre företag, konsultbolag och ägarledda verksamheter",
];

export default function Home() {
  return (
    <main className="bg-[#F7F7F5] text-[#1A1A1A]">
      <section className="px-6 py-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] border border-black/5 bg-white shadow-[0_40px_120px_-70px_rgba(0,0,0,0.35)]">
          <div className="bg-[#0B0B0C] px-6 py-3">
            <div className="flex flex-col gap-2 text-[11px] uppercase tracking-[0.18em] text-white/65 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <span>albinholmberg@icloud.com</span>
                <span>076-0218499</span>
              </div>
              <span className="text-[#C6A15B]">
                Ekonomisk styrning och redovisning för småföretag
              </span>
            </div>
          </div>

          <header className="flex items-center justify-between px-6 py-6">
            <a href="#" className="flex flex-col leading-none">
              <span className="text-xl font-medium tracking-[0.2em] text-[#0B0B0C] uppercase">
                Bidewind
              </span>
              <span className="mt-2 text-[11px] tracking-[0.24em] text-[#6B6B6B] uppercase">
                Consulting
              </span>
            </a>

            <nav className="hidden items-center gap-8 text-sm text-[#6B6B6B] md:flex">
              <a href="#tjanster" className="transition hover:text-[#1A1A1A]">
                Tjänster
              </a>
              <a href="#process" className="transition hover:text-[#1A1A1A]">
                Process
              </a>
              <a href="#om" className="transition hover:text-[#1A1A1A]">
                Om mig
              </a>
              <a href="#kontakt" className="transition hover:text-[#1A1A1A]">
                Kontakt
              </a>
            </nav>

            <a
              href="#kontakt"
              className="rounded-2xl bg-[#0B0B0C] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              Boka möte
            </a>
          </header>

          <div className="grid gap-14 border-t border-black/5 px-6 py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(21rem,0.95fr)] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Ekonomisk kontroll + beslutsstöd
              </p>

              <h1 className="mt-6 text-5xl font-semibold leading-tight tracking-[-0.05em] text-[#0B0B0C] sm:text-6xl">
                Ekonomisk styrning med större klarhet och kontroll
              </h1>

              <p className="mt-6 text-lg leading-8 text-[#6B6B6B]">
                Bidewind Consulting hjälper småföretag med redovisning, rapportering
                och ekonomisk analys, för bättre beslut och stabil tillväxt.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#kontakt"
                  className="rounded-2xl bg-[#0B0B0C] px-6 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
                >
                  Boka rådgivning
                </a>
                <a
                  href="#tjanster"
                  className="rounded-2xl border border-neutral-200 px-6 py-3 text-center text-sm font-medium text-[#1A1A1A] transition hover:bg-neutral-50"
                >
                  Se tjänster
                </a>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {heroPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-3xl border border-neutral-200 bg-[#F7F7F5] p-6"
                  >
                    <p className="text-sm leading-6 text-[#6B6B6B]">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-[2rem] bg-[#0B0B0C]">
                <img
                  src="https://images.pexels.com/photos/20251480/pexels-photo-20251480.jpeg?cs=srgb&dl=pexels-jakubzerdzicki-20251480.jpg&fm=jpg"
                  alt="Arbete med kalkylator, anteckningar och finansiella rapporter vid skrivbord"
                  className="h-[32rem] w-full object-cover opacity-90"
                />
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-[#F7F7F5] p-6">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  Tagline
                </p>
                <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#0B0B0C]">
                  Ekonomisk styrning och redovisning för småföretag
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tjanster" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Tjänster
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#0B0B0C] sm:text-4xl">
                Redovisning och rådgivning med större precision och bättre balans.
              </h2>
            </div>

            <p className="text-base leading-7 text-[#6B6B6B]">
              Fokus ligger inte bara på att leverera siffror, utan på att skapa
              struktur, överblick och ett mer användbart ekonomiskt beslutsunderlag.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium tracking-[0.22em] text-[#C6A15B]">
                    0{index + 1}
                  </span>
                  <span className="h-10 w-10 rounded-2xl bg-[#0B0B0C]" />
                </div>

                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
                  {service.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[#6B6B6B]">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-[2.25rem] bg-[#0B0B0C] px-6 py-16 text-white sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)] lg:items-end">
              <div className="max-w-3xl">
                <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                  Process
                </p>
                <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  En lugn, tydlig och analytisk arbetsprocess.
                </h2>
              </div>

              <p className="text-base leading-7 text-white/70">
                Arbetet är utformat för att ge bättre kontroll utan att skapa onödig
                komplexitet i vardagen.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B]">
                    {step.number}
                  </p>
                  <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-white/70">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="om" className="py-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(19rem,0.92fr)]">
          <div className="rounded-[2.25rem] border border-neutral-200 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] sm:p-10">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
              Om mig
            </h2>

            <p className="mt-4 text-[#6B6B6B] leading-8 sm:text-lg">
              Jag heter Albin Holmberg och arbetar med redovisning och ekonomisk
              analys för mindre företag. Mitt fokus är att skapa struktur, tydlighet
              och bättre beslutsunderlag, inte bara leverera siffror.
            </p>
          </div>

          <div className="rounded-[2.25rem] border border-neutral-200 bg-[#F7F7F5] p-8">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Positionering
            </p>
            <ul className="mt-8 space-y-4">
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="rounded-3xl border border-neutral-200 bg-white p-6 text-sm leading-6 text-[#6B6B6B]"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="kontakt" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 rounded-[2.25rem] border border-neutral-200 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end sm:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Kontakt
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#0B0B0C] sm:text-4xl">
                Vill du få större kontroll över siffrorna och tryggare underlag för dina beslut?
              </h2>
              <p className="mt-5 text-base leading-7 text-[#6B6B6B] sm:text-lg sm:leading-8">
                Hör av dig så bokar vi ett första samtal om redovisning, rapportering
                eller ekonomisk rådgivning för din verksamhet.
              </p>
            </div>

            <div className="rounded-3xl bg-[#0B0B0C] p-6 text-white">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Kontaktuppgifter
              </p>
              <p className="mt-4 text-neutral-300">albinholmberg@icloud.com</p>
              <p className="text-neutral-300 mt-2">076-0218499</p>
              <a
                href="mailto:albinholmberg@icloud.com"
                className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-medium text-[#0B0B0C] transition hover:opacity-90"
              >
                Kontakta mig
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="border-t border-neutral-200 pt-24">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
                Redovisning och ekonomisk rådgivning för mindre företag
              </h2>

              <p className="mt-4 text-[#6B6B6B] leading-8 sm:text-lg">
                Som företagare behöver du inte bara bokföring, du behöver förstå dina
                siffror. Bidewind Consulting hjälper små och medelstora företag med
                löpande redovisning, rapportering och ekonomisk analys för att skapa
                bättre beslutsunderlag.
              </p>

              <p className="mt-4 text-[#6B6B6B] leading-8 sm:text-lg">
                Oavsett om du driver konsultverksamhet eller ett växande bolag kan
                rätt struktur i ekonomin göra stor skillnad för din lönsamhet. För
                småföretag i Linköping och övriga Sverige innebär det bättre kontroll,
                tydligare rapportering och mer genomtänkta ekonomiska beslut.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
