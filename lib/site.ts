export const siteConfig = {
  name: "Bidewind Consulting",
  tagline: "Ekonomisk styrning och redovisning",
  email: "albinholmberg@icloud.com",
  phoneDisplay: "076-0218499",
  phoneHref: "tel:+46760218499",
  city: "Linköping",
  country: "Sverige",
};

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
    detailTitle: "Redovisning för mindre företag",
    label: "Redovisning",
    href: "/tjanster/redovisning",
    summary:
      "Löpande redovisning, bokföring och moms för mindre företag som vill ha ordning på siffrorna utan att lägga tid på det själva.",
    overview:
      "Jag hjälper mindre företag med löpande redovisning, bokföring och moms. Målet är att du ska ha ordning på siffrorna och en tydlig bild av hur verksamheten går, utan att behöva lägga tid på det själv.",
    includedTitle: "Vad ingår i redovisning?",
    includedLead:
      "Redovisning handlar om att löpande registrera och strukturera företagets ekonomi. Det är grunden för att kunna följa upp verksamheten och fatta rätt beslut.",
    included: [
      "Löpande bokföring",
      "Hantering av moms",
      "Avstämningar",
      "Underlag inför bokslut",
    ],
    includedOutro:
      "Allt görs på ett strukturerat sätt så att siffrorna alltid går att lita på.",
    secondaryTitle: "Varför är redovisning viktigt?",
    secondaryLead:
      "En fungerande redovisning är avgörande för att ha kontroll på företagets ekonomi. Utan tydliga siffror blir det svårt att veta hur verksamheten faktiskt går.",
    secondary: [
      "Kontroll på intäkter och kostnader",
      "Underlag för beslut",
      "Mindre risk för fel",
      "En stabil grund att bygga vidare på",
    ],
    workTitle: "Hur jag arbetar",
    workParagraphs: [
      "Jag arbetar löpande och strukturerat, med fokus på enkelhet och tydlighet. Du ska inte behöva fundera på hur redovisningen fungerar, den ska bara fungera.",
      "Samarbetet anpassas efter din verksamhet, men målet är alltid detsamma: att du ska ha ordning på ekonomin och veta vad siffrorna visar.",
    ],
    fitTitle: "Vem det passar för",
    fitLead:
      "Tjänsten passar mindre företag och konsulter som vill ha en enkel och pålitlig lösning för sin redovisning.",
    fit: [
      "Vill slippa lägga tid på bokföring",
      "Vill ha bättre struktur",
      "Vill känna trygghet i siffrorna",
    ],
    ctaTitle: "Vill du ha hjälp med redovisningen?",
    ctaDescription: "Hör av dig så berättar jag mer.",
    seoTitle: "Redovisning för mindre företag",
    seoDescription:
      "Redovisning för mindre företag i Linköping och Sverige med fokus på bokföring, moms, struktur och tydlig ekonomisk kontroll.",
  },
  {
    slug: "rapportering",
    title: "Rapportering",
    detailTitle: "Månadsrapportering och uppföljning",
    label: "Rapportering",
    href: "/tjanster/rapportering",
    summary:
      "Tydlig månadsrapportering och uppföljning som gör ekonomin enkel att förstå och använda i vardagen.",
    overview:
      "Jag hjälper företag att följa upp sin ekonomi löpande genom tydlig och enkel rapportering. Du får en klar bild av hur verksamheten går och vad du behöver agera på.",
    includedTitle: "Vad är rapportering?",
    includedLead:
      "Rapportering handlar om att sammanställa företagets ekonomi på ett sätt som är lätt att förstå.",
    included: [
      "Intäkter",
      "Kostnader",
      "Resultat",
      "Utveckling över tid",
    ],
    includedOutro:
      "Istället för att bara ha siffror i ett system får du en tydlig överblick över företagets ekonomi.",
    secondaryTitle: "Varför är det viktigt?",
    secondaryLead:
      "Många företag tittar på siffrorna för sällan. Då blir det svårt att upptäcka problem i tid eller förstå vad som fungerar bra.",
    secondary: [
      "Fatta bättre beslut",
      "Följa utvecklingen i företaget",
      "Upptäcka problem tidigt",
      "Få bättre kontroll över ekonomin",
    ],
    workTitle: "Hur jag arbetar",
    workParagraphs: [
      "Jag tar fram rapporter löpande och går igenom dem på ett enkelt och tydligt sätt.",
      "Fokus ligger på att du ska förstå siffrorna, inte bara få dem presenterade. Det innebär att rapporteringen anpassas efter vad som är relevant för just din verksamhet.",
    ],
    fitTitle: "Vem det passar för",
    fitLead:
      "Tjänsten passar företag som vill ha bättre koll på hur verksamheten går, utan att behöva analysera allt själva.",
    fit: [
      "Vill följa upp ekonomin varje månad",
      "Vill förstå vad siffrorna betyder",
      "Vill fatta mer välgrundade beslut",
    ],
    ctaTitle: "Vill du få bättre koll på hur ditt företag går?",
    ctaDescription: "Hör av dig så berättar jag mer.",
    seoTitle: "Månadsrapportering och uppföljning",
    seoDescription:
      "Månadsrapportering och uppföljning för mindre företag som vill förstå siffrorna bättre och få bättre kontroll över ekonomin.",
  },
  {
    slug: "radgivning",
    title: "Rådgivning",
    detailTitle: "Ekonomisk rådgivning för bättre beslut",
    label: "Rådgivning",
    href: "/tjanster/radgivning",
    summary:
      "Ekonomisk rådgivning som hjälper dig att förstå siffrorna och använda dem för bättre beslut i företaget.",
    overview:
      "Jag hjälper företag att förstå sin ekonomi och använda siffrorna som ett verktyg i verksamheten. Målet är att du ska kunna fatta bättre beslut och utveckla företaget i rätt riktning.",
    includedTitle: "Vad innebär ekonomisk rådgivning?",
    includedLead:
      "Ekonomisk rådgivning handlar om att gå från siffror till insikter.",
    included: [
      "Vad siffrorna betyder",
      "Vad som påverkar lönsamheten",
      "Var det finns förbättringspotential",
    ],
    includedOutro:
      "Istället för att bara se resultatet får du hjälp att förstå vad siffrorna faktiskt säger om verksamheten.",
    secondaryTitle: "Vad kan du få hjälp med?",
    secondaryLead:
      "Rådgivningen anpassas efter din verksamhet, men kan till exempel handla om:",
    secondary: [
      "Lönsamhetsanalys",
      "Kostnadsstruktur",
      "Prissättning",
      "Planering framåt",
    ],
    workTitle: "Hur jag arbetar",
    workParagraphs: [
      "Jag arbetar nära verksamheten och utgår från dina siffror och din situation.",
      "Fokus ligger på att göra ekonomin konkret och användbar, så att du kan agera på den i vardagen.",
    ],
    fitTitle: "Vem det passar för",
    fitLead:
      "Tjänsten passar företag som vill ta nästa steg och använda ekonomin mer aktivt.",
    fit: [
      "Vill förbättra lönsamheten",
      "Vill få bättre beslutsunderlag",
      "Vill utveckla verksamheten",
    ],
    ctaTitle: "Vill du använda ekonomin som ett verktyg i ditt företag?",
    ctaDescription: "Hör av dig så berättar jag mer.",
    seoTitle: "Ekonomisk rådgivning för bättre beslut",
    seoDescription:
      "Ekonomisk rådgivning för mindre företag som vill förstå siffrorna bättre, förbättra lönsamheten och fatta bättre beslut.",
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
  "Små och medelstora företag som vill ha bättre ekonomisk struktur",
  "Entreprenörer och ägarledda bolag med behov av tydligare beslutsunderlag",
  "Konsultbolag och växande serviceverksamheter med höjda krav på kontroll",
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
