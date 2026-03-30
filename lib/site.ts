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
  label: string;
  href: string;
  summary: string;
  overview: string;
  detailLead: string;
  includedTitle: string;
  included: string[];
  examplesTitle: string;
  examples: string[];
  fitTitle: string;
  fit: string[];
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "redovisning",
    title: "Redovisning",
    label: "Redovisning",
    href: "/tjanster/redovisning",
    summary:
      "Löpande redovisning med fokus på struktur, precision och kontinuitet för mindre företag som vill arbeta med bättre kontroll.",
    overview:
      "Redovisningen ska skapa trygghet i vardagen och ge en stabil grund för resten av ekonomiarbetet. Bidewind Consulting hjälper mindre företag att bygga ordning i det löpande arbetet så att bokföring, moms och avstämningar håller en jämn och pålitlig nivå över tid.",
    detailLead:
      "Tyngdpunkten ligger på struktur, kvalitet och tydlighet, inte på ett reaktivt brandsläckningsarbete.",
    includedTitle: "Det här kan ingå i redovisningsarbetet",
    included: [
      "Löpande bokföring och löpande avstämningar",
      "Momsredovisning och stöd kring periodiska rapporter",
      "Struktur för underlag, rutiner och återkommande uppföljning",
      "Bättre ordning inför bokslut, rapportering och fortsatt analys",
    ],
    examplesTitle: "Vad arbetet ska skapa",
    examples: [
      "En mer stabil ekonomifunktion i vardagen",
      "Färre oklarheter kring siffror och underlag",
      "Bättre kontroll över den löpande ekonomiska administrationen",
    ],
    fitTitle: "Vem det passar för",
    fit: [
      "Småföretag som vill få bättre ordning i ekonomin",
      "Konsultbolag och tjänsteföretag med behov av tydliga rutiner",
      "Växande verksamheter som behöver mer struktur utan onödig komplexitet",
    ],
    seoTitle: "Redovisning för småföretag",
    seoDescription:
      "Premium redovisning för småföretag i Linköping och Sverige med fokus på struktur, precision och löpande kontroll.",
  },
  {
    slug: "rapportering",
    title: "Finansiell rapportering",
    label: "Rapportering",
    href: "/tjanster/rapportering",
    summary:
      "Finansiell rapportering som gör siffrorna tydliga och användbara för företagare som vill förstå sin ekonomiska position bättre.",
    overview:
      "Rapportering handlar inte bara om att sammanställa siffror. Den ska skapa insikt. Bidewind Consulting hjälper företag att få tydligare uppföljning, bättre förståelse för utvecklingen i verksamheten och ett mer användbart beslutsunderlag månad för månad.",
    detailLead:
      "Fokus ligger på klarhet i siffrorna och på att lyfta fram det som faktiskt är relevant att agera på.",
    includedTitle: "Exempel på vad rapporteringen kan innehålla",
    included: [
      "Månadsrapport med resultat, balans och kommentarer",
      "Uppföljning av lönsamhet, kostnader och kassaflöde",
      "Nyckeltal som gör det lättare att se trender och avvikelser",
      "Tydligare struktur för att förstå nuläge och utveckling över tid",
    ],
    examplesTitle: "Vad rapporteringen ska bidra med",
    examples: [
      "Bättre förståelse för företagets finansiella position",
      "Större klarhet i hur verksamheten faktiskt utvecklas",
      "Underlag som gör det enklare att prioritera rätt framåt",
    ],
    fitTitle: "Vem det passar för",
    fit: [
      "Företagare som vill förstå sina siffror bättre",
      "Mindre bolag som saknar tydlig löpande uppföljning",
      "Verksamheter i förändring, tillväxt eller med höjda krav på kontroll",
    ],
    seoTitle: "Finansiell rapportering för mindre företag",
    seoDescription:
      "Finansiell rapportering och uppföljning för mindre företag som vill ha tydligare siffror, bättre insikt och starkare beslutsunderlag.",
  },
  {
    slug: "radgivning",
    title: "Ekonomisk analys och rådgivning",
    label: "Rådgivning",
    href: "/tjanster/radgivning",
    summary:
      "Ett mer rådgivande och analytiskt stöd för företag som vill arbeta med lönsamhet, kostnadsstruktur och bättre ekonomiska beslut.",
    overview:
      "Rådgivningsarbetet är till för företag som vill använda ekonomin mer strategiskt. Bidewind Consulting hjälper till att analysera siffror, förstå vad som driver resultatet och skapa större trygghet i viktiga beslut.",
    detailLead:
      "Det här är den mest rådgivande delen av erbjudandet och riktar sig till företag som vill ha mer än traditionell redovisning.",
    includedTitle: "Exempel på rådgivningsområden",
    included: [
      "Lönsamhetsanalys och genomgång av affärsmodell",
      "Kostnadsstruktur och prioriteringar i verksamheten",
      "Kassaflödesmedvetenhet och bättre framförhållning",
      "Beslutsstöd inför tillväxt, förändring eller osäkra perioder",
    ],
    examplesTitle: "Situationer där rådgivning är särskilt värdefull",
    examples: [
      "När resultatet känns otydligt trots hög aktivitet",
      "När företagaren behöver bättre kontroll inför nästa steg",
      "När siffrorna behöver tolkas, inte bara rapporteras",
    ],
    fitTitle: "Vem det passar för",
    fit: [
      "Företag som vill arbeta mer aktivt med lönsamhet och kontroll",
      "Ägarledda bolag som saknar ett tydligt ekonomiskt beslutsstöd",
      "Växande serviceföretag som behöver en mer analytisk partner",
    ],
    seoTitle: "Ekonomisk rådgivning för småföretag",
    seoDescription:
      "Ekonomisk analys och rådgivning för småföretag i Linköping och Sverige med fokus på lönsamhet, kassaflöde och beslutsstöd.",
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
