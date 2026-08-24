# Testberedskap för hubben

Status: 2026-08-14. Den lokala valideringen har körts mot en isolerad
Supabase-stack i Rancher Desktop. Samma nio granskade migrationer är installerade
i `altura-nova-hub-staging`, ref `jtposcdefsmromnouald`. Inga instruktioner i
dokumentet ger tillstånd att röra Bidewind Consulting, ref
`zshdbqhuiuwjdpsavnml`, eller någon produktion.

## Granskat nuläge

- `50a8a34` etablerar SaaS-, organisations- och bokföringsgrunden.
- `7f2e3ae` lägger tenantkontroller, idempotens och hårdare databaskontrakt.
- `41595bd` lägger det avgränsade bokföringsflödet bakom avstängda flaggor.
- `70fedd3` lägger manuell dokumentgranskning utan OCR-aktivering.
- `065c675` lägger en beständig jobbmodell; minneskön stoppar produktion.
- `9b6eb15` lägger kontrakt för externa integrationer utan leverantörsanslutning.
- Ingen committad hemlighet, API-nyckel eller produktionsreferens hittades.
- Alla avancerade hubbflaggor är `false` i `.env.example`.
- Lokala och previewmiljöer har uttryckliga datamiljömarkörer och stoppar
  anslutning till produktionsrefen med fail-closed-skydd.

## Miljömodell

Följande publika markörer krävs eftersom även webbläsarens hubbinloggning måste
kunna stoppa fel projekt innan ett auth-anrop görs:

```dotenv
NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT=development
NEXT_PUBLIC_HUB_DATA_ENVIRONMENT=local
NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF=produktionsprojektets_ref
```

Tillåtna kombinationer:

| Körmiljö | Datamiljö | Supabase |
| --- | --- | --- |
| `development` | `local` | Endast localhost eller 127.0.0.1 |
| `development` eller `test` | `test` | Separat projekt, aldrig produktions-ID |
| `preview` | `test` | Separat projekt, aldrig produktions-ID |
| `production` | `production` | Exakt det uttryckligen angivna produktions-ID:t |

Saknad eller motsägelsefull markör stoppar hubben med ett generiskt fel som inte
innehåller URL, projektreferens eller nyckel. Publika bloggläsningar påverkas inte.

## Migrationsordning

`supabase/hub.sql` är fortsatt installationskälla och får inte köras direkt som
uppgraderingsmigration. Generatorn skapar en granskbar baslinje för en tom databas
och tar bort källans återinstallationssatser för policyer, triggers och constraints.
Den genererade baslinjen innehåller inga `drop`, `truncate` eller `delete`.

Efter baslinjen är den låsta ordningen:

1. `phase-b.sql`
2. `accounting.sql`
3. `phase-c.sql`
4. `phase-d.sql`
5. `phase-e.sql`
6. `phase-f.sql`
7. `api-grants.sql`

Ordningen finns maskinläsbart i `supabase/migration-plan.json`. Källorna testas
statiskt mot `drop`, `truncate` och `delete`. Phase B innehåller även de skärpta
RLS- och Storage-policyerna för kundomfång.

Migreringarna genererades lokalt med Supabase CLI 2.114.0:

```bash
ALTURA_MIGRATION_CONFIRMATION=CREATE_FOR_ISOLATED_TEST_ONLY npm run db:migrations:prepare
```

Skriptet använder `supabase migration new` för riktiga, unika timestamps. Det avbryter
om CLI eller lokal config saknas, om en källa innehåller destruktiv SQL eller om
Supabase-katalogen är länkad till ett fjärrprojekt. Kör inte `supabase db pull`
mot produktion som ett bekvämt baslinjesteg utan separat granskning, eftersom
migrationshistoriken kan påverkas.

## Lokal testkörning

Rancher Desktop körs som Docker-kompatibel runtime med Kubernetes avstängt.
Supabase CLI är projektlokalt och exakt låst till 2.114.0. Flödet körs endast
mot projekt-id `altura_nova_hub_local`:

```bash
npx supabase start
npx supabase db reset --local --no-seed
ALTURA_SYNTHETIC_SEED_CONFIRMATION=SYNTHETIC_TEST_DATA_ONLY npm run db:seed:synthetic
npm run db:test -- --local supabase/tests
npm run db:test:integration:local
npm run dev:hub:local
```

Det syntetiska seedet ligger avsiktligt inte i `supabase/seed.sql`, kräver två
sessionsmarkörer och vägrar en databas som innehåller andra organisationer.
Det skapar två företag, samtliga roller och isolerade kunder, uppgifter,
dokumentmetadata, fakturor, bokföringsutkast, jobb och auditposter.

Den lokala API-runnern hämtar URL och tillfälliga lokala nycklar från
`supabase status` i minnet, skriver inte till `.env.local` och vägrar både
fjärrhostar och länkade projekt. Den testar RLS och manipulerade ID:n mellan två
organisationer, owner/member/viewer, privat Storage, korsorganisationsläsning,
radering av olåst fil, spärr för låst original, samtidiga bokföringsanrop,
unika fakturanummer, oföränderliga verifikationer, jobbdeduplicering och atomisk
onboarding med organisation, ägarskap och auditpost i samma RPC.

## Genomförda kontroller

- Två fullständiga `db reset --local --no-seed` från tom databas passerade.
- Syntetisk seed laddades efter båda återställningarna med båda spärrmarkörerna.
- pgTAP-sviten med totalt 90 kontroller passerade.
- Auth-, REST-, RPC-, Storage- och samtidighetstester passerade.
- `db lint` för `public` och `private` rapporterade inga schemafel.
- Supabase Security Advisor rapporterade inga problem.
- Tre duplicerade index togs bort efter Performance Advisor-granskning.
- `npm test` passerar 99 av 99 tester efter navigations- och
  fritexttolkningstesterna. ESLint, TypeScript samt Next.js produktionsbuild
  passerar enligt den senaste fullständiga verifieringen.
- `/hub/login` renderades utan console-fel. En äldre dev-process på port 3000
  saknade miljömarkörer; skyddade `/hub` stoppades då korrekt av fail-closed-spärren.
- Performance Advisor har kvar icke-blockerande varningar om överlappande
  permissiva läspolicies och två `auth.uid()`-initplaner. De bör optimeras före
  större datamängder men ändrar inte det verifierade behörighetsutfallet.

## Avbrott och återställning

- Vid lokalt migrationsfel: stoppa direkt, behåll felutskriften och kör inte nästa fil.
- Rätta källförslaget och skapa en ny lokal databas med `db reset --local`; redigera inte en redan tillämpad remote migration.
- Vid fel i testprojekt: skapa en framåtriktad korrigeringsmigration. Kör ingen manuell `drop` eller dataradering.
- Vid fel före produktion: lämna alla funktionsflaggor avstängda och kassera testmiljön.
- Vid framtida produktionsfel: stoppa utrullningen, inaktivera funktionen och följ den provade återställningsplanen i `docs/backup-and-restore.md`.

## Kvar före pilot

- Kör ett separat återställningstest för databas och Storage-filer.
- Behåll Vercel-previewen skyddad och kopplad endast till den isolerade
  Supabase-stagingmiljön; se `docs/staging-night-verification.md`.
- Next.js är verifierat på exakt `16.2.11`. Både fullständig och production-only
  npm audit rapporterar 0 sårbarheter; se
  `docs/security/pilot-dependency-security.md` för versionsbeslut och testlogg.
- Kör `npm run dev:hub:local` och ett autentiserat visuellt smoke-test efter
  relevanta gränssnittsändringar. Runnern väljer en ledig port utan att ändra
  fjärrmiljöer.
- Optimera överlappande RLS-läspolicies och komplettera index efter verkliga queryplaner.
- Granska resultat och migrationsdiff innan någon fjärrlänkning eller flaggaktivering.
- Håll OCR, bankkoppling, abonnemangsbetalning, e-postautomation och externa köer avstängda.
