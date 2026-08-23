import { SITE_CONFIG } from "@/config/site";

export const navigationItems = [
  { href: "/exempel", label: "Exempel" },
  { href: "/tjanster", label: "Paket" },
  { href: "/#process", label: "Så fungerar det" },
  { href: "/om", label: "Om" },
];

export type ServiceSlug = "start" | "foretag" | "trygg";

export type Service = {
  slug: ServiceSlug;
  title: string;
  detailTitle: string;
  label: string;
  href: string;
  price: string;
  suffix?: string;
  summary: string;
  overview: string;
  included: string[];
  exclusions: string[];
  revisions: string;
  delivery: string;
  ctaTitle: string;
  ctaDescription: string;
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "start",
    title: "Altura Start",
    detailTitle: "En skarp ensideshemsida som gör det enkelt att välja ditt företag",
    label: "För den tydliga starten",
    href: "/tjanster/start",
    price: "4 995 kr",
    summary: "En modern och mobilanpassad ensideshemsida med allt det viktigaste på rätt plats.",
    overview: "Passar dig som behöver komma online snabbt eller ersätta en gammal sida med en enkel, professionell presentation.",
    included: [
      "Unik, mobilanpassad ensidesdesign",
      "Företagspresentation och viktigaste tjänsterna",
      "Kontaktformulär och klickbara kontaktvägar",
      "Grundläggande teknisk och innehållsmässig SEO",
      "Hjälp med domän och publicering",
    ],
    exclusions: ["E-handel", "Specialbyggda bokningssystem", "Omfattande textproduktion"],
    revisions: "En samlad korrigeringsomgång",
    delivery: "Normalt 7-10 arbetsdagar efter komplett material och godkänd brief",
    ctaTitle: "Är Altura Start rätt nivå för ditt företag?",
    ctaDescription: "Beskriv verksamheten kort så återkommer jag med ett kostnadsfritt och tydligt förslag.",
    seoTitle: "Altura Start - modern ensideshemsida för företag",
    seoDescription: "Modern ensideshemsida för företag till introduktionspris 4 995 kr exklusive moms.",
  },
  {
    slug: "foretag",
    title: "Altura Företag",
    detailTitle: "Mer utrymme för tjänster, förtroende och en tydlig väg till kontakt",
    label: "För det etablerade företaget",
    href: "/tjanster/foretag",
    price: "7 995 kr",
    summary: "Upp till fem genomarbetade sidor för företag som behöver berätta mer och bygga större förtroende.",
    overview: "Passar verksamheter med flera tjänster, referenser eller målgrupper som behöver en tydligare struktur än en enda sida.",
    included: [
      "Upp till fem tydligt avgränsade sidor",
      "Mobilanpassad design och tydliga kontaktvägar",
      "Kontaktformulär och eventuell karta",
      "Grundläggande SEO",
      "Bearbetning av befintliga texter och hjälp med bildval",
      "Hjälp med domän och publicering",
    ],
    exclusions: ["E-handel", "Avancerade medlemsportaler", "Specialbyggda integrationer"],
    revisions: "Två samlade korrigeringsomgångar",
    delivery: "Tidsplan bestäms efter omfattning och komplett material",
    ctaTitle: "Behöver ditt företag mer än en sida?",
    ctaDescription: "Berätta vad kunderna behöver hitta, så föreslår jag en enkel och rimlig sidstruktur.",
    seoTitle: "Altura Företag - hemsida med upp till fem sidor",
    seoDescription: "Professionell företagshemsida med upp till fem sidor till introduktionspris 7 995 kr exklusive moms.",
  },
  {
    slug: "trygg",
    title: "Altura Trygg",
    detailTitle: "Drift och små ändringar utan att hemsidan lämnas åt sitt öde",
    label: "Löpande trygghet",
    href: "/tjanster/trygg",
    price: "299 kr",
    suffix: "/mån",
    summary: "Hosting, teknisk drift och en liten pott för innehållsändringar varje månad.",
    overview: "Ett frivilligt tillägg för företag som vill att Altura Nova fortsätter ta hand om tekniken efter lansering.",
    included: [
      "Hosting och teknisk drift",
      "Funktionskontroll och rimlig felsupport",
      "Säkerhets- och beroendeunderhåll när Altura ansvarar för tekniken",
      "Mindre innehållsändringar upp till cirka 30 minuter per månad",
    ],
    exclusions: ["Sparad outnyttjad ändringstid", "Ny funktionalitet", "Omdesign och större textarbete"],
    revisions: "Större arbete offereras separat",
    delivery: "Kan väljas efter genomförd webbleverans",
    ctaTitle: "Vill du slippa sköta tekniken själv?",
    ctaDescription: "Lägg till Altura Trygg när hemsidan är klar och få ett tydligt löpande upplägg.",
    seoTitle: "Altura Trygg - hosting och underhåll",
    seoDescription: "Hosting, teknisk drift och mindre innehållsändringar för 299 kr per månad exklusive moms.",
  },
];

export const processSteps = [
  { number: "01", title: "Kort brief", description: "Du berättar om företaget, kunderna och vad hemsidan ska hjälpa dem att göra." },
  { number: "02", title: "Första förslag", description: "Jag tar fram struktur och design så att vi har något konkret att utgå från." },
  { number: "03", title: "Samlad återkoppling", description: "Du lämnar ändringar i en samlad omgång enligt paketets omfattning." },
  { number: "04", title: "Klart för lansering", description: "Sidan färdigställs, kontrolleras på mobil och dator och publiceras efter godkännande." },
];

export const demoProjects = [
  { slug: "malare", label: "Demokoncept", industry: "Måleriföretag", name: "Penseldrag", headline: "Ett hem att trivas i, målat med omsorg.", tone: "clay" as const },
  { slug: "konsult", label: "Demokoncept", industry: "Konsultbolag", name: "Nordform", headline: "Tydligare beslut. Starkare organisationer.", tone: "navy" as const },
  { slug: "salong", label: "Demokoncept", industry: "Salong", name: "Studio Linnea", headline: "En lugn stund, skapad för dig.", tone: "sage" as const },
];

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export { SITE_CONFIG };
