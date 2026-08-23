import { parseSekToMinor } from "../presentation.ts";
import type { SupportedBusinessEventType } from "../types.ts";
import type {
  BusinessEventInterpretationInput,
  BusinessEventInterpreter,
  InterpretedBusinessEventV1,
  InterpretedPaymentMethod,
} from "./types.ts";
import { validateInterpretedBusinessEventV1 } from "./validation.ts";

type EventSignal = {
  type: SupportedBusinessEventType | null;
  missingVatTreatment: boolean;
  contradiction: string | null;
};

function includesAny(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(phrase));
}

function interpretEventType(text: string): EventSignal {
  const sale = includesAny(text, [
    "sålde",
    "försäljning",
    "kund betalade",
    "kunden betalade",
    "fick betalt",
  ]);
  const purchase = includesAny(text, ["köpte", "inköp", "betalade leverantör"]);
  const ownerDeposit = includesAny(text, ["egen insättning", "privat insättning", "satte in privata"]);
  const ownerWithdrawal = includesAny(text, ["eget uttag", "privat uttag", "tog ut privat"]);
  const transfer = includesAny(text, ["mellan egna konton", "från konto", "flyttade mellan"]);
  const hasVat25 = /(?:25\s*(?:%|procent)\s*moms|moms\s*(?:på|med)?\s*25\s*(?:%|procent))/.test(text);
  const hasNoVat = includesAny(text, ["momsfri", "utan moms", "0 % moms", "0 procent moms"]);
  const noDeductibleVat = includesAny(text, [
    "ej avdragsgill moms",
    "inte avdragsgill moms",
    "utan avdragsgill moms",
  ]);

  const categories = [sale, purchase, ownerDeposit, ownerWithdrawal, transfer].filter(Boolean).length;
  if (categories > 1) {
    return {
      type: null,
      missingVatTreatment: false,
      contradiction: "Texten beskriver flera olika typer av affärshändelser.",
    };
  }

  if (hasVat25 && (hasNoVat || noDeductibleVat)) {
    return {
      type: null,
      missingVatTreatment: false,
      contradiction: "Texten innehåller motsägelsefulla uppgifter om moms.",
    };
  }

  if (ownerDeposit) return { type: "owner_deposit", missingVatTreatment: false, contradiction: null };
  if (ownerWithdrawal) return { type: "owner_withdrawal", missingVatTreatment: false, contradiction: null };
  if (transfer) return { type: "transfer_between_own_accounts", missingVatTreatment: false, contradiction: null };
  if (sale && hasVat25) return { type: "paid_domestic_service_sale_25_vat", missingVatTreatment: false, contradiction: null };
  if (sale && hasNoVat) return { type: "paid_domestic_service_sale_no_vat", missingVatTreatment: false, contradiction: null };
  if (purchase && noDeductibleVat) return { type: "purchase_without_deductible_vat", missingVatTreatment: false, contradiction: null };
  if (purchase && hasVat25) return { type: "paid_domestic_purchase_25_vat", missingVatTreatment: false, contradiction: null };

  return {
    type: null,
    missingVatTreatment: sale || purchase,
    contradiction: null,
  };
}

function interpretAmount(text: string) {
  const match = text.match(/(?:^|\s)(\d+(?:[ .]\d{3})*(?:[,.]\d{1,2})?)\s*(?:kr|kronor)\b/);
  if (!match) return null;

  try {
    return parseSekToMinor(match[1].replace(/\.(?=\d{3}(?:\D|$))/g, " "));
  } catch {
    return null;
  }
}

function shiftIsoDate(isoDate: string, days: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function interpretDate(text: string, referenceDate?: string) {
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch) return shiftIsoDate(isoMatch[1], 0);
  if (referenceDate && /\bidag\b/.test(text)) return shiftIsoDate(referenceDate, 0);
  if (referenceDate && /\bigår\b/.test(text)) return shiftIsoDate(referenceDate, -1);
  return null;
}

function interpretPaymentMethod(
  text: string,
  eventType: SupportedBusinessEventType | null,
): InterpretedPaymentMethod | null {
  if (eventType === "owner_deposit") return "private_funds";
  if (eventType === "owner_withdrawal") return "company_bank_account";
  if (eventType === "transfer_between_own_accounts") return "own_account_transfer";
  if (includesAny(text, ["företagskort", "med kort", "kortbetalning"])) return "company_card";
  if (includesAny(text, ["privata pengar", "privat kort", "privat konto"])) return "private_funds";
  if (includesAny(text, ["kontant", "kontanter"])) return "cash";
  if (includesAny(text, ["företagskonto", "bankkonto", "bankgiro", "via banken"])) {
    return "company_bank_account";
  }
  return null;
}

function interpretTransferAccounts(text: string) {
  const match = text.match(/från\s+(?:konto\s+)?(\d{4})\s+till\s+(?:konto\s+)?(\d{4})/);
  return match
    ? { paymentAccount: match[1], counterAccount: match[2] }
    : { paymentAccount: null, counterAccount: null };
}

function questionForMissing(label: string) {
  switch (label) {
    case "Händelsetyp":
      return "Var det en försäljning, ett inköp, en egen insättning, ett eget uttag eller en överföring?";
    case "Momsbehandling":
      return "Var beloppet inklusive 25 procent moms, momsfritt eller utan avdragsgill moms?";
    case "Belopp":
      return "Vilket totalbelopp betalades? Skriv beloppet följt av kr.";
    case "Datum":
      return "Vilket datum inträffade betalningen? Skriv ÅÅÅÅ-MM-DD, idag eller igår.";
    case "Betalningssätt":
      return "Betalades det via företagets bankkonto, företagskort, privat eller kontant?";
    case "Från- och tillkonto":
      return "Vilka fyrsiffriga konton flyttades pengarna från och till?";
    default:
      return `Komplettera uppgiften: ${label}.`;
  }
}

export class LocalSwedishBusinessEventParser implements BusinessEventInterpreter {
  interpret(input: BusinessEventInterpretationInput): InterpretedBusinessEventV1 {
    const sourceText = input.text.trim();
    const normalized = sourceText.toLocaleLowerCase("sv-SE");
    const eventSignal = interpretEventType(normalized);
    const amountMinor = interpretAmount(normalized);
    const happenedOn = interpretDate(normalized, input.referenceDate);
    const paymentMethod = interpretPaymentMethod(normalized, eventSignal.type);
    const transferAccounts = interpretTransferAccounts(normalized);
    const missingInformation: string[] = [];
    const stopReasons: string[] = [];
    const warnings: string[] = [];

    if (!eventSignal.type) {
      missingInformation.push(eventSignal.missingVatTreatment ? "Momsbehandling" : "Händelsetyp");
    }
    if (amountMinor === null) missingInformation.push("Belopp");
    if (!happenedOn) missingInformation.push("Datum");

    const needsExplicitPayment = eventSignal.type?.startsWith("paid_domestic_") || eventSignal.type === "purchase_without_deductible_vat";
    if (needsExplicitPayment && !paymentMethod) missingInformation.push("Betalningssätt");

    if (
      eventSignal.type === "transfer_between_own_accounts" &&
      (!transferAccounts.paymentAccount || !transferAccounts.counterAccount)
    ) {
      missingInformation.push("Från- och tillkonto");
    }

    if (eventSignal.contradiction) stopReasons.push(eventSignal.contradiction);
    if (paymentMethod === "company_card") {
      stopReasons.push("Företagskort kan vara bankkort eller kreditkort. Den lokala prototypen får inte gissa motkonto.");
    }
    if (paymentMethod === "private_funds" && eventSignal.type?.startsWith("paid_domestic_")) {
      stopReasons.push("Privat betalning av försäljning eller inköp kräver en särskild regel som ännu inte stöds.");
    }
    if (paymentMethod === "cash") {
      stopReasons.push("Kontant betalning stöds inte av de sju reglerna i förhandsversionen.");
    }
    if (
      transferAccounts.paymentAccount &&
      transferAccounts.paymentAccount === transferAccounts.counterAccount
    ) {
      stopReasons.push("Från- och tillkonto måste vara olika.");
    }

    for (const missing of missingInformation) {
      stopReasons.push(`${missing} saknas.`);
    }

    if (eventSignal.type?.includes("purchase")) {
      warnings.push("Kostnadskonto och eventuell avdragsrätt måste granskas mot underlaget.");
    }
    if (eventSignal.type === "paid_domestic_service_sale_no_vat") {
      warnings.push("Orsaken till momsfri försäljning måste granskas.");
    }

    const canCreatePostingPreview = Boolean(
      eventSignal.type && amountMinor && happenedOn && stopReasons.length === 0,
    );
    const confidence = stopReasons.length > 0
      ? "red"
      : warnings.length > 0
        ? "yellow"
        : "green";

    return validateInterpretedBusinessEventV1({
      schemaVersion: "1",
      interpreter: {
        kind: "local_rule_parser",
        id: "altura-sv-business-event-parser",
        version: 1,
      },
      source: { kind: "free_text", text: sourceText },
      eventType: eventSignal.type,
      amountMinor,
      happenedOn,
      paymentMethod,
      paymentAccount: transferAccounts.paymentAccount,
      counterAccount: transferAccounts.counterAccount,
      missingInformation,
      followUpQuestions: missingInformation.map(questionForMissing),
      warnings,
      stopReasons,
      confidence,
      canCreatePostingPreview,
    });
  }
}

export const localSwedishBusinessEventParser = new LocalSwedishBusinessEventParser();
