# Backup och återställning

Denna rutin ska provas mot en isolerad testmiljö innan första piloten. En backup
är inte godkänd förrän en återställning har körts och verifierats.

## Omfattning

- Databas: schema, data, roller, RLS, funktioner och migrationshistorik.
- Supabase Auth: användare och identitetskopplingar enligt vald backupmetod.
- Storage: både metadata i databasen och de faktiska privata filobjekten.
- Konfiguration: Hosting-/Supabase-miljövariabler dokumenteras med namn, aldrig värden.
- Externa leverantörer: kund-ID och eventkvitton, men inga hemligheter i databasen.

En databasdump återställer inte automatiskt borttagna Storage-objekt. Filer måste
exporteras, krypteras och inventeras separat med sökväg, storlek och SHA-256.

## Föreslagna mål

- Pilot-RPO: högst 24 timmars dataförlust tills punktåterställning har verifierats.
- Pilot-RTO: återställning till isolerad miljö inom fyra timmar.
- Månatligt återställningstest under pilot, därefter minst kvartalsvis.
- Backupkopior i separat konto/projekt med minst privilegium och dokumenterad retention.

Målen är produktbeslut och måste godkännas innan skarp drift.

## Säker backupövning

1. Bekräfta skriftligt vilket testprojekt som är källa och vilket tomt testprojekt som är mål.
2. Kontrollera att inget kommando är länkat till produktion.
3. Ta en leverantörsbackup eller schema- och datadump enligt aktuell Supabase-dokumentation.
4. Exportera privata Storage-objekt separat och bygg ett manifest med SHA-256.
5. Kryptera exporterna och lagra nyckeln separat.
6. Återställ endast till det tomma målprojektet.
7. Applicera inga nya migrationer förrän återställd migrationshistorik har granskats.
8. Verifiera tabellantal, tvåorganisationers RLS, roller, fakturor, audit och dokumenthashar.
9. Ladda tillbaka Storage-objekt och verifiera samtliga manifestposter byte för byte.
10. Kör `npm run db:test -- --local supabase/tests`,
    `npm run db:test:integration:local` och en manuell hubb-smoke test.

## Incidentordning

1. Inaktivera berörd funktionsflagga; radera eller skriv inte över bevisdata.
2. Spara korrelations-ID, tidpunkt, deployment och senaste lyckade backup.
3. Bedöm om felet gäller kod, databasmetadata, Auth eller faktiska Storage-filer.
4. Återställ till en isolerad miljö och verifiera innan eventuell trafik flyttas.
5. Använd en framåtriktad korrigeringsmigration för schemafel.
6. Dokumentera förlorat tidsintervall, återställda objekt och manuella efterkontroller.

## Godkännandebevis

För varje övning sparas datum, ansvarig, käll- och målmiljö, backup-ID, filmanifest,
RPO/RTO-resultat, testresultat och avvikelser. Inga råa nycklar, personuppgifter
eller dokumentinnehåll ska läggas i Git eller vanliga applikationsloggar.
