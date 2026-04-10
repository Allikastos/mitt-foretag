import { SITE_CONFIG } from "@/config/site";

export const navigationItems = [
  { href: "/", label: "Hem" },
  { href: "/tjanster", label: "Tjänster" },
  { href: "/om", label: "Om" },
  { href: "/kontakt", label: "Kontakt" },
];

export type ServiceSlug = "redovisning" | "rapportering" | "radgivning";

export type Service = {
  slug: ServiceSlug;
  title: string;
  detailTitle: string;
  label: string;
  href: string;
  summary: string;
  overview: string;
  includedTitle: string;
  includedLead: string;
  included: string[];
  includedOutro?: string;
  secondaryTitle: string;
  secondaryLead: string;
  secondary: string[];
  workTitle: string;
  workParagraphs: string[];
  fitTitle: string;
  fitLead: string;
  fit: string[];
  ctaTitle: string;
  ctaDescription: string;
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "redovisning",
    title: "Redovisning",
    detailTitle: "Redovisning som skapar kontroll - inte bara ordning",
    label: "Redovisning",
    href: "/tjanster/redovisning",
    summary:
      "Redovisning som ger en tydlig och pålitlig bild av verksamheten och skapar bättre kontroll i ekonomin.",
    overview:
      `Redovisning handlar inte bara om att följa regler - det handlar om att skapa en tydlig och pålitlig bild av verksamheten. På ${SITE_CONFIG.name} arbetar vi med redovisning som en grund för bättre kontroll, stabilitet och beslut.`,
    includedTitle: "Det här får du",
    includedLead:
      "Ni får ett redovisningsupplägg som bygger kvalitet i vardagen och stärker ert beslutsunderlag över tid.",
    included: [
      "Löpande bokföring med hög kvalitet",
      "Struktur i ekonomin",
      "Korrekt moms och rapportering",
      "Bokslut och årsredovisning",
      "En stabil grund för analys",
    ],
    includedOutro:
      "Det ger er en trygg ekonomisk grund och gör det lättare att styra verksamheten med precision.",
    secondaryTitle: "Vad tjänsten skapar i praktiken",
    secondaryLead:
      "När redovisningen är stabil blir ekonomin mindre osäker och mer användbar i praktiska affärsbeslut.",
    secondary: [
      "Bättre kontroll över intäkter, kostnader och likviditet",
      "Mindre risk för fel, förseningar och dubbelarbete",
      "En tydligare grund för rapportering och uppföljning",
      "Mer tid för att driva verksamheten framåt",
    ],
    workTitle: "Hur vi arbetar",
    workParagraphs: [
      "Arbetet läggs upp så att ansvar, underlag och återkommande moment blir tydliga från början. Det ska vara enkelt att veta vad som behöver göras och när.",
      "Samarbetet anpassas efter verksamheten, men målet är alltid detsamma: att du ska känna lugn i att redovisningen fungerar och att siffrorna går att lita på.",
    ],
    fitTitle: "Vem det passar för",
    fitLead:
      "Tjänsten passar företag som vill ha ett tryggt och professionellt upplägg utan att bygga upp en tung intern administration.",
    fit: [
      "Vill lägga mindre tid på bokföring och administration",
      "Vill ha bättre struktur i underlag, rutiner och ansvar",
      "Vill kunna lita på att ekonomin är uppdaterad",
    ],
    ctaTitle: "Vill ni ha redovisning som skapar kontroll och stabilitet i vardagen?",
    ctaDescription:
      "Boka ett första samtal så går vi igenom nuläge, arbetssätt och vilket redovisningsupplägg som skapar bäst effekt i er verksamhet.",
    seoTitle: "Redovisning för växande företag",
    seoDescription:
      "Redovisning för växande och ägarledda bolag i Linköping och Sverige med fokus på bokföring, moms, struktur och tydlig ekonomisk kontroll.",
  },
  {
    slug: "rapportering",
    title: "Rapportering",
    detailTitle: "Ekonomisk rapportering för företag som vill fatta bättre beslut snabbare",
    label: "Rapportering",
    href: "/tjanster/rapportering",
    summary:
      "Tydlig ekonomisk rapportering och uppföljning som gör siffrorna användbara i vardagen och lättare att agera på.",
    overview:
      `${SITE_CONFIG.name} hjälper företag att följa upp sin ekonomi löpande genom tydlig rapportering som fokuserar på det som faktiskt spelar roll. Du får bättre överblick, snabbare förståelse för utvecklingen och ett starkare stöd inför beslut.`,
    includedTitle: "Det här ingår i en rapportering som går att agera på",
    includedLead:
      "Rapporteringen ska inte bara visa siffror, utan hjälpa dig att förstå vad som händer i verksamheten och var du behöver agera.",
    included: [
      "Tydlig överblick över intäkter, kostnader och resultat",
      "Uppföljning av utveckling över tid",
      "Fokus på avvikelser, trender och relevanta nyckeltal",
      "Genomgång som gör siffrorna begripliga och användbara",
    ],
    includedOutro:
      "Det gör att rapporteringen blir ett verktyg i styrningen, inte bara en återblick på det som redan har hänt.",
    secondaryTitle: "Vad bättre rapportering ger dig",
    secondaryLead:
      "När uppföljningen blir regelbunden och tydlig blir det lättare att styra verksamheten med bättre tajming och mindre osäkerhet.",
    secondary: [
      "Snabbare beslut med bättre ekonomiskt underlag",
      "Tidigare signaler när marginaler eller kostnader förändras",
      "Bättre förståelse för vad som driver lönsamheten",
      "Mer kontroll i ledning, planering och prioritering",
    ],
    workTitle: "Hur vi arbetar",
    workParagraphs: [
      "Rapporterna tas fram löpande och byggs kring de frågor som är viktigast för verksamheten, inte kring onödig detaljrikedom.",
      "Fokus ligger på att du ska förstå vad siffrorna betyder, vad som har förändrats och vilka beslut som bör prioriteras framåt.",
    ],
    fitTitle: "Vem det passar för",
    fitLead:
      "Tjänsten passar företag som har redovisningen på plats men vill använda ekonomin mer aktivt i styrningen.",
    fit: [
      "Vill följa upp ekonomi och utveckling mer regelbundet",
      "Vill förstå vad siffrorna säger om verksamheten",
      "Vill fatta mer välgrundade beslut i rätt tid",
    ],
    ctaTitle: "Vill du ha rapportering som ger bättre beslutsunderlag månad för månad?",
    ctaDescription:
      "Boka ett första samtal så går vi igenom hur ni följer upp ekonomin idag och vilket rapporteringsupplägg som skulle ge mest värde i verksamheten.",
    seoTitle: "Månadsrapportering och uppföljning",
    seoDescription:
      "Månadsrapportering och uppföljning för växande företag som vill förstå siffrorna bättre och få bättre kontroll över ekonomin.",
  },
  {
    slug: "radgivning",
    title: "Rådgivning",
    detailTitle: "Ekonomisk rådgivning för företag som vill fatta tydligare och mer lönsamma beslut",
    label: "Rådgivning",
    href: "/tjanster/radgivning",
    summary:
      "Ekonomisk rådgivning som gör siffrorna till praktiskt beslutsstöd för lönsamhet, prioriteringar och utveckling.",
    overview:
      `${SITE_CONFIG.name} hjälper företag att förstå sin ekonomi och använda siffrorna som ett verktyg i verksamheten. Målet är bättre prioriteringar, starkare lönsamhet och tydligare vägval.`,
    includedTitle: "Vad rådgivningen innehåller",
    includedLead:
      "Rådgivningen handlar om att gå från rapporterade siffror till konkreta beslut.",
    included: [
      "Tydlig tolkning av vad siffrorna faktiskt visar",
      "Identifiering av vad som driver eller pressar lönsamheten",
      "Prioriterade förbättringsområden med praktisk relevans",
    ],
    includedOutro:
      "I stället för att bara se utfallet i efterhand får ni stöd i vad som bör göras härnäst.",
    secondaryTitle: "Exempel på områden ni kan få stöd i",
    secondaryLead:
      "Rådgivningen anpassas efter verksamhetens situation, men kan till exempel handla om:",
    secondary: [
      "Lönsamhetsanalys",
      "Kostnadsstruktur",
      "Prissättning",
      "Planering framåt",
    ],
    workTitle: "Hur vi arbetar",
    workParagraphs: [
      "Arbetet sker nära verksamheten och utgår från era siffror, mål och aktuella vägval.",
      "Fokus ligger på att göra ekonomin konkret och användbar, så att ni kan agera snabbare och med större säkerhet.",
    ],
    fitTitle: "Vem det passar för",
    fitLead:
      "Tjänsten passar företag som vill ta nästa steg och använda ekonomin mer aktivt i styrning och utveckling.",
    fit: [
      "Vill förbättra lönsamheten",
      "Vill få bättre beslutsunderlag",
      "Vill utveckla verksamheten",
    ],
    ctaTitle: "Vill ni använda ekonomin som ett strategiskt verktyg i företaget?",
    ctaDescription:
      "Boka ett första samtal så går vi igenom nuläge, prioriteringar och vilket rådgivningsupplägg som kan skapa störst affärsnytta.",
    seoTitle: "Ekonomisk rådgivning för bättre beslut",
    seoDescription:
      "Ekonomisk rådgivning för ägarledda bolag som vill förstå siffrorna bättre, förbättra lönsamheten och fatta bättre beslut.",
  },
];

export const workSteps = [
  {
    title: "Inledande genomgång",
    description:
      "Arbetet börjar med att förstå nuläge, prioriteringar och vilka delar av ekonomin som behöver mest struktur och tydlighet.",
  },
  {
    title: "Tydligt upplägg",
    description:
      "Därefter formas ett arbetssätt för redovisning, rapportering och uppföljning som passar verksamhetens nivå och behov.",
  },
  {
    title: "Löpande stöd",
    description:
      "Målet är en lugnare ekonomifunktion, bättre beslutsunderlag och ett mer förutsägbart ekonomiskt arbete över tid.",
  },
];

export const companyTypes = [
  "Växande företag som vill ha bättre ekonomisk struktur",
  "Entreprenörsdrivna bolag med behov av tydligare beslutsunderlag",
  "Konsultbolag och företag i tillväxt med höjda krav på kontroll",
  "Företag i Linköping och i övriga Sverige som söker en mer analytisk ekonomipartner",
];

export const values = [
  {
    title: "Precision",
    description:
      "Arbetet ska hålla hög kvalitet i detaljerna och skapa förtroende i det dagliga ekonomiska arbetet.",
  },
  {
    title: "Tydlighet",
    description:
      "Ekonomin ska vara begriplig och användbar, inte tekniskt korrekt men svår att agera på.",
  },
  {
    title: "Lugnt samarbete",
    description:
      "Samarbetet ska kännas stabilt, tillgängligt och genomtänkt även när tempot i verksamheten är högt.",
  },
  {
    title: "Långsiktighet",
    description:
      "Målet är inte bara att lösa dagens uppgifter, utan att bygga bättre struktur för kommande beslut.",
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export { SITE_CONFIG };
