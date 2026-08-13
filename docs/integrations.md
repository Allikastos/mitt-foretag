# Integrationsguide

Senast uppdaterad: 2026-08-12

Ingen ny extern tjänst i den här guiden är aktiverad. En koppling får installeras
först när behov, kostnad, personuppgiftsflöde, ägare, testplan och rollback är
godkända. Hemligheter ska ligga i leverantörens eller Vercels servermiljö och
får aldrig klistras in i chatt, kod eller databasens anslutningstabell.

## Gemensam aktiveringsordning

1. Dokumentera varför tjänsten behövs och vilket lokalt flöde den ersätter.
2. Kontrollera aktuell gratisnivå, rörlig kostnad och ett tydligt kostnadstak.
3. Kartlägg exakt vilka person- och företagsuppgifter som lämnar systemet.
4. Granska personuppgiftsbiträdesavtal, dataplats och lagringstid.
5. Välj leverantör och ange endast dess icke-hemliga namn i `HUB_*_PROVIDER`.
6. Lägg API-nycklar och webhook-hemligheter som servervariabler i en testmiljö.
7. Installera leverantörsadaptern bakom befintligt provider-kontrakt.
8. Verifiera signatur, idempotens, tenant-isolering, felhantering och kostnadsgräns.
9. Slå på relevant `HUB_FEATURE_*` sist och endast i kontrollerad förhandsmiljö.
10. Dokumentera ägare, larm, återställning och hur kopplingen stängs av.

## Databas och inloggning

- **Varför och när:** Supabase används redan för Auth och Postgres. Planen ska
  omprövas när kapacitet, återställning, juridik eller kostnad kräver det.
- **Kostnad:** Gratisnivå finns, medan produktionskapacitet och automatisk
  backup beror på vald Supabase-plan. Kontrollera alltid aktuell prissida.
- **Förberedd kod:** `src/lib/supabase.ts`, `src/lib/supabase-server.ts`, RLS,
  organisationsfilter och manuellt typade databaskontrakt.
- **Miljövariabler:** `NEXT_PUBLIC_SUPABASE_URL` och en publishable/anon-nyckel.
  Service role är serverhemlig och får aldrig göras publik.
- **Dashboard och CLI:** Granska Auth, Database, API och Advisors. Lokalt används
  `supabase db reset`, `supabase db lint`, `supabase test db` och
  `supabase gen types typescript --local` först i en separat miljö.
- **Test och rollback:** Kör tenant- och RLS-tester, ta backup och gör ett
  återställningstest före migrering. Rulla tillbaka via en ny additiv migration,
  aldrig genom att radera produktionsdata på chans.
- **Säkerhet:** RLS ska vara på, explicita grants ska vara snäva och service role
  ska bara användas i betrodd serverkod.

## Privat dokumentlagring

- **Varför och när:** Supabase Storage håller filer utanför Postgres och används
  redan för privata hubbdokument. Ompröva vid ökade volymer eller backupkrav.
- **Kostnad:** Gratis startnivå finns; lagring och utgående trafik kan kosta när
  volymen växer.
- **Förberedd kod:** `StorageProvider` och `SupabaseStorageProvider` använder
  organisationsprefix, privata objekt och kortlivade signerade länkar.
- **Miljövariabler:** Samma Supabase-projektvariabler som databasen; ingen publik
  bucket-nyckel ska införas.
- **Dashboard och CLI:** Kontrollera att `hub-documents` är privat och att
  Storage-RLS motsvarar organisationstillhörigheten. Ändra filer via Storage API,
  inte genom direkt SQL mot `storage`-schemat.
- **Test och rollback:** Prova uppladdning, läsning, nekad korsföretagsåtkomst och
  filåterställning. Behåll providerneutrala storage keys vid en migration.
- **Säkerhet:** Logga aldrig signerade länkar eller dokumentinnehåll.

## Bakgrundskö och arbetsflöden

- **Varför och när:** OCR, rapporter, e-post och importer ska inte blockera
  användarens HTTP-anrop. Anslut först när en produktionsworker behövs.
- **Kostnad:** Supabase Queues kan använda befintlig Postgres-miljö; andra
  produkter tar ofta betalt per körning eller exekveringstid.
- **Förberedd kod:** `JobQueueProvider`, `processing_jobs`, lease, heartbeat,
  återförsök och aktivitetssidan. Minnesadaptern är endast för utveckling.
- **Miljövariabler:** `HUB_JOB_QUEUE_PROVIDER`, leverantörens serverhemligheter,
  `HUB_FEATURE_BACKGROUND_JOBS` och `HUB_FEATURE_SAFE_MUTATIONS`.
- **Dashboard och CLI:** Aktivera vald kö i dess dashboard och starta en separat
  worker enligt leverantörens dokumentation. Kör Phase E lokalt före anslutning.
- **Test och rollback:** Testa samtidiga claims, utgångna leases, dubletter,
  avbrott och workerbortfall. Stäng först av flaggan, låt säkert arbete slutföras
  och koppla därefter bort konsumenten.
- **Säkerhet:** Skicka minsta nödvändiga payload, håll workerfunktioner privata
  och använd service role endast i workern.

## Dokumenttolkning och AI

- **Varför och när:** Ska föreslå fakta från kvitton och leverantörsfakturor
  efter att det manuella granskningsflödet är verifierat.
- **Kostnad:** Gratis provkvoter kan finnas; normal kostnad är per sida, dokument,
  token eller modellkörning. Sätt ett organisationsbundet kostnadstak.
- **Förberedd kod:** `DocumentProcessor` returnerar strukturerade förslag och
  `DisabledDocumentProcessor` stoppar användning utan leverantör.
- **Miljövariabler:** `HUB_DOCUMENT_PROCESSOR_PROVIDER`, leverantörens servernyckel
  och `HUB_FEATURE_DOCUMENT_PROCESSING`.
- **Dashboard och CLI:** Skapa projekt och begränsad nyckel först efter beslut.
  Installera officiell SDK när leverantören faktiskt valts, inte i förväg.
- **Test och rollback:** Använd syntetiska dokument, mät kvalitet och kostnad och
  kontrollera att låg säkerhet kräver frågor. Stäng flaggan för omedelbar rollback;
  manuellt flöde ska alltid finnas kvar.
- **Säkerhet:** Ingen rå OCR-text i loggar. AI får aldrig bokföra, godkänna eller
  ändra originalfilen automatiskt.

## Hubbens e-postutskick

- **Varför och när:** Fakturor, uppföljningsdigest och driftmeddelanden behöver
  spårbar leverans. Webbplatsens befintliga Resend-kontaktformulär är separat.
- **Kostnad:** Leverantörer har ofta en begränsad gratisnivå och tar därefter
  betalt efter volym eller plan.
- **Förberedd kod:** `EmailDeliveryProvider` och en avstängd adapter som inte kan
  skicka något av misstag.
- **Miljövariabler:** `HUB_EMAIL_DELIVERY_PROVIDER`, leverantörens API-nyckel,
  verifierad avsändare, webhook-hemlighet och `HUB_FEATURE_EMAIL_AUTOMATION`.
- **Dashboard och CLI:** Verifiera domän, SPF/DKIM, avsändare och webhook i vald
  leverantörs dashboard. Lägg variabler med `vercel env add` först efter beslut.
- **Test och rollback:** Skicka bara till en godkänd testadress, prova bounce,
  dublett och avregistrering. Stäng flaggan och återkalla webhook/nyckel vid rollback.
- **Säkerhet:** Mallar ska få minsta nödvändiga data; fullständiga dokument och
  mottagarlistor får inte hamna i leveransloggar.

## Bankimport

- **Varför och när:** Transaktioner kan förenkla avstämning, men CSV-import ska
  fungera först och alla matchningar ska granskas.
- **Kostnad:** CSV är kostnadsfri. Bank-API eller aggregator kan kosta per konto,
  anslutning eller anrop och kan kräva avtal.
- **Förberedd kod:** `BankImportProvider` och en avstängd adapter. Resultatet är
  transaktionsförslag, aldrig automatiska verifikationer.
- **Miljövariabler:** `HUB_BANK_IMPORT_PROVIDER`, leverantörens servernycklar och
  `HUB_FEATURE_BANK_IMPORT`.
- **Dashboard och CLI:** Registrera redirect-URL, samtyckesflöde och webhook först
  efter juridisk och teknisk granskning. Ingen generell CLI-installation förbereds.
- **Test och rollback:** Testa syntetiskt konto, återkallat samtycke, dubletter,
  valuta och datumgränser. Stäng flaggan, återkalla samtycke och behåll revisionsspår.
- **Säkerhet:** Kryptera tokens, begränsa scopes och logga aldrig fullständiga
  kontoutdrag eller autentiseringsuppgifter.

## Abonnemangsbetalning

- **Varför och när:** Behövs för månadsbetalning när paket, priser, provperiod,
  moms, uppsägning och supportansvar är beslutade.
- **Kostnad:** Stripe eller annan betalleverantör tar vanligen transaktionsavgift
  och kan ha separat kostnad för abonnemangsfunktioner. Kontrollera aktuell modell.
- **Förberedd kod:** `SubscriptionBillingProvider`, avstängd adapter, befintliga
  plan/statusfält och Phase F-idempotens för verifierade webhookhändelser.
- **Miljövariabler:** `HUB_SUBSCRIPTION_BILLING_PROVIDER`, servernyckel, pris-ID,
  webhook-hemlighet och `HUB_FEATURE_SUBSCRIPTION_BILLING`.
- **Dashboard och CLI:** Skapa produkt, återkommande pris, kundportal och signerad
  webhook i leverantörens testläge. Installera officiell SDK först efter valet.
- **Test och rollback:** Testa lyckad, misslyckad och försenad betalning,
  uppgradering, uppsägning, webhookdublett och fel ordning. Stäng checkoutflaggan
  först; avsluta inte kundabonnemang automatiskt som teknisk rollback.
- **Säkerhet:** Kortdata ska aldrig passera hubbens server. Verifiera signaturen
  mot rå body före Phase F-kvittot och behandla varje event idempotent.

## Anropsbegränsning

- **Varför och när:** Behövs före publika eller kostnadsdrivande API:er som AI,
  uppladdning och inbjudningar.
- **Kostnad:** Delad Redis/KV har ofta gratis startnivå och kostnad per kommando,
  lagring eller trafik.
- **Förberedd kod:** `RateLimitProvider`; den avstängda adaptern failar stängt och
  släpper inte igenom ett skyddat anrop.
- **Miljövariabler:** `HUB_RATE_LIMIT_PROVIDER`, server-URL/token och
  `HUB_FEATURE_RATE_LIMITING`.
- **Dashboard och CLI:** Skapa databas i rätt region och begränsa token. Installera
  officiell klient först när leverantören valts.
- **Test och rollback:** Testa gräns, tidsfönster, flera serverinstanser och
  leverantörsbortfall. Stäng det skyddade flödet om tjänsten faller bort; byt inte
  till ett tyst processminne i produktion.
- **Säkerhet:** Lagra hashade ämnesnycklar, inte rå IP, e-post eller användardata.

## Felspårning och driftövervakning

- **Varför och när:** Ska upptäcka fel innan betalande kunder påverkas. Vercel
  Analytics och runtime logs finns, men är inte full hubbspecifik felspårning.
- **Kostnad:** Vercels grundfunktioner beror på plan; externa verktyg kostar ofta
  efter händelser, loggvolym och lagringstid.
- **Förberedd kod:** `ErrorReporter` accepterar bara fel, korrelations-ID och
  primitiv, uttryckligen tillåten kontext. Avstängd adapter skickar ingenting.
- **Miljövariabler:** `HUB_ERROR_REPORTER_PROVIDER`, server-DSN/token och
  `HUB_FEATURE_OBSERVABILITY`.
- **Dashboard och CLI:** Bestäm projekt, miljö, maskningsregler, lagringstid och
  larmmottagare innan officiell SDK installeras.
- **Test och rollback:** Skicka ett syntetiskt fel utan persondata och prova larm.
  Stäng flaggan, ta bort DSN och avinstallera adapter vid rollback.
- **Säkerhet:** Förbjud dokument, tokens, bankdata, full e-post och råa payloads.

## Backup och återställning

- **Varför och när:** Backup är användbar först när återställningen är provad.
  Databas och Storage-objekt måste hanteras som två separata tillgångar.
- **Kostnad:** Supabase ger automatiska dagliga backups på betalda planer. Free
  bör exportera regelbundet. PITR, extern lagring och trafik kan kosta extra.
- **Förberedd kod:** `BackupProvider`, avstängd adapter och integrationsstatus.
- **Miljövariabler:** `HUB_BACKUP_PROVIDER`, serverhemligheter till målarkiv och
  `HUB_FEATURE_EXTERNAL_BACKUPS`.
- **Dashboard och CLI:** Kontrollera Database > Backups. En manuell logisk export
  görs senare med `supabase db dump --linked -f backup.sql` i en godkänd miljö.
  Storage-objekt måste kopieras separat via Storage API.
- **Test och rollback:** Sätt RPO/RTO, verifiera kryptering och återställ en kopia
  i isolerad miljö. Avbryt schemaläggningen och återkalla målarkivets nyckel vid
  rollback utan att radera tidigare verifierade backups.
- **Säkerhet:** Separera backupkonto från driftkonto, kryptera, begränsa åtkomst,
  logga återställningar och prova både databas och filer.

## Phase F:s webhookgräns

`supabase/phase-f.sql` är endast ett lokalt förslag. Det sparar anslutningsstatus
och kvitton för externa events, men inga hemligheter och ingen rå payload.
Webhookmottagaren ska först verifiera leverantörens signatur mot exakt rå body,
beräkna SHA-256, och därefter anropa `private.begin_external_event` med service
role. Samma företag, provider och event-ID kan inte återanvändas med annat
innehåll. Funktionen svarar dessutom om eventet ska behandlas, så en pågående
eller redan slutförd dublett inte körs igen.
