/* eslint-disable @next/next/no-img-element */

const services = [
  {
    title: "Löpande bokföring",
    description:
      "Noggrant utförd redovisning, moms och avstämningar som skapar en stabil finansiell grund och minskar friktionen i vardagen.",
  },
  {
    title: "Finansiell rapportering",
    description:
      "Rapportering med relevanta nyckeltal, tydliga kommentarer och struktur som gör ekonomin användbar för ledning, ägare och styrelse.",
  },
  {
    title: "Analys och rådgivning",
    description:
      "Kvalificerat stöd kring lönsamhet, kassaflöde och prioriteringar när verksamheten behöver ett mer strategiskt ekonomiskt perspektiv.",
  },
];

const steps = [
  {
    number: "01",
    title: "Strategisk genomgång",
    description:
      "Arbetet inleds med att förstå affären, nuvarande rutiner och vilka ekonomiska frågor som kräver mest precision.",
  },
  {
    number: "02",
    title: "Struktur och leverans",
    description:
      "Därefter sätts en tydlig process för redovisning, rapportering och återkommande uppföljning med rätt nivå av kontroll.",
  },
  {
    number: "03",
    title: "Löpande beslutsstöd",
    description:
      "Resultatet blir en ekonomifunktion som inte bara levererar siffror, utan underlag som stärker beslut och skapar framförhållning.",
  },
];

const heroPoints = [
  {
    title: "Struktur",
    description:
      "En stabil process för redovisning, rapportering och ekonomisk uppföljning.",
  },
  {
    title: "Insikt",
    description:
      "Rapporter som ger sammanhang, tydlighet och bättre beslutsunderlag.",
  },
  {
    title: "Närvaro",
    description:
      "Tillgänglig rådgivning när verksamheten står inför viktiga prioriteringar.",
  },
];

const trustPoints = [
  "Diskret, tillgänglig och affärsnära rådgivning",
  "Anpassat för ägarledda bolag, konsultverksamheter och mindre team",
  "Fokus på kvalitet, tydlighet och långsiktigt förtroende",
];

export default function Home() {
  return (
    <main className="bg-[radial-gradient(circle_at_top,#faf8f4_0%,#f2eee6_42%,#ece6dc_100%)] text-neutral-950">
      <section className="px-4 pt-5 pb-14 sm:px-6 lg:px-8 lg:pt-6 lg:pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-white/90 shadow-[0_50px_140px_-70px_rgba(0,0,0,0.4)] ring-1 ring-black/5 backdrop-blur">
          <div className="border-b border-neutral-200/80 bg-white/80 px-7 py-3.5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-2 text-xs tracking-[0.08em] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <span>013-32 85 80</span>
                <span>info@dittforetag.se</span>
              </div>
              <span>Redovisning och finansiell rådgivning för företag med höga krav på kvalitet</span>
            </div>
          </div>

          <header className="flex items-center justify-between px-7 py-6 sm:px-8 lg:px-12 lg:py-7">
            <a href="#" className="text-[1.7rem] font-semibold tracking-[-0.03em] text-neutral-950">
              Mitt Företag
            </a>

            <nav className="hidden items-center gap-10 text-sm text-neutral-700 md:flex">
              <a href="#tjanster" className="transition hover:text-neutral-950">
                Tjänster
              </a>
              <a href="#process" className="transition hover:text-neutral-950">
                Process
              </a>
              <a href="#om" className="transition hover:text-neutral-950">
                Om
              </a>
              <a href="#kontakt" className="transition hover:text-neutral-950">
                Kontakt
              </a>
            </nav>

            <a
              href="#kontakt"
              className="inline-flex items-center rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
            >
              Boka möte
            </a>
          </header>

          <div className="relative min-h-[42rem] overflow-hidden bg-neutral-950">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1800&q=80"
              alt="Möte runt ett bord med laptop och dokument"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-neutral-950/48" />
            <div className="absolute inset-0 bg-[linear-gradient(96deg,rgba(10,10,10,0.8)_0%,rgba(10,10,10,0.58)_45%,rgba(10,10,10,0.2)_100%)]" />

            <div className="relative z-10 flex min-h-[42rem] items-center px-7 py-20 sm:px-8 lg:px-12 lg:py-24">
              <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)] lg:gap-16">
                <div className="max-w-3xl">
                  <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-[0.22em] text-white uppercase backdrop-blur-sm">
                    Redovisning • Rapportering • Rådgivning
                  </span>

                  <h1 className="mt-9 text-5xl font-semibold tracking-[-0.05em] text-white text-balance sm:text-6xl lg:text-[5.25rem] lg:leading-[0.94]">
                    Ekonomisk styrning med större klarhet, precision och lugn.
                  </h1>

                  <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-200 sm:text-[1.15rem]">
                    Jag hjälper entreprenörer, konsultbolag och växande företag att
                    bygga en mer ordnad redovisning, bättre rapportering och tydligare
                    beslutsunderlag för nästa steg.
                  </p>

                  <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                    <a
                      href="#kontakt"
                      className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
                    >
                      Boka ett inledande möte
                    </a>
                    <a
                      href="#tjanster"
                      className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/18"
                    >
                      Utforska tjänster
                    </a>
                  </div>
                </div>

                <div className="max-w-md rounded-[2rem] border border-white/14 bg-white/10 p-7 text-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8 lg:ml-auto lg:self-end">
                  <p className="text-xs uppercase tracking-[0.22em] text-neutral-300">
                    För bolag som vill ha
                  </p>
                  <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-balance">
                    hög kvalitet i leveransen och tydlighet i varje steg.
                  </p>

                  <div className="mt-8 space-y-5">
                    {heroPoints.map((point) => (
                      <div key={point.title} className="border-t border-white/12 pt-5 first:border-t-0 first:pt-0">
                        <p className="text-sm font-medium text-white">{point.title}</p>
                        <p className="mt-1.5 text-sm leading-6 text-neutral-300">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-7 flex items-center gap-2 sm:left-8 lg:left-12">
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/45" />
            </div>
          </div>
        </div>
      </section>

      <section id="tjanster" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-medium tracking-[0.22em] text-neutral-500 uppercase">
                Tjänster
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.9rem]">
                En genomarbetad ekonomifunktion, utan att vardagen blir tyngre.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-neutral-600">
              Tjänsterna är utformade för företag som vill ha hög kvalitet,
              tydlig kommunikation och rapportering som faktiskt används i
              verksamheten.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="flex h-full flex-col rounded-[2rem] bg-white/90 p-9 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.38)] ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-[0_36px_90px_-56px_rgba(0,0,0,0.42)] sm:p-10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium tracking-[0.2em] text-neutral-400">
                    0{index + 1}
                  </span>
                  <span className="h-11 w-11 rounded-2xl bg-neutral-950" />
                </div>

                <h3 className="mt-10 text-2xl font-semibold tracking-[-0.03em] text-balance">
                  {service.title}
                </h3>
                <p className="mt-5 text-base leading-7 text-neutral-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-7xl rounded-[2.4rem] bg-neutral-950 px-7 py-14 text-white shadow-[0_40px_100px_-60px_rgba(0,0,0,0.55)] sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,25rem)] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-medium tracking-[0.22em] text-neutral-400 uppercase">
                Så arbetar vi
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.9rem]">
                Ett arbetssätt byggt för ordning, tempo och förtroende.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-neutral-300">
              Upplägget är enkelt, men genomarbetat. Målet är att skapa tydlighet i
              leveransen och trygghet i de beslut som följer.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-9 backdrop-blur-sm sm:p-10"
              >
                <p className="text-sm font-medium tracking-[0.2em] text-neutral-400">
                  {step.number}
                </p>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-balance">
                  {step.title}
                </h3>
                <p className="mt-5 text-base leading-7 text-neutral-300">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="om" className="px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(19rem,0.82fr)] lg:gap-10">
          <div className="rounded-[2.2rem] bg-white/92 p-9 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.38)] ring-1 ring-black/5 sm:p-12">
            <p className="text-sm font-medium tracking-[0.22em] text-neutral-500 uppercase">
              Om samarbetet
            </p>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.85rem]">
              En partner som kombinerar noggrannhet i detaljerna med förståelse för affären.
            </h2>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-neutral-600">
              Jag arbetar nära företagare, konsulter och mindre bolag som vill ha en
              rådgivare som både skapar ordning i redovisningen och kan förklara vad
              siffrorna betyder i praktiken.
            </p>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-600">
              Ambitionen är enkel: att göra ekonomin tydligare, mer förutsägbar och
              mer användbar i det dagliga beslutsfattandet.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50/90 p-8 shadow-[0_24px_60px_-56px_rgba(0,0,0,0.35)]">
              <p className="text-sm font-medium tracking-[0.22em] text-neutral-500 uppercase">
                Vad kunder värdesätter
              </p>
              <ul className="mt-8 space-y-4">
                {trustPoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm leading-6 text-neutral-700"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-neutral-950 p-8 text-white shadow-[0_30px_70px_-55px_rgba(0,0,0,0.45)]">
              <p className="text-sm font-medium tracking-[0.22em] text-neutral-400 uppercase">
                Inriktning
              </p>
              <p className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-balance">
                Tydligare ekonomisk styrning börjar nästan alltid med bättre struktur.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="kontakt" className="px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-7xl rounded-[2.2rem] bg-white/92 px-7 py-12 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.38)] ring-1 ring-black/5 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,23rem)] lg:items-end lg:gap-12">
            <div className="max-w-3xl">
              <p className="text-sm font-medium tracking-[0.22em] text-neutral-500 uppercase">
                Kontakt
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.85rem]">
                Vill du ha en mer strukturerad ekonomifunktion och tydligare underlag för nästa beslut?
              </h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
                Hör av dig för ett första samtal om bokföring, rapportering eller
                rådgivning, så ser vi hur upplägget bäst kan anpassas till din
                verksamhet.
              </p>
            </div>

            <div className="rounded-[2rem] bg-neutral-950 p-7 text-white shadow-[0_35px_80px_-55px_rgba(0,0,0,0.5)] sm:p-8">
              <p className="text-sm font-medium tracking-[0.18em] text-neutral-400 uppercase">
                Kontaktväg
              </p>
              <a
                href="mailto:info@dittforetag.se"
                className="mt-4 block text-2xl font-semibold tracking-[-0.03em] transition hover:text-neutral-300"
              >
                info@dittforetag.se
              </a>
              <p className="mt-2 text-sm text-neutral-400">013-32 85 80</p>
              <a
                href="mailto:info@dittforetag.se"
                className="mt-7 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
              >
                Kontakta oss
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
