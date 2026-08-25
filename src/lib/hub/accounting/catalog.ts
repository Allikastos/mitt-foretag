import type { AccountingAccount } from "./types.ts";

export type CatalogAccount = AccountingAccount & {
  group: string;
  keywords: string[];
};

function account(
  number: string,
  name: string,
  kind: AccountingAccount["kind"],
  group: string,
  keywords: string[] = [],
): CatalogAccount {
  return { number, name, kind, group, keywords, reviewRequired: true };
}

// A broad starter catalog for search and manual bookkeeping. It is not a
// licensed replacement for the annually published BAS chart of accounts.
export const accountingAccountCatalog: CatalogAccount[] = [
  account("1010", "Utvecklingsutgifter", "asset", "Immateriella tillgångar"),
  account("1070", "Goodwill", "asset", "Immateriella tillgångar"),
  account("1110", "Byggnader", "asset", "Materiella tillgångar"),
  account("1130", "Mark", "asset", "Materiella tillgångar"),
  account("1210", "Maskiner och andra tekniska anläggningar", "asset", "Materiella tillgångar"),
  account("1220", "Inventarier och verktyg", "asset", "Materiella tillgångar", ["dator", "utrustning"]),
  account("1240", "Bilar och andra transportmedel", "asset", "Materiella tillgångar", ["bil", "fordon"]),
  account("1280", "Pågående nyanläggningar", "asset", "Materiella tillgångar"),
  account("1310", "Andelar i koncernföretag", "asset", "Finansiella tillgångar"),
  account("1350", "Andelar och värdepapper", "asset", "Finansiella tillgångar"),
  account("1380", "Andra långfristiga fordringar", "asset", "Finansiella tillgångar"),
  account("1410", "Lager av råvaror", "asset", "Varulager"),
  account("1460", "Lager av handelsvaror", "asset", "Varulager"),
  account("1510", "Kundfordringar", "asset", "Kortfristiga fordringar", ["faktura", "kund"]),
  account("1580", "Fordringar för kontokort och kuponger", "asset", "Kortfristiga fordringar", ["kort", "stripe"]),
  account("1610", "Kortfristiga fordringar hos anställda", "asset", "Kortfristiga fordringar"),
  account("1630", "Skattekonto", "asset", "Skatt", ["skatteverket"]),
  account("1650", "Momsfordran", "asset", "Moms", ["moms"]),
  account("1680", "Andra kortfristiga fordringar", "asset", "Kortfristiga fordringar"),
  account("1710", "Förutbetalda hyreskostnader", "asset", "Förutbetalda kostnader"),
  account("1790", "Övriga förutbetalda kostnader", "asset", "Förutbetalda kostnader"),
  account("1910", "Kassa", "asset", "Likvida medel", ["kontant"]),
  account("1920", "PlusGiro", "asset", "Likvida medel"),
  account("1930", "Företagskonto", "asset", "Likvida medel", ["bank"]),
  account("1940", "Övriga bankkonton", "asset", "Likvida medel", ["sparkonto"]),
  account("2010", "Eget kapital", "equity", "Eget kapital"),
  account("2012", "Avräkning för skatter och avgifter", "equity", "Eget kapital", ["enskild firma"]),
  account("2013", "Övriga egna uttag", "equity", "Eget kapital", ["privat uttag"]),
  account("2018", "Övriga egna insättningar", "equity", "Eget kapital", ["privat insättning"]),
  account("2081", "Aktiekapital", "equity", "Eget kapital", ["aktiebolag"]),
  account("2091", "Balanserad vinst eller förlust", "equity", "Eget kapital"),
  account("2099", "Årets resultat", "equity", "Eget kapital"),
  account("2350", "Andra långfristiga skulder till kreditinstitut", "liability", "Långfristiga skulder", ["banklån"]),
  account("2390", "Övriga långfristiga skulder", "liability", "Långfristiga skulder", ["lån"]),
  account("2440", "Leverantörsskulder", "liability", "Kortfristiga skulder", ["leverantör", "faktura"]),
  account("2510", "Skatteskulder", "liability", "Skatt"),
  account("2611", "Utgående moms på försäljning, 25 %", "liability", "Moms", ["moms 25"]),
  account("2621", "Utgående moms på försäljning, 12 %", "liability", "Moms", ["moms 12"]),
  account("2631", "Utgående moms på försäljning, 6 %", "liability", "Moms", ["moms 6"]),
  account("2641", "Debiterad ingående moms", "asset", "Moms", ["ingående moms"]),
  account("2650", "Redovisningskonto för moms", "liability", "Moms", ["momsredovisning"]),
  account("2710", "Personalskatt", "liability", "Personal"),
  account("2731", "Avräkning lagstadgade sociala avgifter", "liability", "Personal"),
  account("2890", "Övriga kortfristiga skulder", "liability", "Kortfristiga skulder"),
  account("3001", "Försäljning inom Sverige, 25 % moms", "income", "Försäljning", ["varor", "moms 25"]),
  account("3002", "Försäljning inom Sverige, 12 % moms", "income", "Försäljning", ["moms 12"]),
  account("3003", "Försäljning inom Sverige, 6 % moms", "income", "Försäljning", ["moms 6"]),
  account("3041", "Försäljning tjänster, 25 % moms", "income", "Försäljning", ["tjänst", "moms 25"]),
  account("3042", "Försäljning tjänster, 12 % moms", "income", "Försäljning", ["tjänst", "moms 12"]),
  account("3043", "Försäljning tjänster, 6 % moms", "income", "Försäljning", ["tjänst", "moms 6"]),
  account("3044", "Försäljning tjänster, momsfri", "income", "Försäljning", ["momsfri"]),
  account("3051", "Försäljning varor, 25 % moms", "income", "Försäljning", ["varor"]),
  account("3106", "Försäljning varor till annat EU-land", "income", "EU-försäljning", ["eu"]),
  account("3308", "Försäljning tjänster till annat EU-land", "income", "EU-försäljning", ["eu tjänst"]),
  account("3740", "Öres- och kronutjämning", "income", "Övriga intäkter"),
  account("3900", "Övriga rörelseintäkter", "income", "Övriga intäkter"),
  account("4010", "Inköp av varor och material", "expense", "Varor och material", ["inköp"]),
  account("4056", "Inköp varor från annat EU-land, 25 %", "expense", "Varor och material", ["eu inköp"]),
  account("4535", "Inköp tjänster från annat EU-land, 25 %", "expense", "Varor och material", ["eu tjänst"]),
  account("5010", "Lokalhyra", "expense", "Lokalkostnader", ["hyra"]),
  account("5060", "Städning och renhållning", "expense", "Lokalkostnader"),
  account("5090", "Övriga lokalkostnader", "expense", "Lokalkostnader"),
  account("5410", "Förbrukningsinventarier", "expense", "Förbrukning", ["dator", "utrustning"]),
  account("5420", "Programvaror", "expense", "Förbrukning", ["programvara", "mjukvara", "abonnemang", "saas"]),
  account("5460", "Förbrukningsmaterial", "expense", "Förbrukning"),
  account("5611", "Drivmedel för personbilar", "expense", "Fordon", ["bensin", "diesel", "laddning"]),
  account("5612", "Försäkring och skatt för personbilar", "expense", "Fordon"),
  account("5800", "Resekostnader", "expense", "Resor", ["tåg", "flyg", "hotell"]),
  account("5910", "Annonsering", "expense", "Marknadsföring", ["reklam", "meta", "google ads"]),
  account("6071", "Representation, avdragsgill", "expense", "Representation"),
  account("6072", "Representation, ej avdragsgill", "expense", "Representation"),
  account("6110", "Kontorsmaterial", "expense", "Kontor"),
  account("6212", "Mobiltelefon", "expense", "Kommunikation", ["telefon"]),
  account("6230", "Datakommunikation", "expense", "Kommunikation", ["internet", "bredband"]),
  account("6310", "Företagsförsäkringar", "expense", "Försäkringar"),
  account("6530", "Redovisningstjänster", "expense", "Externa tjänster", ["bokföring", "revisor"]),
  account("6540", "IT-tjänster", "expense", "Externa tjänster", ["webb", "support"]),
  account("6570", "Bankkostnader", "expense", "Externa tjänster", ["bankavgift"]),
  account("6991", "Övriga externa kostnader, avdragsgilla", "expense", "Övriga kostnader"),
  account("6992", "Övriga externa kostnader, ej avdragsgilla", "expense", "Övriga kostnader"),
  account("7010", "Löner till kollektivanställda", "expense", "Personal"),
  account("7210", "Löner till tjänstemän", "expense", "Personal"),
  account("7510", "Arbetsgivaravgifter", "expense", "Personal"),
  account("7830", "Avskrivningar på maskiner och inventarier", "expense", "Avskrivningar"),
  account("8310", "Ränteintäkter", "income", "Finansiella poster", ["ränta"]),
  account("8410", "Räntekostnader", "expense", "Finansiella poster", ["ränta", "lån"]),
  account("8999", "Årets resultat", "expense", "Resultat"),
];

export function searchAccountCatalog(query: string) {
  const normalized = query.trim().toLocaleLowerCase("sv-SE").slice(0, 80);
  if (!normalized) return accountingAccountCatalog;

  return accountingAccountCatalog.filter((item) =>
    [item.number, item.name, item.group, ...item.keywords]
      .join(" ")
      .toLocaleLowerCase("sv-SE")
      .includes(normalized),
  );
}

export function getCatalogAccount(number: string) {
  return accountingAccountCatalog.find((item) => item.number === number);
}
