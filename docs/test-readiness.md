# Testberedskap för hubben

Status: 2026-08-13. Underlaget gäller commitserien efter `338b0f3` till och med
`9b6eb15` samt den lokala testberedskapscommit som skapas efter denna granskning.
Inga ändringar i dokumentet innebär att SQL får köras mot produktion.

## Granskat nuläge

- `50a8a34` etablerar SaaS-, organisations- och bokföringsgrunden.
- `7f2e3ae` lägger tenantkontroller, idempotens och hårdare databaskontrakt.
- `41595bd` lägger det avgränsade bokföringsflödet bakom avstängda flaggor.
- `70fedd3` lägger manuell dokumentgranskning utan OCR-aktivering.
- `065c675` lägger en beständig jobbmodell; minneskön stoppar produktion.
- `9b6eb15` lägger kontrakt för externa integrationer utan leverantörsanslutning.
- Ingen committad hemlighet, API-nyckel eller produktionsreferens hittades.
- Alla avancerade hubbflaggor är `false` i `.env.example`.
- Den lokala `.env.local` pekar på en fjärr-Supabase men saknar datamiljömarkörer.
  Hubben blockeras därför nu tills miljön klassificerats uttryckligen.

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

`supabase/hub.sql` är en äldre installationskälla. Den innehåller `drop policy`,
`drop trigger` och ersättning av constraints och får därför inte användas som en
uppgraderingsmigration. En granskad, icke-destruktiv baslinjemigration måste först
representera det schema som redan finns.

Efter baslinjen är den låsta ordningen:

1. `phase-b.sql`
2. `accounting.sql`
3. `phase-c.sql`
4. `phase-d.sql`
5. `phase-e.sql`
6. `phase-f.sql`

Ordningen finns maskinläsbart i `supabase/migration-plan.json`. Källorna testas
statiskt mot `drop`, `truncate` och `delete`. Phase B innehåller även de skärpta
RLS- och Storage-policyerna för kundomfång.

När Supabase CLI och Docker finns tillgängliga:

```bash
supabase init
supabase migration new hub_baseline
# Lägg ett separat granskat, icke-destruktivt baslinjeschema i den skapade filen.
ALTURA_MIGRATION_CONFIRMATION=CREATE_FOR_ISOLATED_TEST_ONLY npm run db:migrations:prepare
```

Skriptet använder `supabase migration new` för riktiga timestamps. Det avbryter
om CLI eller baslinje saknas, om en källa innehåller destruktiv SQL eller om
Supabase-katalogen är länkad till ett fjärrprojekt. Kör inte `supabase db pull`
mot produktion som ett bekvämt baslinjesteg utan separat granskning, eftersom
migrationshistoriken kan påverkas.

## Lokal testkörning

Verktyg saknas på den nuvarande datorn: `supabase`, Docker och `psql`. Inget har
installerats automatiskt. När de installerats körs flödet endast lokalt:

```bash
supabase start
supabase db reset --local
PGOPTIONS="-c altura.data_environment=local -c altura.allow_synthetic_seed=SYNTHETIC_TEST_DATA_ONLY" \
  psql postgresql://postgres:postgres@127.0.0.1:54322/postgres \
  -v ON_ERROR_STOP=1 -f supabase/seeds/pilot-synthetic.sql
npm run db:test
```

Det syntetiska seedet ligger avsiktligt inte i `supabase/seed.sql`, kräver två
sessionsmarkörer och vägrar en databas som innehåller andra organisationer.
Det skapar två företag, samtliga roller och isolerade kunder, uppgifter,
dokumentmetadata, fakturor, bokföringsutkast, jobb och auditposter.

Det separata API-testet skapar och städar sina egna lokala användare:

```bash
export SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_ANON_KEY='<lokal anon-nyckel från supabase status>'
export SUPABASE_SERVICE_ROLE_KEY='<lokal service-role-nyckel från supabase status>'
ALTURA_INTEGRATION_TEST_CONFIRMATION=LOCAL_SUPABASE_ONLY npm run db:test:integration
```

Skriptet vägrar fjärrhostar. Det testar RLS och manipulerade ID:n mellan två
organisationer, owner/member/viewer, privat Storage, korsorganisationsläsning,
radering av olåst fil, spärr för låst original, samtidiga bokföringsanrop,
unika fakturanummer, oföränderliga verifikationer och jobbdeduplicering.

## Avbrott och återställning

- Vid lokalt migrationsfel: stoppa direkt, behåll felutskriften och kör inte nästa fil.
- Rätta källförslaget och skapa en ny lokal databas med `db reset --local`; redigera inte en redan tillämpad remote migration.
- Vid fel i testprojekt: skapa en framåtriktad korrigeringsmigration. Kör ingen manuell `drop` eller dataradering.
- Vid fel före produktion: lämna alla funktionsflaggor avstängda och kassera testmiljön.
- Vid framtida produktionsfel: stoppa utrullningen, inaktivera funktionen och följ den provade återställningsplanen i `docs/backup-and-restore.md`.

## Kvar före pilot

- Skapa och granska den verkliga baslinjemigrationen.
- Installera lokal verktygskedja och kör pgTAP- samt API-integrationstesterna.
- Kör ett separat återställningstest för databas och Storage-filer.
- Skapa ett separat Supabase-testprojekt för Vercel preview.
- Granska resultat och migrationsdiff innan någon fjärrlänkning eller flaggaktivering.
- Håll OCR, bankkoppling, abonnemangsbetalning, e-postautomation och externa köer avstängda.
