import { PageIntro } from "@/components/page-intro";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "Integritetspolicy",
  "Så behandlar Altura Nova personuppgifter som lämnas via webbplatsen och kontaktformuläret.",
  { pathname: "/integritet" },
);

const headingClass = "text-xl font-semibold text-[#173f35]";
const linkClass = "font-semibold text-[#173f35] underline decoration-[#e86f44] underline-offset-4";

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Hem", href: "/" }, { label: "Integritet" }]} />
      <PageIntro
        eyebrow="Integritet"
        title="Tydligt om vilka uppgifter som används och varför."
        description="Altura Nova samlar bara in det som behövs för att svara på en förfrågan, förbereda ett eventuellt uppdrag och hålla webbplatsen säker."
      />
      <section className="pb-12">
        <SectionContainer>
          <div className="mx-auto max-w-3xl space-y-8 rounded-[2.25rem] border border-[#173f35]/10 bg-[#fffdf8] p-7 text-sm leading-7 text-[#617169] md:p-10">
            <section>
              <h2 className={headingClass}>Personuppgiftsansvarig</h2>
              <p className="mt-3">Altura Nova drivs av Albin Holmberg, som ansvarar för behandlingen av personuppgifter som beskrivs här.</p>
              <div className="mt-3 rounded-[1.25rem] bg-[#eef2ec] p-5 text-[#52645b]">
                <p><strong className="text-[#173f35]">Verksamhet:</strong> Altura Nova</p>
                <p><strong className="text-[#173f35]">Kontaktperson:</strong> Albin Holmberg</p>
                <p><strong className="text-[#173f35]">E-post:</strong> <a href={`mailto:${SITE_CONFIG.contact.email}`} className={linkClass}>{SITE_CONFIG.contact.email}</a></p>
                <p><strong className="text-[#173f35]">Telefon:</strong> <a href={SITE_CONFIG.contact.phoneHref} className={linkClass}>{SITE_CONFIG.contact.phoneDisplay}</a></p>
              </div>
            </section>

            <section>
              <h2 className={headingClass}>Vilka uppgifter samlas in?</h2>
              <p className="mt-3">När du använder kontaktformuläret behandlas namn, företagsnamn, e-postadress, valfritt telefonnummer, eventuell webbadress och meddelandet du skickar. Webbservern kan även behandla tekniska uppgifter som IP-adress, tidpunkt och information om webbläsaren för drift och säkerhet.</p>
            </section>

            <section>
              <h2 className={headingClass}>Ändamål och rättslig grund</h2>
              <ul className="mt-3 space-y-3">
                <li><strong className="text-[#173f35]">Besvara och bedöma din förfrågan:</strong> behandling är nödvändig för att vidta åtgärder på din begäran innan ett eventuellt avtal ingås.</li>
                <li><strong className="text-[#173f35]">Följa upp dialogen och skydda tjänsten:</strong> behandling sker med stöd av berättigat intresse av att kunna kommunicera med potentiella kunder, förebygga missbruk och felsöka webbplatsen.</li>
                <li><strong className="text-[#173f35]">Genomföra ett uppdrag och följa lag:</strong> om du blir kund behandlas nödvändiga uppgifter för att fullgöra avtal och rättsliga skyldigheter, exempelvis bokföringskrav.</li>
              </ul>
              <p className="mt-3">Kontaktuppgifter används inte för automatiserat beslutsfattande eller profilering.</p>
            </section>

            <section>
              <h2 className={headingClass}>Lagringstid</h2>
              <p className="mt-3">En förfrågan som inte leder till ett kundförhållande raderas normalt senast tolv månader efter den senaste relevanta kontakten. Uppgifter som behöver sparas för ett avtal, en betalning, ett rättsligt anspråk eller en lagstadgad skyldighet sparas under den tid som krävs för respektive ändamål. Tekniska loggar behålls så kort tid som drift- och säkerhetsbehovet tillåter.</p>
            </section>

            <section>
              <h2 className={headingClass}>Leverantörer och mottagare</h2>
              <p className="mt-3">Uppgifterna delas bara när det behövs för att leverera tjänsten. Vercel tillhandahåller webbhosting och serverdrift. Resend överför kontaktmeddelandet via e-post. Behöriga leverantörer behandlar uppgifterna enligt avtal och får inte använda meddelandet för egna marknadsföringsändamål.</p>
              <p className="mt-3">Läs leverantörernas information hos <a href="https://vercel.com/legal/privacy-notice" className={linkClass}>Vercel</a> och <a href="https://resend.com/legal/privacy-policy" className={linkClass}>Resend</a>.</p>
            </section>

            <section>
              <h2 className={headingClass}>Överföringar utanför EU/EES</h2>
              <p className="mt-3">Vercel och Resend har huvudsaklig behandling i USA, vilket innebär att uppgifter kan överföras utanför EU/EES. Leverantörerna anger att överföringarna skyddas genom tillämpliga mekanismer, bland annat EU-kommissionens standardavtalsklausuler och, där det är tillämpligt, EU–US Data Privacy Framework.</p>
            </section>

            <section>
              <h2 className={headingClass}>Dina rättigheter</h2>
              <p className="mt-3">Du kan begära tillgång till dina uppgifter, rättelse, radering eller begränsning och i vissa fall invända mot behandlingen eller få uppgifter överförda. Kontakta <a href={`mailto:${SITE_CONFIG.contact.email}`} className={linkClass}>{SITE_CONFIG.contact.email}</a>. Om du anser att uppgifterna hanteras fel kan du lämna klagomål till <a href="https://www.imy.se/privatperson/utfora-arenden/lamna-ett-klagomal/" className={linkClass}>Integritetsskyddsmyndigheten (IMY)</a>.</p>
            </section>

            <section>
              <h2 className={headingClass}>Kakor och analys</h2>
              <p className="mt-3">Den publika marknadswebbplatsen använder för närvarande ingen beteendebaserad annonsering och sätter inga egna analyskakor. Om det ändras uppdateras den här informationen innan sådan behandling aktiveras.</p>
            </section>

            <p className="border-t border-[#173f35]/10 pt-5 text-xs">Senast uppdaterad 25 augusti 2026.</p>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
