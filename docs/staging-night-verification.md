# Stagingverifiering för Altura Nova Hub

Datum: 2026-08-14

## Avgränsning

- Tillåtet projekt: `altura-nova-hub-staging`.
- Verifierad project ref: `jtposcdefsmromnouald`.
- Förbjudet projekt: `Bidewind Consulting`, ref `zshdbqhuiuwjdpsavnml`.
- Endast syntetisk data under `example.test` har använts.
- Ingen Vercel-koppling, deployment, GitHub-push, pull request eller
  produktionsändring har utförts.

## Baslinje och databas

- Branch: `codex/altura-nova-hub-preview`.
- Utgångspunkt: `01672b5 Tighten staging database grants`.
- Lokal och remote migrationshistorik matchar: 9 av 9 migrationer.
- Inga migrationsfiler ändrades och ingen ny migration behövdes.
- Alla 33 publika tabeller har RLS aktiverat.
- `anon` har inga tabellbehörigheter eller körbara `SECURITY DEFINER`-RPC:er.
- `authenticated` saknar `TRUNCATE`, `TRIGGER` och `REFERENCES`.
- Lokal och remote schema-lint är rena.
- Databasen har återställts lokalt från tom miljö och samtliga nio migrationer
  har installerats på nytt.

## Syntetisk stagingseed

Seeden är deterministisk, idempotent och stoppas om staging innehåller en
organisation som inte tillhör den uttryckliga testmängden. Lösenord genereras
slumpmässigt och sparas endast i en temporär fil med rättighet `0600`.

Slutligt antal poster:

| Resurs | Antal |
| --- | ---: |
| Organisationer | 2 |
| Medlemskap | 6 |
| Auth-användare | 6 |
| Kunder | 4 |
| Kontaktpersoner | 2 |
| Uppgifter | 2 |
| Dokument och testfiler | 2 |
| Fakturor | 2 |
| Fakturarader | 2 |
| Affärshändelser | 2 |
| Bokföringsutkast | 2 |
| Processjobb | 2 |
| Aktiviteter | 2 |

Kontostruktur utan lösenord:

- Alpha: `owner.alpha@example.test` - ägare.
- Alpha: `admin.alpha@example.test` - administratör.
- Alpha: `member.alpha@example.test` - medarbetare.
- Alpha: `viewer.alpha@example.test` - läsbehörig.
- Beta: `owner.beta@example.test` - ägare.
- Beta: `member.beta@example.test` - medarbetare.

Säkra kommandon:

```bash
ALTURA_STAGING_SEED_CONFIRMATION=SYNTHETIC_STAGING_ONLY \
  npm run db:seed:staging:synthetic

ALTURA_STAGING_SEED_CONFIRMATION=SYNTHETIC_STAGING_ONLY \
  npm run db:seed:staging:status

ALTURA_STAGING_SEED_CONFIRMATION=SYNTHETIC_STAGING_ONLY \
  npm run db:seed:staging:cleanup
```

Cleanup träffar endast de två fasta seedorganisationerna, deras sex
`example.test`-konton och deras två fasta Storage-sökvägar. Tillfälliga
onboarding- och webbläsarfixtures har separata, ännu snävare cleanup-kommandon.

## Testresultat

- Enhetstester: 84 av 84 passerade.
- pgTAP: 90 av 90 passerade.
- Lokal Auth, REST/API, RPC, Storage och samtidighet: passerade.
- Remote Auth, REST/API, RPC, Storage, RLS, idempotens och samtidighet:
  passerade.
- Seedade roller, kundomfång och tenantgräns: passerade för sex konton.
- Manipulerade UUID:n och `organization_id`: avvisades.
- Cross-tenant-läsning, skrivning och Storage: avvisades.
- Fakturanummer och bokföringspostning under samtidighet: passerade.
- Dokumenthash och dubblettskydd: passerade.
- Jobbidempotens och leasing: passerade.
- ESLint: passerade.
- TypeScript: passerade.
- Next.js `16.2.11` produktionsbuild: passerade.
- Fullständig och production-only `npm audit`: 0 sårbarheter.

## Webbläsarflöden

Följande har verifierats mot stagingappen på separat localhost-port:

- Inloggning, utloggning, sessionsbyte och onboarding med tillfälligt konto.
- Ägare, medarbetare och läsbehörig samt separat Beta-ägarsession.
- Översikt, nyckeltal, döljning och återställning av dashboardsektioner.
- Kunder, kundomfång, uppgifter, dokumentuppladdning och signerad åtkomst.
- Fakturautkast, fakturarad, validering, slutförande och genererad PDF.
- Bokföringssidan och dess tydliga förhandsversionsmärkning.
- Fyra teman med verifierade CSS-variabler och återställd Nova-seed.
- Desktop-sidomeny samt mobil och surfplatta utan horisontell overflow.
- Inga råa databas- eller serverfel och inga console-varningar efter flödena.

HTML5-dragningen av dashboardsektioner kunde inte automatiseras pålitligt i den
inbyggda webbläsaren. Döljning, återställning och sparad anpassning fungerade,
och draggränssnittet finns kvar. Detta bör ingå i den manuella preview-smoken.

## Korrigerade fel

- Mobilvyn visade tidigare hela desktopsidomenyn och sköt innehållet utanför
  första skärmen. Den har ersatts av en kompakt, expanderbar mobilnavigation
  som stänger efter navigering. Desktopbeteendet är oförändrat.
- Stagingens utvecklingskatalog ignoreras nu av både Git och ESLint.
- Remote integrationstestets cleanup kontrollerar fel och tar endast bort sina
  egna genererade organisationer, användare och filer.
- Seeden återställer nu verifierade organisationsstandarder idempotent efter
  ett syntetiskt webbläsartest.

## Security Advisor

Security Advisor har 0 fel och 20 varningar:

- 19 varningar gäller avsiktligt autentiserade `SECURITY DEFINER`-RPC:er. De är
  tenant- och rollkontrollerade och testas i remote-sviten.
- 1 varning gäller att leaked-password protection är avstängt. Funktionen
  kräver Supabase Pro och aktiverades inte eftersom nattprojektet inte får skapa
  kostnader. Starka slumpade testlösenord används. Före produktion ska planen
  och Auth-skyddet beslutas uttryckligen.

## Previewmiljö senare

Följande variabler behövs i Vercel Preview. Hemliga värden ska hämtas direkt
från staging och aldrig dokumenteras i klartext:

- `NEXT_PUBLIC_SUPABASE_URL` - stagingprojektets URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - stagingprojektets publika nyckel.
- `NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT=preview`.
- `NEXT_PUBLIC_HUB_DATA_ENVIRONMENT=test`.
- `NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF` - den förbjudna
  produktionsrefen som fail-closed-jämförelse.
- `HUB_FEATURE_SAFE_MUTATIONS=true`.
- `HUB_FEATURE_ACCOUNTING=true`.
- `HUB_FEATURE_DOCUMENT_PROCESSING=true`.
- Externa leverantörsflaggor för mejl, bank, betalning, AI/OCR, bakgrundsjobb,
  rate limiting, observability och backup ska förbli `false` tills respektive
  leverantör är vald, granskad och uttryckligen godkänd.

Preview behöver ingen service-role-nyckel för de nuvarande användarflödena.
En sådan nyckel får inte läggas i klientvariabler eller `NEXT_PUBLIC_*`.

## Checklista före framtida preview

1. Skapa en separat preview-branch från de lokala stagingcommittarna.
2. Kontrollera åter `jtposcdefsmromnouald` och 9 av 9 migrationer.
3. Lägg endast previewvariablerna ovan i Vercel, scoped till Preview.
4. Bekräfta att ingen variabel pekar på Bidewind-refen eller produktionsdata.
5. Koppla Vercel först efter ett separat uttryckligt godkännande.
6. Pusha preview-branchen först efter ett separat uttryckligt godkännande.
7. Kör login, tenantisolering, dokument, faktura, mobilnavigation och manuell
   dashboard-dragning på den skapade preview-URL:en.
8. Aktivera inte skarp bokföring, mejl, betalning eller externa integrationer.

## Kvarvarande risker

- De 19 privilegierade RPC:erna är avsiktliga men bör granskas på nytt vid varje
  ny migration eller utökad rollmodell.
- Leaked-password protection är inte tillgängligt på nuvarande gratisplan.
- Skarp svensk bokföring kräver fortsatt fackgranskning; gränssnittet är en
  förhandsversion.
- Dashboardens dragning behöver en sista manuell kontroll i riktig preview.

Referenser:

- https://supabase.com/docs/guides/database/database-advisors
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security
