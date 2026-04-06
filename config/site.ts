const BRAND_NAME = "Altura Nova";

export const SITE_CONFIG = {
  name: BRAND_NAME,
  description:
    "Redovisning, rapportering och ekonomisk rådgivning för företag som vill ha bättre kontroll, tydligare siffror och bättre beslutsunderlag.",
  domain: "alturanova.se",
  url: "https://alturanova.se",
  tagline: "Ekonomisk styrning och redovisning",
  cta: {
    primary: "Boka ett första samtal",
    primaryShort: "Boka samtal",
    services: "Se tjänster",
    articles: "Läs artiklar",
    serviceDetails: "Se upplägg",
    readArticle: "Läs artikel",
  },
  legalNotice:
    `${BRAND_NAME} är ett varumärke under etablering. Under uppstartsperioden kan bolaget vara registrerat under ett annat namn.`,
  contact: {
    email: "albinholmberg@icloud.com",
    phoneDisplay: "076-0218499",
    phoneHref: "tel:+46760218499",
    city: "Linköping",
    country: "Sverige",
  },
} as const;
