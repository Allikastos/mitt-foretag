# Altura Nova

Next.js-applikationen innehåller Altura Novas publika webbplats, administration
och den separata kundhubben. Produktmål, prisantaganden och roadmap för hubben
finns i [`docs/product-vision-and-roadmap.md`](docs/product-vision-and-roadmap.md).

## Lokal utveckling

Installera låsta beroenden och starta webbplatsen:

```bash
npm ci
npm run dev
```

Hubben ska köras med den fail-closed lokala Supabase-runnern:

```bash
npm run dev:hub:local
```

Runnern accepterar endast localhost/127.0.0.1 som datamiljö. Använd inte
stagingkommandon eller fjärrdatabas utan ett uttryckligt, avgränsat godkännande.

## Verifiering

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm audit
npm audit --omit=dev
```

Databas-, RLS-, Storage- och samtidighetstesternas säkra lokala ordning finns i
[`docs/test-readiness.md`](docs/test-readiness.md).

## Miljöer

- Produktion och Bidewind Consulting får inte användas för hubbtester.
- Supabase-projektet `altura-nova-hub-staging` är den isolerade testdatabasen.
- `altura-nova-hub-preview` är en separat, inloggningsskyddad Netlify-draft som
  endast får använda staging och syntetiska uppgifter.
- Ingen preview eller lokal körning innebär att skarp bokföring, billing,
  e-postautomation eller externa leverantörer är aktiverade.

Aktuell verifieringsrapport finns i
[`docs/staging-night-verification.md`](docs/staging-night-verification.md).
