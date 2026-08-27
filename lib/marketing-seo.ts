export type IndustryPage = {
  slug: string;
  industry: string;
  eyebrow: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  demoSlug: string;
  demoName: string;
  intro: string;
  priorities: { title: string; description: string }[];
  sections: string[];
  package: {
    name: string;
    href: string;
    reason: string;
  };
  faqs: { question: string; answer: string }[];
};

export const industryPages: IndustryPage[] = [
  {
    slug: "hemsida-for-malare",
    industry: "måleriföretag",
    eyebrow: "Hemsida för målare",
    title: "En hemsida för målare som gör vägen till offert enkel",
    description:
      "Visa hantverket, bygg förtroende och låt rätt kunder beskriva sitt projekt direkt på en snabb och mobilanpassad företagshemsida.",
    seoTitle: "Hemsida för målare - visa projekt och få offertförfrågningar",
    seoDescription:
      "Professionell hemsida för målare med projektgalleri, tydliga tjänster och enkel offertförfrågan till fast pris.",
    demoSlug: "penseldrag",
    demoName: "Penseldrag",
    intro:
      "Den som söker en målare vill snabbt förstå vilka arbeten du utför, vilket område du arbetar i och hur tidigare projekt ser ut. Sidan behöver fungera lika bra ute på byggplatsen i mobilen som hemma vid datorn.",
    priorities: [
      {
        title: "Visa arbetet visuellt",
        description:
          "Ett tydligt projektgalleri med relevanta före-, efter- och detaljbilder gör kvaliteten lättare att bedöma.",
      },
      {
        title: "Beskriv tjänsterna konkret",
        description:
          "Invändig målning, fasad, tapetsering och andra erbjudanden får egna tydliga ingångar utan onödigt fackspråk.",
      },
      {
        title: "Förenkla offertförfrågan",
        description:
          "Kontaktvägen ska hjälpa kunden ange typ av projekt, omfattning och önskad tid redan från början.",
      },
    ],
    sections: [
      "Tydlig presentation av företaget och arbetsområdet",
      "Tjänster med konkreta exempel på vanliga uppdrag",
      "Projektgalleri med äkta bilder från verksamheten",
      "Kundomdömen när verifierade omdömen finns",
      "Offertformulär och klickbara kontaktvägar",
      "Grundläggande lokal och branschrelevant SEO",
    ],
    package: {
      name: "Altura Företag",
      href: "/tjanster/foretag",
      reason:
        "Passar ofta bäst när tjänster och projekt behöver eget utrymme. För ett smalare erbjudande kan Altura Start räcka som en fokuserad ensideshemsida.",
    },
    faqs: [
      {
        question: "Behöver jag professionella bilder från varje projekt?",
        answer:
          "Nej. Bra mobilbilder kan fungera om de är ljusa, skarpa och visar arbetet tydligt. Jag hjälper dig välja vilka bilder som stärker helheten.",
      },
      {
        question: "Kan hemsidan hjälpa mig få bättre offertförfrågningar?",
        answer:
          "Ja. Ett genomtänkt formulär kan be om projektets typ, plats, omfattning och tidplan så att du får ett bättre första underlag.",
      },
      {
        question: "Kan jag lägga till fler projekt senare?",
        answer:
          "Ja. Projekt kan läggas till som en separat ändring eller inom ett löpande underhållsupplägg, beroende på hur sidan byggs.",
      },
    ],
  },
  {
    slug: "hemsida-for-konsultbolag",
    industry: "konsultbolag",
    eyebrow: "Hemsida för konsultbolag",
    title: "En hemsida för konsultbolag som gör expertisen begriplig",
    description:
      "Förklara värdet, tydliggör erbjudandet och ge beslutsfattaren en trygg väg till första samtalet.",
    seoTitle: "Hemsida för konsultbolag - tydlig expertis och fler samtal",
    seoDescription:
      "Professionell hemsida för konsultbolag med tydligt erbjudande, expertis, case och kontaktvägar till fast pris.",
    demoSlug: "nordform",
    demoName: "Nordform",
    intro:
      "Konsulttjänster är ofta komplexa och svåra att jämföra. En bra webbplats behöver därför översätta kompetens till konkreta problem, arbetssätt och resultat utan att lova mer än verksamheten kan belägga.",
    priorities: [
      {
        title: "Förklara affärsvärdet",
        description:
          "Besökaren ska förstå vilket problem ni löser och för vem innan detaljer om metod och kompetens tar vid.",
      },
      {
        title: "Bygg trovärdighet",
        description:
          "Relevant erfarenhet, verkliga case och tydliga specialistområden hjälper beslutsfattaren att bedöma passformen.",
      },
      {
        title: "Led till rätt samtal",
        description:
          "En tydlig kontaktväg med rätt förväntningar gör det enklare att starta en kvalificerad dialog.",
      },
    ],
    sections: [
      "Ett skarpt huvudbudskap som beskriver kundnyttan",
      "Tjänsteområden och typiska affärssituationer",
      "Metod, process och vad ett samarbete innebär",
      "Verkliga case när underlag och godkännande finns",
      "Presentation av konsulter och relevant erfarenhet",
      "Tydlig väg till behovssamtal eller offert",
    ],
    package: {
      name: "Altura Företag",
      href: "/tjanster/foretag",
      reason:
        "Ger normalt rätt utrymme för tjänster, arbetssätt, expertis och case. En ensam konsult med ett fokuserat erbjudande kan börja med Altura Start.",
    },
    faqs: [
      {
        question: "Hur beskriver vi en komplex konsulttjänst enkelt?",
        answer:
          "Vi börjar i kundens situation och önskade förändring. Metod och facktermer får stödja budskapet, inte bära hela förklaringen.",
      },
      {
        question: "Måste vi ha färdiga kundcase?",
        answer:
          "Nej. Sidan kan lanseras med tydliga tjänster och arbetssätt. Verkliga case läggs till när ni har rätt underlag och kundens godkännande.",
      },
      {
        question: "Kan sidan kopplas till mötesbokning?",
        answer:
          "Ja, en befintlig bokningslänk kan ofta integreras. Mer avancerade bokningsflöden bedöms separat innan arbetet startar.",
      },
    ],
  },
  {
    slug: "hemsida-for-salong",
    industry: "salong",
    eyebrow: "Hemsida för salong",
    title: "En hemsida för salong som leder naturligt till bokning",
    description:
      "Samla behandlingar, priser, känsla och praktisk information i en mobil upplevelse som gör nästa steg självklart.",
    seoTitle: "Hemsida för salong - behandlingar, priser och bokning",
    seoDescription:
      "Professionell hemsida för salong med behandlingar, prisinformation och tydlig väg till bokning till fast pris.",
    demoSlug: "studio-linnea",
    demoName: "Studio Linnea",
    intro:
      "Salongens webbplats behöver skapa rätt känsla, men också svara på praktiska frågor. Besökaren ska snabbt hitta behandling, pris, plats och lediga tider utan att behöva leta i flera kanaler.",
    priorities: [
      {
        title: "Gör behandlingarna överskådliga",
        description:
          "Tydliga kategorier, korta förklaringar och prisinformation hjälper kunden välja rätt innan bokning.",
      },
      {
        title: "Låt uttrycket spegla salongen",
        description:
          "Typografi, färger och äkta bilder ska skapa en sammanhängande känsla utan att göra sidan svår att använda.",
      },
      {
        title: "Prioritera mobilen",
        description:
          "Bokningsknapp, öppettider och kontaktuppgifter ska vara enkla att nå med en hand och utan onödiga steg.",
      },
    ],
    sections: [
      "Behandlingar med beskrivningar och tydliga priser",
      "Framträdande länk till befintligt bokningssystem",
      "Äkta bilder på miljö, team och behandlingar",
      "Öppettider, adress och praktisk information",
      "Vanliga frågor inför besöket",
      "Presentkort eller kampanjer när tekniken redan finns",
    ],
    package: {
      name: "Altura Företag",
      href: "/tjanster/foretag",
      reason:
        "Passar när behandlingar, team och praktisk information behöver delas upp. Altura Start kan fungera för en mindre salong med ett koncentrerat utbud.",
    },
    faqs: [
      {
        question: "Kan ni bygga ett nytt bokningssystem?",
        answer:
          "Specialbyggda bokningssystem ingår inte i paketen. Däremot kan sidan normalt länka tydligt till ett bokningssystem som salongen redan använder.",
      },
      {
        question: "Behöver alla behandlingar stå på startsidan?",
        answer:
          "Nej. Ett större utbud blir ofta tydligare på en egen behandlingssida, medan de viktigaste valen lyfts fram på startsidan.",
      },
      {
        question: "Kan priser ändras efter lansering?",
        answer:
          "Ja. Prisändringar kan göras separat eller inom ett underhållsupplägg, beroende på hur ofta innehållet behöver uppdateras.",
      },
    ],
  },
];

export type MarketingArticleSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type MarketingArticle = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  excerpt: string;
  readTime: string;
  intro: string[];
  sections: MarketingArticleSection[];
  conclusion: string;
};

export const marketingArticles: MarketingArticle[] = [
  {
    slug: "vad-kostar-en-hemsida-for-ett-smaforetag-2026",
    title: "Vad kostar en hemsida för ett småföretag 2026?",
    seoTitle: "Vad kostar en hemsida för ett småföretag 2026?",
    description:
      "En konkret guide till priset på en företagshemsida, vad som påverkar kostnaden och vad du bör jämföra mellan olika offerter.",
    excerpt:
      "Prisnivåer, kostnadsdrivare och en enkel modell för att jämföra hemsideofferter utan att bara välja lägsta pris.",
    readTime: "7 min läsning",
    intro: [
      "En professionell hemsida för ett småföretag kan kosta från några tusenlappar till betydligt större belopp. Skillnaden beror framför allt på omfattning, innehåll, designnivå och vilka funktioner som faktiskt behöver byggas.",
      "Det mest användbara är därför inte ett enda genomsnittspris, utan att förstå vad som ingår och vilken nivå som är rimlig för företagets mål.",
    ],
    sections: [
      {
        heading: "Tre vanliga prisnivåer",
        bullets: [
          "En enkel sida från en fast grundlayout kan passa när texter och bilder redan är klara och behovet är begränsat.",
          "En unik ensideshemsida passar företag som behöver presentera erbjudandet tydligt men inte har många separata tjänsteområden.",
          "En företagshemsida med flera sidor passar när tjänster, case, team eller målgrupper behöver eget utrymme.",
        ],
        paragraphs: [
          "Altura Mini kostar 2 995 kr exklusive moms inom sin avgränsade pilotomfattning. Altura Start kostar 4 995 kr och Altura Företag 7 995 kr exklusive moms. Priserna gäller den beskrivna omfattningen, inte alla tänkbara webbprojekt.",
        ],
      },
      {
        heading: "Vad påverkar kostnaden mest?",
        bullets: [
          "Antal sidor och hur olika innehållstyper ska struktureras.",
          "Om designen utgår från en fast layout eller tas fram unikt.",
          "Hur mycket hjälp som behövs med texter, bilder och budskap.",
          "Integrationer, bokning, e-handel eller annan specialfunktionalitet.",
          "Antal korrigeringsomgångar och stöd efter lansering.",
        ],
        paragraphs: [
          "En billig start kan bli dyr om viktiga delar saknas och måste köpas till senare. Samtidigt finns ingen anledning att beställa femton sidor när en fokuserad ensideshemsida löser uppgiften bättre.",
        ],
      },
      {
        heading: "Så jämför du offerter rättvist",
        bullets: [
          "Kontrollera exakt hur många sidor och korrigeringsomgångar som ingår.",
          "Fråga vem som ansvarar för texter, bilder, domän och publicering.",
          "Se om mobilanpassning, grundläggande SEO och kontaktformulär ingår.",
          "Be om tydlighet kring löpande kostnader och vem som äger innehållet.",
        ],
      },
      {
        heading: "Vilket paket passar?",
        paragraphs: [
          "Har du färdigt material och accepterar en fast grundlayout kan Altura Mini vara tillräckligt. Behöver du ett unikt uttryck på en sida är Altura Start det naturliga insteget. När flera tjänster eller mer förtroendebyggande innehåll behöver separata sidor passar Altura Företag bättre.",
        ],
      },
    ],
    conclusion:
      "Rätt pris är det som ger företaget en tydlig, trovärdig och användbar webbplats utan att du betalar för onödig omfattning. Be alltid om ett fast beskrivet innehåll innan du jämför totalsumman.",
  },
  {
    slug: "vad-ska-inga-i-en-professionell-foretagshemsida",
    title: "Vad ska ingå i en professionell företagshemsida?",
    seoTitle: "Vad ska ingå i en professionell företagshemsida?",
    description:
      "En praktisk checklista över innehåll, teknik och kontaktvägar som en modern företagshemsida bör innehålla.",
    excerpt:
      "En tydlig checklista för budskap, mobilanpassning, kontakt, SEO och teknik innan du beställer en ny företagshemsida.",
    readTime: "6 min läsning",
    intro: [
      "En professionell företagshemsida ska inte bara se modern ut. Den ska hjälpa rätt besökare förstå erbjudandet, känna förtroende och ta ett tydligt nästa steg.",
      "Exakt innehåll varierar mellan branscher, men några grunddelar bör nästan alltid finnas med.",
    ],
    sections: [
      {
        heading: "Ett tydligt huvudbudskap",
        paragraphs: [
          "Den första skärmen bör svara på vad företaget erbjuder, för vem och vad besökaren kan göra härnäst. Kreativa formuleringar fungerar bäst när de fortfarande är konkreta.",
        ],
      },
      {
        heading: "Innehåll som bygger förtroende",
        bullets: [
          "Tjänster beskrivna utifrån kundens behov.",
          "En trovärdig presentation av företaget och personerna bakom.",
          "Äkta projekt, case eller omdömen när sådana finns och får användas.",
          "Vanliga frågor som undanröjer osäkerhet före kontakt.",
        ],
      },
      {
        heading: "Kontaktvägar som fungerar",
        paragraphs: [
          "Telefon, e-post och formulär ska vara enkla att hitta. Formuläret bör fråga efter tillräckligt mycket för ett bra första svar, men inte så mycket att det blir ett hinder.",
        ],
      },
      {
        heading: "Teknisk grund",
        bullets: [
          "Mobilanpassad layout och läsbar typografi.",
          "Snabb laddning och optimerade bilder.",
          "Säker anslutning, fungerande formulär och tydlig integritetspolicy.",
          "Unika sidtitlar, beskrivningar, rubriker och en korrekt sitemap.",
          "Tillgänglig navigation och tydliga fokusmarkeringar för tangentbord.",
        ],
      },
      {
        heading: "Vad som inte alltid behöver ingå",
        paragraphs: [
          "E-handel, kundportal, avancerad bokning och specialintegrationer är separata behov. De ska bara byggas när de löser ett verkligt problem, inte för att få en längre funktionslista.",
        ],
      },
    ],
    conclusion:
      "En bra företagshemsida är tydlig före den är avancerad. Börja med kundens viktigaste frågor och bygg bara den struktur och teknik som behövs för att svara på dem.",
  },
  {
    slug: "ensideshemsida-eller-flera-sidor",
    title: "Ensideshemsida eller flera sidor - vad passar ditt företag?",
    seoTitle: "Ensideshemsida eller flera sidor - vad passar företaget?",
    description:
      "Jämför en ensideshemsida med en företagswebb i flera sidor och välj rätt struktur för erbjudande, SEO och budget.",
    excerpt:
      "När räcker en sida, och när behöver tjänster och innehåll delas upp? Här är för- och nackdelarna som påverkar valet.",
    readTime: "6 min läsning",
    intro: [
      "Valet mellan en ensideshemsida och flera sidor handlar mindre om företagets storlek och mer om hur mycket besökaren behöver förstå innan kontakt.",
      "En välgjord enda sida kan vara starkare än fem tunna undersidor. Men en längre webbplats ger mer utrymme när tjänster, målgrupper och sökbehov skiljer sig åt.",
    ],
    sections: [
      {
        heading: "När en ensideshemsida räcker",
        bullets: [
          "Företaget har ett tydligt och avgränsat erbjudande.",
          "Besökaren behöver få svar på ett fåtal frågor före kontakt.",
          "Det finns begränsat med eget innehåll, bilder eller case.",
          "Målet är att komma online snabbt med en tydlig fast kostnad.",
        ],
        paragraphs: [
          "Altura Start är byggt för den här situationen. Innehållet samlas i en logisk resa från erbjudande och förtroende till kontakt.",
        ],
      },
      {
        heading: "När flera sidor är bättre",
        bullets: [
          "Tjänsterna riktar sig till olika behov eller målgrupper.",
          "Varje tjänst behöver en egen förklaring eller synlighet i sökresultat.",
          "Företaget har case, team, process eller material som förtjänar eget utrymme.",
          "Besökaren behöver jämföra flera alternativ innan beslut.",
        ],
        paragraphs: [
          "Altura Företag ger upp till fem avgränsade sidor och gör det enklare att skapa en tydlig innehållshierarki.",
        ],
      },
      {
        heading: "Hur påverkas SEO?",
        paragraphs: [
          "Flera genomarbetade sidor kan rikta sig mot olika konkreta sökningar. Det betyder inte att fler sidor automatiskt ger bättre placeringar. Varje sida behöver ett eget syfte och tillräckligt användbart innehåll.",
          "En ensideshemsida kan fortfarande synas bra för ett fokuserat erbjudande, särskilt när rubriker, sidtitel och innehåll är tydliga.",
        ],
      },
      {
        heading: "En enkel beslutsregel",
        paragraphs: [
          "Om allt kan förklaras utan att sidan känns överlastad är en sida ofta rätt. Om viktiga tjänster konkurrerar om utrymmet eller kräver olika argument är flera sidor en bättre investering.",
        ],
      },
    ],
    conclusion:
      "Välj den minsta struktur som kan förklara erbjudandet trovärdigt. Det ger en tydligare webbplats nu och lämnar möjlighet att bygga ut när verkligt innehåll och nya behov finns.",
  },
  {
    slug: "tecken-pa-att-foretagets-hemsida-behover-goras-om",
    title: "7 tecken på att företagets hemsida behöver göras om",
    seoTitle: "7 tecken på att företagets hemsida behöver göras om",
    description:
      "Se när en gammal företagshemsida bromsar förtroende och kontakt, och vilka problem som bör prioriteras i en ombyggnad.",
    excerpt:
      "Sju konkreta signaler på att hemsidan inte längre hjälper företaget, från mobilproblem till ett otydligt erbjudande.",
    readTime: "7 min läsning",
    intro: [
      "En hemsida behöver inte göras om bara för att den har några år på nacken. Frågan är om den fortfarande representerar företaget och hjälper besökaren vidare.",
      "De här sju signalerna visar när problemen har blivit större än enstaka text- eller bildändringar.",
    ],
    sections: [
      {
        heading: "1. Sidan fungerar dåligt i mobilen",
        paragraphs: [
          "Text som kräver zoomning, små klickytor eller innehåll som hamnar utanför skärmen skapar friktion direkt. Mobilen bör granskas som en egen upplevelse, inte som en krympt datorversion.",
        ],
      },
      {
        heading: "2. Besökaren förstår inte snabbt vad ni erbjuder",
        paragraphs: [
          "Om huvudrubriken beskriver en vision men inte verksamheten behöver budskapet skärpas. Den första skärmen ska ge tillräcklig orientering för att rätt person vill läsa vidare.",
        ],
      },
      {
        heading: "3. Företaget har utvecklats men sidan står still",
        paragraphs: [
          "Nya tjänster, annan målgrupp eller högre kvalitetsnivå behöver synas. Annars jämför kunden dagens företag med gårdagens presentation.",
        ],
      },
      {
        heading: "4. Kontaktvägen är svår att hitta",
        paragraphs: [
          "Kontaktuppgifter som bara finns i sidfoten eller ett formulär med för många frågor kan sänka antalet förfrågningar. Nästa steg ska vara tydligt där beslutet uppstår.",
        ],
      },
      {
        heading: "5. Sidan laddar långsamt",
        paragraphs: [
          "Tunga bilder, gammal teknik och onödiga tillägg kan göra sidan seg. Det påverkar både användarupplevelsen och möjligheten att konkurrera i sökresultat.",
        ],
      },
      {
        heading: "6. Innehållet går inte att hitta via Google",
        paragraphs: [
          "Vaga sidtitlar, flera sidor med samma rubrik eller avsaknad av konkret innehåll gör verksamheten svårare att förstå. En ombyggnad bör kombinera design med en tydlig informationsstruktur.",
        ],
      },
      {
        heading: "7. Du undviker att skicka länken",
        paragraphs: [
          "Det är en enkel men viktig signal. Om du hellre förklarar verksamheten i ett mejl än länkar till webbplatsen gör sidan inte längre sitt jobb som företagets digitala presentation.",
        ],
      },
      {
        heading: "Göra om allt eller förbättra stegvis?",
        paragraphs: [
          "Mindre problem kan lösas med nytt innehåll, bättre bilder eller tydligare kontaktknappar. Om struktur, teknik och visuellt uttryck samtidigt är föråldrade blir en samlad ombyggnad ofta mer effektiv.",
        ],
      },
    ],
    conclusion:
      "Utgå från vad som hindrar besökaren i dag. En ny hemsida ska inte bara kännas fräschare, utan göra erbjudandet tydligare och nästa steg enklare.",
  },
];

export function getIndustryPage(slug: string) {
  return industryPages.find((page) => page.slug === slug);
}

export function getMarketingArticle(slug: string) {
  return marketingArticles.find((article) => article.slug === slug);
}
