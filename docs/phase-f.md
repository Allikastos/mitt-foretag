# Fas F: Säkra externa kopplingar

Senast uppdaterad: 2026-08-14

Fas F är implementerad lokalt som ett svenskt integrationscenter, gemensamma
provider-kontrakt och ett additivt databaskontrakt. Den granskade migrationen är
installerad och verifierad endast i `altura-nova-hub-staging`. Ingen extern
leverantör har köpts, installerats eller aktiverats. Bidewind Consulting och
produktion är orörda.

## Tillgängligt lokalt

- `/hub/integrationer` skiljer på befintlig grund, förberedd kod och aktiva
  kopplingar.
- Ägare/admin ser leverantörsval och funktionsflaggor; andra roller ser bara
  företagsgemensam status.
- Katalogen beskriver datadelning, kostnadstyp, nästa säkra steg och tekniskt
  kontrakt för tio integrationsområden.
- E-post, bank, abonnemang, rate limiting, felrapportering, backup och webhook-
  verifiering har providerneutrala gränser med avstängda standardsvar.
- Saknad rate limiting failar stängt; saknad webhookverifiering accepterar aldrig
  en signatur.
- `supabase/phase-f.sql` lagrar status och event-idempotens utan API-nycklar eller
  rå webhook-payload.

## Säker installationsordning

1. Kör först alla tidigare faser i en separat Supabase-miljö och verifiera dem.
2. Granska `phase-f.sql`, gör den till en tidsstämplad migration och kör lokalt.
3. Kör `supabase db reset`, `supabase db lint` och `supabase test db`.
4. Generera typer och jämför mot `src/lib/supabase.ts`.
5. Välj exakt en leverantör efter godkänd kostnads- och datagranskning.
6. Implementera den officiella adaptern och signaturverifieringen i testläge.
7. Testa samtidiga dubletter, återförsök efter timeout, ändrad payload, events i
   fel ordning och korsföretags-ID.
8. Ange provider-namnet, därefter hemligheter och slå på feature flag sist.

## Avsiktliga begränsningar

Integrationscentret är inte en appbutik och kan inte skapa konton, köpa planer,
lägga in hemligheter eller slå på tjänster. Phase F behandlar inte webhooks själv;
den tar endast emot hash och identitet efter att en framtida serverroute har
verifierat signaturen.
