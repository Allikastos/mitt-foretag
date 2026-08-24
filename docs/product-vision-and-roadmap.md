# Altura Nova Hub: produktvision och roadmap

> **Status från 23 augusti 2026:** Detta är en villkorad långsiktsvision, inte
> den aktuella leveransplanen. Den styrande kortsiktiga strategin finns i
> [`strategic-pivot-2026-08-23.md`](strategic-pivot-2026-08-23.md). Ingen
> utbyggnad mot full Spiris- eller Fortnox-bredd ska prioriteras före bevisad
> efterfrågan, betalningsvilja och återkommande användning.

## Syfte

Det här dokumentet är den gemensamma produktkompassen för Altura Nova Hub.
Tekniska beslut ska stödja en sammanhållen, trygg och lättanvänd arbetsyta för
företag, deras medarbetare och externa ekonomipartners.

Det långsiktiga målet är att **Altura Nova Komplett** ska erbjuda motsvarande
programfunktioner och användarnytta som Spiris breda produktutbud, samlat i ett
abonnemang. Det betyder inte att gränssnitt, texter eller implementation ska
kopieras. Utvecklingen ska ske stegvis, med egen produktidentitet, tydliga
säkerhetsgränser och verifierad svensk domänlogik.

## Produktprinciper

- En kund ska förstå nästa steg utan att kunna bokföring, men alltid kunna se
  hur systemet har tolkat och behandlat informationen.
- Automatisering ska ge förslag, inte dölja beslut. Osäkra eller ofullständiga
  händelser ska stoppas säkert och ställas tillbaka till användaren som tydliga
  frågor.
- Företag kan ha flera ägare eller administratörer och flera medarbetare.
  Behörigheter ska styra både åtgärder och vilka kunder eller uppgifter en person
  får se.
- Läsbehöriga och externa samarbetspartner ska kunna arbeta i samma produkt utan
  att få mer åtkomst än uppdraget kräver.
- Funktioner ska lanseras bakom avgränsningar och funktionsflaggor tills databas,
  behörighet, loggning, återställning och användarflöden är verifierade.

## Planerad introduktionsmodell

Prismodellen är en framtida hypotes, inte ett aktuellt erbjudande eller en aktiv
betalningsimplementation:

- Altura Nova Komplett: **399 kr per månad**, inklusive tre fullständiga
  användare.
- Extra fullständig användare: **50 kr per månad**.
- Läsbehörig, revisor, redovisningskonsult och begränsad underlagslämnare ska
  kunna vara kostnadsfria roller.
- Ingen billing, checkout, prenumerationsdebitering eller automatisk
  åtkomststyrning utifrån betalstatus ska implementeras i den nuvarande fasen.

Priset behöver före skarp lansering valideras mot supportbehov, lagring,
transaktionsvolym, externa integrationskostnader och den slutliga gränsen mellan
fullständig och kostnadsfri användare.

## Informationsarkitektur

Hubbens huvudområden är:

1. Översikt
2. Kunder & affärer
3. Ekonomi
4. Dokument
5. Processer
6. Integrationer
7. Inställningar

Befintliga routes ska bevaras. Navigationen får grupperas visuellt och byggas ut
med undersidor, men routes får inte flyttas eller tas bort utan en separat
migreringsplan.

## Roller och åtkomst

Den långsiktiga modellen skiljer på betalande fullständiga användare och
kostnadsfria samarbetsroller. Åtkomst ska fortfarande bestämmas av faktisk roll
och organisationspolicy, aldrig enbart av prisnivå.

- Ägare och administratörer kan konfigurera organisation, gemensamma fält,
  synlighet och medarbetarbehörigheter.
- Fullständiga medarbetare kan arbeta med tilldelade eller gemensamma kunder
  enligt organisationens policy.
- Läsbehöriga kan se uttryckligen tillåten information men inte ändra den.
- Revisorer och redovisningskonsulter ska få avgränsad granskningsåtkomst.
- Begränsade underlagslämnare ska kunna lämna efterfrågade dokument utan att få
  generell insyn i kund- eller ekonomidata.

## Bokföringens målarkitektur

Bokföringsflödet ska även framöver vara spårbart och uppdelat i tydliga steg:

`källa -> tolkning -> affärshändelse -> deterministisk regel -> utkast -> granskning -> append-only-verifikation -> rapport`

Fritext, dokumenttolkning eller framtida AI får bara skapa ett validerat
tolkningsobjekt. Tolkningen får inte själv spara, godkänna eller bokföra. Ett
konteringsförslag ska alltid byggas av versionsstyrda regler och passera
behörighets-, validerings- och granskningsstegen.

Den första fritextprototypen är lokal och regelbaserad. Den ska inte beskrivas
som AI. Den stöder endast de sju uttryckligen implementerade händelsetyperna och
ska stoppa okända, motsägelsefulla eller ofullständiga uppgifter.

## Stegvis roadmap

1. **Navigation och domängrund:** gemensam informationsarkitektur, roller,
   organisationspolicyer och tydliga produktgränser.
2. **Ekonomiöversikt:** begriplig status, arbetsköer, granskningsbehov och
   säkra genvägar till nästa steg.
3. **Smart bokföringsingång:** lokal fritexttolkning ovanpå sju deterministiska
   regler, med synlig confidence, följdfrågor och stoppskäl.
4. **Bokföringsgrund och rapporter:** kontoplan, perioder, verifikationer,
   huvudbok, resultat- och balansrapporter med obruten spårbarhet.
5. **Leverantörsunderlag:** dokumentinsamling, tolkning, attest och koppling till
   affärshändelser.
6. **Bank och avstämning:** först kontrollerad CSV-import, därefter godkända
   bankintegrationer och avstämningsstöd.
7. **Försäljningsautomation:** offerter, avtal, fakturaflöden, påminnelser och
   kunduppföljning.
8. **Planering och tillgångar:** budget, projekt, kostnadsställen,
   anläggningstillgångar och uppföljning.
9. **Betalda integrationer:** prioriteras först efter tydlig affärsnytta,
   dataskyddsbedömning, kostnadsbeslut och fallbackplan.
10. **Avancerad ekonomi:** lön, bokslut, deklaration, skatt och andra områden som
    kräver särskild juridisk och redovisningsmässig kvalitetssäkring.

Varje steg ska kunna pilotverifieras isolerat. Produktionsdata och
produktionsprojekt får inte användas som testmiljö.

## Nuvarande miljögräns

Supabase-staging är installerad och verifierad separat från Bidewind Consulting
och produktion. Vercel används som kanonisk hostingplattform och preview ska
vara skyddad samt endast använda den isolerade stagingmiljön.
Detta dokument ger inte tillstånd att ändra någon extern miljö, genomföra en
deployment, lägga till en betald tjänst eller aktivera skarp bokföring.

## Beslut inför senare faser

- Exakt vilka behörigheter som skiljer fullständiga och kostnadsfria roller.
- Om extra användare ska räknas per organisation, aktiv månad eller samtidighet.
- Vilka kundfält, uppföljningar och dashboarddelar som ägare får standardisera.
- Vilka meddelanden som får skickas via e-post och vilka samtycken, loggar och
  avregistreringsflöden som krävs.
- Vilka ekonomi- och bankintegrationer som ger tillräcklig nytta för sin kostnad
  och sitt personuppgiftsansvar.
- Vilken kvalitetssäkring och ansvarsfördelning som krävs innan bokföring, lön,
  bokslut eller deklaration får användas skarpt.
