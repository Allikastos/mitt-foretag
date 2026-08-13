import type { HubFeatureFlag } from "../feature-flags.ts";

export const integrationIds = [
  "database",
  "private_storage",
  "document_ai",
  "background_queue",
  "hub_email",
  "bank_import",
  "subscription_billing",
  "rate_limiting",
  "observability",
  "backup_restore",
] as const;

export type IntegrationId = (typeof integrationIds)[number];
export type IntegrationGroup = "foundation" | "business" | "operations";
export type IntegrationReadiness =
  | "code_ready"
  | "configuration_required"
  | "approval_required"
  | "ready_for_test"
  | "active"
  | "attention_required";

export type IntegrationDefinition = {
  id: IntegrationId;
  name: string;
  group: IntegrationGroup;
  description: string;
  dataShared: string;
  cost: string;
  nextStep: string;
  providerContract: string;
  featureFlag: HubFeatureFlag | null;
  note?: string;
};

export type IntegrationRuntimeState = {
  providerSelected: boolean;
  configurationReady: boolean;
  featureEnabled: boolean;
  connectionStatus: "not_connected" | "connected" | "error";
};

export const integrationCatalog: readonly IntegrationDefinition[] = [
  {
    id: "database",
    name: "Databas och inloggning",
    group: "foundation",
    description:
      "Företagsdata, användare och behörigheter lagras i den befintliga Supabase-miljön.",
    dataShared: "Konto-, företags- och verksamhetsdata som hubben behöver.",
    cost: "Följer Supabase-planens lagring, databas och trafik.",
    nextStep:
      "Följ kapacitet, säkerhetsråd och återställningskrav innan fler företag ansluts.",
    providerContract: "Centrala Supabase-klienter med organisationsfilter och RLS",
    featureFlag: null,
  },
  {
    id: "private_storage",
    name: "Privat dokumentlagring",
    group: "foundation",
    description:
      "Kvitton, avtal och fakturor lagras privat och öppnas med kortlivade signerade länkar.",
    dataShared: "Uppladdade filer och tillhörande lagringsmetadata.",
    cost: "Följer Supabase-planens lagring och utgående trafik.",
    nextStep:
      "Testa återställning av både databas och filer innan lagringen används skarpt.",
    providerContract: "StorageProvider",
    featureFlag: null,
  },
  {
    id: "document_ai",
    name: "Dokumenttolkning",
    group: "business",
    description:
      "Kan senare läsa kvitton och leverantörsfakturor, men får bara föreslå uppgifter för manuell granskning.",
    dataShared: "Dokumentinnehåll, leverantörsuppgifter, belopp och datum.",
    cost: "Vanligen rörlig kostnad per sida, dokument eller modellkörning.",
    nextStep:
      "Välj leverantör, godkänn personuppgiftsflödet och sätt kostnadsgränser innan test.",
    providerContract: "DocumentProcessor",
    featureFlag: "documentProcessing",
  },
  {
    id: "background_queue",
    name: "Bakgrundskö och arbetsflöden",
    group: "operations",
    description:
      "Flyttar långsamma jobb som dokumenttolkning och rapporter bort från vanliga sidladdningar.",
    dataShared: "Jobbtyp, objektreferenser och minsta nödvändiga arbetsunderlag.",
    cost: "Kan baseras på körningar, exekveringstid eller databasresurser.",
    nextStep:
      "Välj produktionskö och worker, kör lease- och återförsökstester och aktivera sedan flaggan.",
    providerContract: "JobQueueProvider",
    featureFlag: "backgroundJobs",
    note: "Minneskön i utvecklingsmiljön är aldrig ett produktionsalternativ.",
  },
  {
    id: "hub_email",
    name: "Hubbens e-postutskick",
    group: "business",
    description:
      "Ska kunna skicka fakturor, uppföljningspåminnelser och driftmeddelanden med spårbar leveransstatus.",
    dataShared: "Mottagaradress, mallvariabler och leveransmetadata.",
    cost: "Vanligen abonnemang eller rörlig kostnad efter antal utskick.",
    nextStep:
      "Godkänn mallar, avsändardomän, mottagarregler och loggning innan ett testutskick tillåts.",
    providerContract: "EmailDeliveryProvider",
    featureFlag: "emailAutomation",
    note: "Resend för webbplatsens kontaktformulär är en separat koppling.",
  },
  {
    id: "bank_import",
    name: "Bankimport",
    group: "business",
    description:
      "Kan senare hämta eller läsa transaktioner för avstämning utan att automatiskt bokföra dem.",
    dataShared: "Kontoreferenser, transaktionsdatum, belopp och motpartsuppgifter.",
    cost: "Bank- och aggregatoravgifter kan tillkomma per konto eller anrop.",
    nextStep:
      "Färdigställ CSV-import och revisionsspår före API-avtal, samtyckesflöde och bankkoppling.",
    providerContract: "BankImportProvider",
    featureFlag: "bankImport",
  },
  {
    id: "subscription_billing",
    name: "Abonnemangsbetalning",
    group: "business",
    description:
      "Ska hantera månadsabonnemang, betalningsstatus och en säker kundportal för företagsägaren.",
    dataShared: "Företagsreferens, plan, pris och betalningsleverantörens kund-ID.",
    cost: "Transaktionsavgift och eventuella avgifter för abonnemangsfunktioner.",
    nextStep:
      "Besluta paket, provperiod, moms, uppsägning och pris innan Stripe eller annan leverantör installeras.",
    providerContract: "SubscriptionBillingProvider",
    featureFlag: "subscriptionBilling",
  },
  {
    id: "rate_limiting",
    name: "Anropsbegränsning",
    group: "operations",
    description:
      "Skyddar känsliga API:er, uppladdning och framtida AI-anrop mot missbruk och oväntade kostnader.",
    dataShared: "Hashade eller pseudonyma nycklar, räknare och tidsfönster.",
    cost: "Ofta gratis startnivå, därefter kostnad för kommandon och lagring.",
    nextStep:
      "Fastställ gränser per flöde och välj en delad lagring som fungerar över flera serverinstanser.",
    providerContract: "RateLimitProvider",
    featureFlag: "rateLimiting",
  },
  {
    id: "observability",
    name: "Felspårning och driftövervakning",
    group: "operations",
    description:
      "Samlar säkra felrapporter och mätvärden så att problem kan upptäckas utan att känsliga underlag loggas.",
    dataShared: "Feltyp, kodplats, korrelations-ID och uttryckligen tillåten metadata.",
    cost: "Beror vanligen på antal fel, händelser, loggvolym och lagringstid.",
    nextStep:
      "Definiera maskning, lagringstid och larmnivåer innan en felspårningstjänst kopplas in.",
    providerContract: "ErrorReporter",
    featureFlag: "observability",
    note: "Vercel Analytics mäter webbtrafik men ersätter inte hubbspecifik felspårning.",
  },
  {
    id: "backup_restore",
    name: "Extern backup och återställning",
    group: "operations",
    description:
      "Kompletterar leverantörens standardbackup med dokumenterade exporter och provade återställningar.",
    dataShared: "Krypterade databasexporter, lagringsobjekt och återställningsmetadata.",
    cost: "Lagring, trafik och eventuell punktåterställning kan ge löpande kostnad.",
    nextStep:
      "Bestäm RPO/RTO, separat filbackup och ett återkommande återställningstest innan skarp drift.",
    providerContract: "BackupProvider",
    featureFlag: "externalBackups",
    note: "Databasbackup återställer inte automatiskt borttagna Storage-filer.",
  },
] as const;

export function evaluateIntegrationReadiness(
  state: IntegrationRuntimeState,
): IntegrationReadiness {
  if (state.connectionStatus === "error") {
    return "attention_required";
  }

  if (
    state.connectionStatus === "connected" &&
    state.featureEnabled &&
    state.configurationReady
  ) {
    return "active";
  }

  if (!state.providerSelected) {
    return "code_ready";
  }

  if (!state.configurationReady) {
    return "configuration_required";
  }

  if (!state.featureEnabled) {
    return "approval_required";
  }

  return "ready_for_test";
}

export function integrationReadinessLabel(readiness: IntegrationReadiness) {
  switch (readiness) {
    case "code_ready":
      return "Kod förberedd";
    case "configuration_required":
      return "Konfiguration saknas";
    case "approval_required":
      return "Väntar på godkännande";
    case "ready_for_test":
      return "Klar för test";
    case "active":
      return "Aktiv";
    case "attention_required":
      return "Behöver åtgärdas";
  }
}

export function integrationGroupLabel(group: IntegrationGroup) {
  switch (group) {
    case "foundation":
      return "Befintlig grund";
    case "business":
      return "Affärsflöden";
    case "operations":
      return "Drift och säkerhet";
  }
}
