import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { WebsitePreview } from "@/components/marketing/website-preview";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import { createMetadata } from "@/lib/metadata";
import { demoProjects, processSteps, services } from "@/lib/site";

export const metadata = createMetadata(
  "Hemsidor för småföretag till fast pris",
  "Professionella, snabba och mobilanpassade hemsidor för småföretag med personlig kontakt och tydligt fast pris.",
  { pathname: "/" }
);

const problems = [
  { title: "Du saknar hemsida", text: "Kunder söker efter dig men hittar ingen tydlig plats som förklarar vad du gör eller hur de tar kontakt." },
  { title: "Sidan känns gammal", text: "Verksamheten har utvecklats, men hemsidan visar inte längre nivån på det arbete du faktiskt levererar." },
  { title: "Mobilen fungerar dåligt", text: "Besökaren behöver zooma, leta eller vänta. Då blir nästa företag i sökresultatet ofta enklare att välja." },
];

const faqs = [
  { question: "Vad behöver jag ha klart innan vi börjar?", answer: "Det räcker att du kan beskriva verksamheten, de viktigaste tjänsterna och vilka kunder du vill nå. Jag hjälper dig att strukturera befintligt material och se vad som saknas." },
  { question: "Ingår domän och publicering?", answer: "Jag hjälper dig med domän och publicering. Eventuella externa kostnader för domän eller särskilda tjänster redovisas tydligt innan något beställs." },
  { question: "Kan jag ändra innehållet senare?", answer: "Ja. Mindre ändringar kan göras separat eller inom Altura Trygg. Större ombyggnader och nya funktioner offereras innan arbetet startar." },
  { question: "Är priserna inklusive moms?", answer: "Nej. Alla priser på webbplatsen är introduktionspriser exklusive moms och gäller den tydligt beskrivna omfattningen." },
  { question: "Bygger du e-handel och avancerade webbappar?", answer: "Inte inom de här paketen. Fokus är tydliga företagshemsidor. Om behovet ligger utanför omfattningen säger jag det tidigt, innan du lägger tid på fel upplägg." },
];

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden pb-16 pt-10 md:pb-24 md:pt-16">
        <SectionContainer>
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
            <div className="rise-in max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#173f35]/12 bg-white/60 px-4 py-2 text-xs font-semibold tracking-[0.13em] text-[#436357] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#e86f44]" /> Din personliga webbstudio
              </div>
              <h1 className="mt-7 text-5xl font-semibold leading-[0.95] tracking-[-0.065em] text-[#173f35] text-balance md:text-7xl lg:text-[5.2rem]">
                Professionella hemsidor för småföretag <span className="text-[#e86f44]">– till fast pris</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#5c6d65] md:text-xl">
                Jag bygger moderna, snabba och mobilanpassade företagshemsidor med personlig kontakt genom hela processen.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/kontakt" className="inline-flex items-center justify-center rounded-full bg-[#e86f44] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_35px_-20px_rgba(156,66,35,.7)] transition hover:-translate-y-0.5 hover:bg-[#d95f35]">Få ett kostnadsfritt förslag <span aria-hidden="true" className="ml-2">→</span></Link>
                <Link href="/exempel" className="inline-flex items-center justify-center rounded-full border border-[#173f35]/15 bg-white/55 px-6 py-3.5 text-sm font-semibold text-[#173f35] transition hover:bg-white">Se exempel</Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#5c6d65]">
                <span>Fast pris</span><span>Mobilanpassat</span><span>Personlig kontakt</span>
              </div>
            </div>

            <div className="rise-in relative [animation-delay:120ms]">
              <div className="absolute -right-14 -top-10 h-48 w-48 rounded-full bg-[#e86f44]/18 blur-2xl" />
              <div className="relative rotate-[1.5deg]">
                <WebsitePreview {...demoProjects[0]} />
              </div>
              <div className="absolute -bottom-7 -left-3 max-w-[15rem] -rotate-2 rounded-[1.25rem] border border-[#173f35]/10 bg-[#fffdf8] p-4 shadow-xl shadow-[#173f35]/10 md:-left-8">
                <p className="text-xs font-bold tracking-[0.15em] text-[#e86f44] uppercase">Byggd för mobilen</p>
                <p className="mt-2 text-sm leading-6 text-[#51635a]">Tydlig, snabb och enkel att kontakta från första besöket.</p>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-16 md:py-24">
        <SectionContainer>
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">Känner du igen läget?</p>
            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#173f35] text-balance md:text-5xl">En hemsida ska hjälpa kunden vidare, inte skapa fler frågetecken.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {problems.map((problem, index) => (
              <article key={problem.title} className="rounded-[2rem] border border-[#173f35]/10 bg-white/65 p-7">
                <span className="text-xs font-bold text-[#e86f44]">0{index + 1}</span>
                <h3 className="mt-8 text-2xl font-semibold tracking-[-0.035em] text-[#173f35]">{problem.title}</h3>
                <p className="mt-4 text-base leading-7 text-[#617169]">{problem.text}</p>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="py-16 md:py-24">
        <SectionContainer>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">Exempel på nivån</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#173f35] md:text-5xl">Tre branscher. Tre tydliga uttryck.</h2>
              <p className="mt-5 text-base leading-7 text-[#617169]">Koncepten visar möjlig leveransnivå och är inte riktiga kundprojekt.</p>
            </div>
            <Link href="/exempel" className="text-sm font-semibold text-[#173f35] underline decoration-[#e86f44] decoration-2 underline-offset-4">Se alla demokoncept</Link>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {demoProjects.map((project) => (
              <article key={project.slug}>
                <WebsitePreview {...project} compact />
                <div className="mt-4 flex items-center justify-between gap-4 px-1"><div><p className="text-xs font-bold tracking-[0.16em] text-[#e86f44] uppercase">{project.label}</p><h3 className="mt-1 font-semibold text-[#173f35]">{project.name}</h3></div><Link href={project.industryHref} className="text-right text-sm text-[#617169] underline decoration-[#e86f44]/60 underline-offset-4">{project.industry}</Link></div>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>

      <section className="py-16 md:py-24">
        <SectionContainer>
          <div className="grid gap-6 rounded-[2.5rem] border border-[#173f35]/10 bg-[#fffdf8] p-7 md:p-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">Hemsida till företag</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#173f35] text-balance md:text-5xl">
                En företagshemsida som är tydlig före den är avancerad.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#617169]">
                Varje sida byggs kring vad kunderna behöver förstå och göra. Du får en genomarbetad struktur, mobilanpassning och grundläggande SEO inom en tydligt beskriven omfattning och till fast pris.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/hemsida-for-malare" className="rounded-[1.35rem] bg-[#eef2ec] p-5 text-sm font-semibold text-[#173f35] transition hover:bg-[#e5ebe4]">Hemsida för målare <span aria-hidden="true">→</span></Link>
              <Link href="/hemsida-for-konsultbolag" className="rounded-[1.35rem] bg-[#eef2ec] p-5 text-sm font-semibold text-[#173f35] transition hover:bg-[#e5ebe4]">Hemsida för konsultbolag <span aria-hidden="true">→</span></Link>
              <Link href="/hemsida-for-salong" className="rounded-[1.35rem] bg-[#eef2ec] p-5 text-sm font-semibold text-[#173f35] transition hover:bg-[#e5ebe4]">Hemsida för salong <span aria-hidden="true">→</span></Link>
              <Link href="/blogg" className="rounded-[1.35rem] bg-[#173f35] p-5 text-sm font-semibold text-white transition hover:bg-[#245448]">Guider inför webbprojektet <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-16 md:py-24">
        <SectionContainer>
          <div className="rounded-[2.75rem] bg-[#173f35] px-6 py-10 text-white md:px-10 md:py-14 lg:px-14">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] text-[#f3b89f] uppercase">Tydliga paket</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-balance md:text-5xl">Du ska veta vad du köper innan vi börjar.</h2>
              <p className="mt-5 text-base leading-7 text-white/65">Introduktionspriser exklusive moms. Inga diffusa timbanker eller överraskningar inom avtalad omfattning.</p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {services.map((service, index) => (
                <article key={service.slug} className={`flex flex-col rounded-[2rem] p-7 ${index === 1 ? "bg-[#e86f44] text-white" : "bg-white/8 text-white"}`}>
                  <p className={`text-xs font-bold tracking-[0.16em] uppercase ${index === 1 ? "text-white/75" : "text-[#f3b89f]"}`}>{service.label}</p>
                  <h3 className="mt-5 text-2xl font-semibold">{service.title}</h3>
                  <p className="mt-3 min-h-20 text-sm leading-7 text-white/70">{service.summary}</p>
                  <p className="mt-7 text-4xl font-semibold tracking-[-0.05em]">{service.price}<span className="ml-1 text-sm tracking-normal text-white/60">{service.suffix}</span></p>
                  <p className="mt-1 text-xs text-white/55">exkl. moms</p>
                  <Link href={service.href} className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#173f35]">Se vad som ingår</Link>
                </article>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>

      <section id="process" className="scroll-mt-28 py-16 md:py-24">
        <SectionContainer>
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
            <div><p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">Så fungerar det</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#173f35] md:text-5xl">Från idé till lanserad sida i fyra lugna steg.</h2><p className="mt-5 text-base leading-7 text-[#617169]">Du behöver inte kunna webb. Jag håller ihop struktur, design och teknik och visar tydligt vad som behövs från dig.</p></div>
            <ol className="grid gap-4 sm:grid-cols-2">
              {processSteps.map((step) => <li key={step.number} className="rounded-[1.75rem] border border-[#173f35]/10 bg-white/65 p-6"><span className="text-xs font-bold text-[#e86f44]">{step.number}</span><h3 className="mt-6 text-xl font-semibold text-[#173f35]">{step.title}</h3><p className="mt-3 text-sm leading-7 text-[#617169]">{step.description}</p></li>)}
            </ol>
          </div>
        </SectionContainer>
      </section>

      <section className="py-16 md:py-24">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[2.25rem] bg-[#e86f44] p-8 text-white md:p-10"><p className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">Personligt hela vägen</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">Hej, jag heter Albin.</h2><p className="mt-6 text-base leading-8 text-white/80">Jag driver Altura Nova och bygger hemsidor för företag som vill se professionella ut utan ett onödigt tungt byråprojekt.</p><p className="mt-4 text-base leading-8 text-white/80">Du har samma kontakt från första brief till lansering. Det gör besluten snabbare och ansvarsfördelningen enkel.</p><Link href="/om" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#173f35]">Läs mer om Altura Nova</Link></div>
            <div className="rounded-[2.25rem] border border-[#173f35]/10 bg-[#fffdf8] p-8 md:p-10"><p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">Vanliga frågor</p><div className="mt-6 divide-y divide-[#173f35]/10">{faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-[#173f35]"><span>{faq.question}</span><span aria-hidden="true" className="text-xl text-[#e86f44] transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl pr-8 text-sm leading-7 text-[#617169]">{faq.answer}</p></details>)}</div></div>
          </div>
        </SectionContainer>
      </section>

      <section className="pb-10 pt-16 md:pt-24">
        <SectionContainer>
          <div className="marketing-grid overflow-hidden rounded-[2.75rem] border border-[#173f35]/10 bg-[#fffdf8] p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div><p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">Kostnadsfritt första steg</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#173f35] md:text-5xl">Berätta kort om företaget.</h2><p className="mt-5 text-base leading-7 text-[#617169]">Jag återkommer normalt inom en arbetsdag med frågor eller ett tydligt nästa steg. Du binder dig inte till något.</p><div className="mt-7 text-sm leading-7 text-[#617169]"><p>{SITE_CONFIG.contact.email}</p><p>{SITE_CONFIG.contact.phoneDisplay}</p></div></div>
              <ContactForm />
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
