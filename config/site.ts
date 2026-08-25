const BRAND_NAME = "Altura Nova";

export const SITE_CONFIG = {
  name: BRAND_NAME,
  logoPath: "/loggor/logo-colored-two-rows.png",
  footerLogoPath: "/loggor/logo-white-one-row.png",
  description:
    "Moderna och mobilanpassade hemsidor för företag, personligt framtagna till ett tydligt fast pris.",
  domain: "alturanova.se",
  url: "https://alturanova.se",
  tagline: "Din personliga webbstudio",
  cta: {
    primary: "Få ett kostnadsfritt förslag",
    primaryShort: "Få ett förslag",
    services: "Se paket",
    articles: "Läs artiklar",
    serviceDetails: "Se paketet",
    readArticle: "Läs artikel",
  },
  legalNotice: `Hela processen kan genomföras digitalt, oavsett var ditt företag finns. Alla priser på webbplatsen anges exklusive moms.`,
  contact: {
    email: "kontakt@alturanova.se",
    phoneDisplay: "076-021 84 99",
    phoneHref: "tel:+46760218499",
    country: "Sverige",
  },
} as const;
