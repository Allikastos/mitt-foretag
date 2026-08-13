# Säkerhetsverifiering inför isolerad pilot

Datum: 2026-08-13

Utgångspunkt: lokal commit `7ccb3fe`

Omfattning: lokal kod, lokal Rancher Desktop/Supabase och npm-registret för
read-only säkerhetsmetadata. Ingen push, deployment eller fjärrdatabas användes.

## Versionsbeslut

- `next` uppgraderades exakt från `16.2.1` till `16.2.11`.
- `eslint-config-next` uppgraderades exakt från `16.2.1` till `16.2.11`.
- `resend` uppgraderades exakt till `6.12.3`, som tar bort den sårbara
  `svix -> uuid`-kedjan.
- React och React DOM behölls på exakt `19.2.4`.
- Supabase-paketen ändrades inte: `@supabase/ssr` är `0.10.0`,
  `@supabase/supabase-js` är `2.101.0` och CLI är `2.114.0` i lockfilen.
- Next.js 16.3, tvingad audit-fix och codemods användes inte.

Next.js 16.2.11 har kompatibla peer-krav för React 19.2.4. Den officiella
säkerhetsreleasen anger 16.2.11 som korrigerad version för den aktiva 16.2-serien.

## Audit före uppgradering

Full audit: 13 paketfynd, fördelade på 1 låg, 4 medelhöga och 8 höga.

Production-only: 10 paketfynd, fördelade på 4 medelhöga och 6 höga.

| Paketfynd | Kedja och produktionsanvändning | Åtgärd |
| --- | --- | --- |
| `next` (hög) | Direkt produktionsramverk; npm samlade 23 Next-advisories i fyndet | Exakt `16.2.11` |
| `postcss` (hög) | `next -> postcss`; produktionsbuild av CSS | Override till minsta säkra `8.5.23` |
| `sharp` (hög) | `next -> sharp`; bildoptimering i produktion | Override till minsta säkra `0.35.0` |
| `ws` (hög) | `@supabase/supabase-js -> realtime-js -> ws`; produktionskod | Lockfil uppdaterad till `8.21.3` inom befintligt intervall |
| `linkify-it` (hög) | `@tiptap/pm -> prosemirror-markdown -> markdown-it -> linkify-it`; rich text | Lockfil uppdaterad till `5.0.2` |
| `markdown-it` (medel) | Samma TipTap-kedja; rich text | Lockfil uppdaterad till `14.3.0` |
| `nanoid` (hög) | PostCSS-kedjan; produktionsbuild | Lockfil uppdaterad till `3.3.18` |
| `resend` (medel) | Direkt produktionsberoende via `svix -> uuid` | Exakt `6.12.3`; sårbar kedja försvann |
| `svix` (medel) | Transitivit via Resend | Försvann med Resend 6.12.3 |
| `uuid` (medel) | `resend -> svix -> uuid` | Försvann med Resend 6.12.3 |

Full audit innehöll dessutom tre utvecklingsfynd: `@babel/core` (låg),
`brace-expansion` (hög) och `js-yaml` (hög). Lockfilen valde korrigerade
versioner inom de redan tillåtna intervallen: `@babel/core 7.29.7`, säkra
`brace-expansion`-versioner och `js-yaml 4.3.1`.

Efter enbart Next-patchen var de nya Next.js-advisories borta, men npm visade
fortfarande samma paketantal eftersom fyndet `next` ärvde separata, nyare
advisories från Nexts inlåsta `postcss` och valfria `sharp`. De två små,
versionslåsta overrides som beskrivs ovan krävdes därför för att stanna i
16.2-serien utan att dölja fynd eller hoppa till 16.3.

Maskinläsbara rapporter finns i denna katalog:

- `npm-audit-before-full.json`
- `npm-audit-before-production.json`
- `npm-audit-after-next-full.json`
- `npm-audit-after-next-production.json`
- `npm-audit-after-full.json`
- `npm-audit-after-production.json`

## Audit efter uppgradering

Full audit: 0 sårbarheter.

Production-only: 0 sårbarheter.

Alla 10 tidigare production-fynd och alla 13 fynd i hela trädet är borta.
Det finns inga kvarvarande låga, medelhöga, höga eller kritiska npm-fynd i
produktions- eller utvecklingsberoenden per kontrollen 2026-08-13.

## Verifiering

- `npm test`: 82 av 82 enhetstester passerade.
- `supabase test db`: 88 av 88 pgTAP-kontroller passerade efter återställning
  från tom lokal databas och explicit syntetisk seed.
- Lokala Auth-, REST/API-, RPC-, Storage- och samtidighetstester passerade.
- `db lint` för `public` och `private`: inga schemafel.
- Security Advisor-kontrollen för det oförändrade lokala schemat: inga problem.
- ESLint, TypeScript och Next.js produktionsbuild passerade med Next 16.2.11.
- Fail-closed-testerna blockerar development/preview mot produktionsmärkt data.
- `.env.local`, Supabase-länkfilen och `.next-local` ignoreras av git; ingen
  hemlighet eller lokal miljöfil finns bland spårade filer.

Det lokala webbläsartestet verifierade inloggning och onboarding, kundskapande,
tenant-isolering mellan två syntetiska organisationer, uppgift,
dokumentuppladdning, fakturautkast, rad, fakturanummer och PDF, bokföringens
förhandsversionsmärkning, ägar-/medarbetar-/läsbehörighet samt responsiv
navigation vid 390x844 och 1280x720. Ett rent slutflöde genom samtliga
hubbsidor gav inga console-varningar, console-fel eller råa serverfel.

Två webbläsartestfel ledde till små korrigeringar: fakturautkast använder nu ett
servergenererat UUID utan ett RLS-känsligt `INSERT ... RETURNING`, och saknade
förutsättningar för fakturaslutförande visas som svensk validering med spärrad
knapp i stället för ett rått serverfel. Läsrollen får inte längre muterande
formulär på list- eller detaljsidor.

## Kvarvarande risk och nästa steg

- `postcss`- och `sharp`-overrides måste omprövas när nästa Next.js-version tas
  in, så att de inte ligger kvar längre än nödvändigt.
- Node visar en icke-säkerhetsrelaterad varning om typelöst ESM-paket under
  testerna. Den påverkar inte testresultatet och motiverar inte en arkitekturändring.
- Bokföring, extern e-post, betalning och andra leverantörsflöden är fortfarande
  avstängda eller tydligt märkta som förhandsversion.
- Performance Advisor har tidigare markerat icke-blockerande optimeringar för
  överlappande läspolicies och två `auth.uid()`-initplaner. Behörighetsutfallet
  är verifierat, men dessa bör optimeras före större datamängder.

Projektet är tekniskt redo för en isolerad preview-push när en separat
Supabase-testmiljö och preview-branch skapas. Previewn ska fortsätta använda
syntetiska data, avstängd skarp bokföring och inga riktiga kunduppgifter.
