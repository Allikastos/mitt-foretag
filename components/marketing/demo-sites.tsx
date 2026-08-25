import Link from "next/link";

const images = {
  paintHero: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=88",
  paintDetail: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=85",
  nordformHero: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=88",
  nordformTeam: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
  studioHero: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=88",
  studioDetail: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1400&q=88",
};

function DemoNotice({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 px-5 py-2 text-[10px] font-semibold tracking-[0.14em] uppercase ${inverse ? "bg-[#78d6c6] text-[#0d1720]" : "bg-[#173f35] text-white"}`}>
      <span>Demokoncept av Altura Nova · inte ett riktigt företag</span>
      <Link href="/exempel" className="underline underline-offset-4">Tillbaka till alla exempel</Link>
    </div>
  );
}

export function PenseldragSite() {
  return (
    <div className="min-h-screen bg-[#eee2cf] text-[#35271d]" style={{ fontFamily: '"Avenir Next", Avenir, sans-serif' }}>
      <DemoNotice />
      <header className="px-5 py-6 md:px-10 lg:px-16">
        <nav aria-label="Penseldrags huvudmeny" className="flex items-center justify-between border-b border-[#35271d]/20 pb-5">
          <Link href="/demo/penseldrag" className="text-2xl font-bold italic" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>Penseldrag</Link>
          <div className="hidden items-center gap-8 text-xs font-bold tracking-[0.12em] uppercase md:flex">
            <a href="#projekt">Projekt</a><a href="#arbetssatt">Arbetssätt</a><a href="#kontakt">Kontakt</a>
          </div>
          <a href="#kontakt" className="border border-[#35271d] px-4 py-2 text-xs font-bold uppercase transition hover:bg-[#35271d] hover:text-[#f8efe2]">Be om offert</a>
        </nav>
      </header>

      <main>
        <section className="grid gap-9 overflow-hidden px-5 pt-8 pb-20 md:px-10 lg:grid-cols-[1.02fr_.98fr] lg:px-16 lg:pt-12">
          <div className="relative flex flex-col justify-between lg:py-8">
            <div>
              <p className="text-xs font-bold tracking-[0.22em] text-[#a45134] uppercase">Måleri med känsla för rummet</p>
              <h1 className="mt-6 max-w-3xl text-6xl leading-[0.88] tracking-[-0.055em] sm:text-7xl lg:text-[7.6rem]" style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif' }}>Rum med <i>värme.</i><br />Ytor som håller.</h1>
              <p className="mt-8 max-w-lg text-base leading-8 text-[#69594b]">Vi målar hem och verksamheter med gediget förarbete, varsam kulörsättning och en rak dialog från första penseldrag till sista list.</p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a href="#projekt" className="inline-flex items-center gap-3 bg-[#a45134] px-6 py-4 text-sm font-bold text-white">Se våra projekt <span aria-hidden="true">↓</span></a>
              <span className="text-xs font-bold tracking-[0.12em] uppercase">4,9 / 5 från 86 omdömen</span>
            </div>
            <span className="pointer-events-none absolute -bottom-5 left-24 h-20 w-72 -rotate-3 rounded-[50%] border-[14px] border-[#b65f3b]/15" />
          </div>
          <div className="relative min-h-[31rem] overflow-hidden rounded-t-[11rem] rounded-br-[2rem] md:min-h-[42rem]">
            <div className="absolute inset-0 scale-105 bg-cover bg-center sepia-[.16]" style={{ backgroundImage: `url(${images.paintHero})` }} />
            <div className="absolute inset-0 bg-[#a45134]/10 mix-blend-multiply" />
            <div className="absolute right-5 bottom-5 max-w-52 bg-[#f8efe2] p-5 shadow-xl">
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#a45134] uppercase">Senaste projektet</p>
              <p className="mt-2 text-2xl" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>Villa Sunnan</p>
              <p className="mt-2 text-xs leading-5 text-[#69594b]">Kök, snickerier och tre sovrum i en varm kalkpalett.</p>
            </div>
          </div>
        </section>

        <section id="projekt" className="bg-[#f8efe2] px-5 py-20 md:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="text-xs font-bold tracking-[0.2em] text-[#a45134] uppercase">Utvalda arbeten</p><h2 className="mt-4 text-5xl tracking-[-0.04em] md:text-7xl" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>Färg som förändrar.</h2></div>
            <p className="max-w-md text-sm leading-7 text-[#69594b]">Varje projekt börjar med platsen. Ljuset, materialen och människorna som ska leva där avgör resten.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
            <article className="group relative min-h-[30rem] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${images.paintDetail})` }} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2d2119]/90 to-transparent p-7 pt-24 text-white"><p className="text-xs tracking-[0.16em] uppercase">Fasad · 1920-tal</p><h3 className="mt-2 text-4xl" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>Huset vid ån</h3></div>
            </article>
            <div className="grid gap-6">
              <article className="bg-[#dcc5a6] p-7"><span className="text-xs font-bold text-[#a45134]">01</span><h3 className="mt-16 text-4xl" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>Lugnare kulörer i vardagsrummet.</h3><p className="mt-5 text-sm leading-7 text-[#69594b]">Från kallvitt till mjuka jordtoner som följer dagsljuset.</p></article>
              <article className="border border-[#35271d]/20 p-7"><span className="text-xs font-bold text-[#a45134]">02</span><h3 className="mt-10 text-3xl" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>Snickerier med nytt liv.</h3><p className="mt-4 text-sm leading-7 text-[#69594b]">Noggrant underarbete och en sidenmatt yta som håller för vardagen.</p></article>
            </div>
          </div>
        </section>

        <section id="arbetssatt" className="px-5 py-20 md:px-10 lg:px-16">
          <p className="text-xs font-bold tracking-[0.2em] text-[#a45134] uppercase">Så går det till</p>
          <div className="mt-8 grid border-y border-[#35271d]/20 md:grid-cols-4">
            {[['01','Hembesök','Vi ser ytorna, pratar känsla och mäter omfattningen.'],['02','Kulör & offert','Du får ett konkret förslag utan dolda överraskningar.'],['03','Hantverket','Vi skyddar, förbereder och målar med omsorg.'],['04','Genomgång','Tillsammans säkrar vi att varje detalj känns rätt.']].map(([number,title,text]) => <article key={number} className="border-b border-[#35271d]/20 p-6 last:border-0 md:border-r md:border-b-0"><span className="text-xs font-bold text-[#a45134]">{number}</span><h3 className="mt-8 text-2xl" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>{title}</h3><p className="mt-3 text-sm leading-6 text-[#69594b]">{text}</p></article>)}
          </div>
        </section>

        <section id="kontakt" className="mx-5 mb-5 grid overflow-hidden bg-[#a45134] text-white md:mx-10 lg:mx-16 lg:grid-cols-[1fr_auto]">
          <div className="p-8 md:p-12"><p className="text-xs font-bold tracking-[0.2em] text-white/65 uppercase">Har du ett rum i tankarna?</p><h2 className="mt-5 max-w-3xl text-5xl leading-[.95] md:text-7xl" style={{ fontFamily: '"Iowan Old Style", Georgia, serif' }}>Berätta vad du vill förändra.</h2></div>
          <div className="flex items-center border-t border-white/20 p-8 lg:border-t-0 lg:border-l"><Link href="/kontakt" className="bg-[#f8efe2] px-7 py-4 text-sm font-bold text-[#35271d]">Be om offert ↗</Link></div>
        </section>
      </main>
      <footer className="flex flex-wrap justify-between gap-4 px-5 py-8 text-xs text-[#69594b] md:px-10 lg:px-16"><span>Penseldrag · Demokoncept</span><Link href="/exempel">Skapat av Altura Nova</Link></footer>
    </div>
  );
}

export function NordformSite() {
  const principles = [
    ["01", "Se systemet", "Vi skiljer symptom från struktur och gör nuläget mätbart."],
    ["02", "Välj riktning", "Ledningen får tydliga alternativ, konsekvenser och beslutspunkter."],
    ["03", "Skapa rörelse", "Strategin bryts ned till ansvar, rytm och uppföljningsbara effekter."],
  ];
  return (
    <div className="min-h-screen bg-[#0d1720] text-[#edf3f4]" style={{ fontFamily: '"Avenir Next Condensed", "Franklin Gothic Medium", sans-serif' }}>
      <DemoNotice inverse />
      <header className="border-b border-white/15 px-5 md:px-10 lg:px-16">
        <nav aria-label="Nordforms huvudmeny" className="flex h-20 items-center justify-between">
          <Link href="/demo/nordform" className="text-lg font-bold tracking-[0.32em] uppercase">N/F · Nordform</Link>
          <div className="hidden gap-8 font-mono text-[10px] tracking-[0.14em] uppercase text-white/55 md:flex"><a href="#expertis">01 Expertis</a><a href="#case">02 Case</a><a href="#kontakt">03 Kontakt</a></div>
          <a href="#kontakt" className="bg-[#78d6c6] px-5 py-3 text-[10px] font-bold tracking-[0.14em] text-[#0d1720] uppercase">Starta dialog →</a>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/15 px-5 py-16 md:px-10 lg:px-16 lg:py-24">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.13)_1px,transparent_1px)] [background-size:80px_80px]" />
          <div className="relative grid gap-14 lg:grid-cols-[1.35fr_.65fr]">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#78d6c6] uppercase">Management consulting · Stockholm / Norden</p>
              <h1 className="mt-8 max-w-5xl text-6xl leading-[.9] font-semibold tracking-[-0.06em] sm:text-7xl lg:text-[7.5rem]">Klarhet för beslut som formar <span className="text-[#78d6c6]">nästa steg.</span></h1>
              <div className="mt-12 flex flex-wrap items-center gap-6"><a href="#expertis" className="bg-[#edf3f4] px-6 py-4 text-xs font-bold tracking-[0.14em] text-[#0d1720] uppercase">Utforska vår metod ↓</a><p className="max-w-xs text-xs leading-6 text-white/50">Strategi, organisation och genomförande för ledningsgrupper i förändring.</p></div>
            </div>
            <aside className="flex flex-col justify-end border-l border-white/20 pl-7">
              <span className="font-mono text-[10px] text-white/40">SIGNAL / 2026.04</span>
              <span className="mt-8 text-7xl font-light text-[#78d6c6]">67%</span>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">av strategiska initiativ tappar fart när ansvar och beslutsrytm förblir otydliga.</p>
              <div className="mt-8 h-1 w-full bg-white/10"><div className="h-full w-2/3 bg-[#78d6c6]" /></div>
            </aside>
          </div>
        </section>

        <section id="expertis" className="grid lg:grid-cols-[.72fr_1.28fr]">
          <div className="relative min-h-[28rem] border-r border-white/15 bg-cover bg-center grayscale" style={{ backgroundImage: `linear-gradient(rgba(13,23,32,.25),rgba(13,23,32,.8)),url(${images.nordformHero})` }}><span className="absolute bottom-7 left-7 font-mono text-[10px] tracking-[0.16em] text-white/55 uppercase">Struktur gör komplexitet möjlig att leda.</span></div>
          <div className="px-5 py-16 md:px-10 lg:px-16 lg:py-24">
            <div className="flex items-center justify-between"><p className="font-mono text-[10px] tracking-[0.2em] text-[#78d6c6] uppercase">Vårt arbetssätt</p><span className="font-mono text-[10px] text-white/35">01—03</span></div>
            <div className="mt-10 divide-y divide-white/15">{principles.map(([number,title,text]) => <article key={number} className="grid gap-5 py-8 md:grid-cols-[60px_1fr_1fr]"><span className="font-mono text-xs text-[#78d6c6]">{number}</span><h2 className="text-3xl font-semibold tracking-[-0.04em]">{title}</h2><p className="text-sm leading-7 text-white/50">{text}</p></article>)}</div>
          </div>
        </section>

        <section id="case" className="bg-[#edf3f4] px-5 py-20 text-[#0d1720] md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><p className="font-mono text-[10px] tracking-[0.2em] text-[#277a6e] uppercase">Case 04 / Industribolag</p><h2 className="mt-6 text-5xl leading-[.95] font-semibold tracking-[-0.05em] md:text-7xl">Från nio initiativ till tre prioriteringar.</h2></div><div className="grid gap-px bg-[#0d1720]/15 sm:grid-cols-3">{[["−42%","Färre parallella initiativ"],["+18%","Kortare beslutsledtid"],["12 v","Till ny styrmodell"]].map(([value,label]) => <div key={value} className="bg-[#edf3f4] p-7"><span className="text-5xl font-light text-[#277a6e]">{value}</span><p className="mt-12 text-xs font-bold tracking-[0.12em] uppercase">{label}</p></div>)}</div></div>
          <div className="mt-12 min-h-72 bg-cover bg-center grayscale" style={{ backgroundImage: `linear-gradient(90deg,rgba(13,23,32,.85),rgba(13,23,32,.1)),url(${images.nordformTeam})` }} />
        </section>

        <section id="kontakt" className="grid border-t border-white/15 lg:grid-cols-[1fr_auto]"><div className="px-5 py-16 md:px-10 lg:px-16 lg:py-20"><p className="font-mono text-[10px] tracking-[0.2em] text-[#78d6c6] uppercase">Ett första arbetsmöte</p><h2 className="mt-5 max-w-4xl text-5xl leading-[.95] tracking-[-0.05em] md:text-7xl">Vilket beslut behöver bli tydligare?</h2></div><div className="flex items-center border-t border-white/15 p-8 lg:border-t-0 lg:border-l"><Link href="/kontakt" className="bg-[#78d6c6] px-7 py-4 text-xs font-bold tracking-[0.12em] text-[#0d1720] uppercase">Starta en dialog ↗</Link></div></section>
      </main>
      <footer className="flex flex-wrap justify-between gap-4 border-t border-white/15 px-5 py-7 font-mono text-[9px] tracking-[0.14em] text-white/40 uppercase md:px-10 lg:px-16"><span>Nordform / Demokoncept / 2026</span><Link href="/exempel">Designad av Altura Nova</Link></footer>
    </div>
  );
}

export function StudioLinneaSite() {
  const treatments = [["Klipp & form","Från 790 kr","60 min"],["Färgkonsultation","Kostnadsfri","20 min"],["Färg & glans","Från 1 690 kr","150 min"],["Stylingritual","Från 590 kr","45 min"]];
  return (
    <div className="min-h-screen bg-[#f7efed] text-[#382d2d]" style={{ fontFamily: '"Avenir Next", Avenir, sans-serif' }}>
      <DemoNotice />
      <header className="px-5 md:px-10 lg:px-16">
        <nav aria-label="Studio Linneas huvudmeny" className="grid min-h-28 grid-cols-[1fr_auto] items-center border-b border-[#6f5656]/20 md:grid-cols-[1fr_auto_1fr]">
          <div className="hidden gap-7 text-[10px] font-semibold tracking-[0.16em] uppercase md:flex"><a href="#behandlingar">Behandlingar</a><a href="#studion">Studion</a></div>
          <Link href="/demo/studio-linnea" className="text-center text-2xl leading-5 tracking-[0.06em]" style={{ fontFamily: '"Bodoni 72", Didot, serif' }}>Studio<br /><i>Linnea</i></Link>
          <div className="flex justify-end"><a href="#boka" className="rounded-full bg-[#382d2d] px-5 py-3 text-[10px] font-semibold tracking-[0.15em] text-white uppercase">Boka en tid</a></div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pt-12 pb-24 md:px-10 lg:px-16 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[.84fr_1.16fr]">
            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative min-h-[34rem] overflow-hidden rounded-t-full md:min-h-[44rem]"><div className="absolute inset-0 scale-105 bg-cover bg-center saturate-[.62]" style={{ backgroundImage: `url(${images.studioHero})` }} /><div className="absolute inset-0 bg-[#bd8f93]/18 mix-blend-color" /></div>
              <span className="absolute -right-8 bottom-24 rounded-full bg-[#d9b9b8] px-5 py-8 text-center text-[9px] font-semibold tracking-[0.14em] uppercase shadow-xl">Nya tider<br />varje måndag</span>
            </div>
            <div className="text-center lg:text-left">
              <p className="text-[10px] tracking-[0.28em] text-[#9a6f72] uppercase">Hår · färg · en stund för dig</p>
              <h1 className="mt-7 text-7xl leading-[.82] tracking-[-0.055em] sm:text-8xl lg:text-[9rem]" style={{ fontFamily: '"Bodoni 72", Didot, "Times New Roman", serif' }}>Din stund.<br /><i>Ditt uttryck.</i></h1>
              <p className="mx-auto mt-9 max-w-lg text-sm leading-7 text-[#756364] lg:mx-0">En personlig hårstudio där lyhörd konsultation, mjuka färgövergångar och tid för detaljer får ta plats.</p>
              <div className="mt-9 flex flex-wrap justify-center gap-4 lg:justify-start"><a href="#boka" className="rounded-full bg-[#382d2d] px-7 py-4 text-xs font-semibold tracking-[0.12em] text-white uppercase">Hitta din tid</a><a href="#behandlingar" className="rounded-full border border-[#6f5656]/35 px-7 py-4 text-xs font-semibold tracking-[0.12em] uppercase">Se behandlingar</a></div>
            </div>
          </div>
          <span className="absolute right-[-4rem] bottom-10 h-px w-80 -rotate-45 bg-[#9a6f72]/35" />
        </section>

        <section id="behandlingar" className="bg-[#382d2d] px-5 py-20 text-[#f7efed] md:px-10 lg:px-16">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-[10px] tracking-[0.25em] text-[#d9b9b8] uppercase">Behandlingar</p><h2 className="mt-5 text-6xl leading-[.9] tracking-[-0.04em]" style={{ fontFamily: '"Bodoni 72", Didot, serif' }}>Omsorg i varje detalj.</h2><p className="mt-7 max-w-sm text-sm leading-7 text-white/55">Alla längre behandlingar börjar med en konsultation så att nyans, form och känsla blir rätt för just dig.</p></div><div className="divide-y divide-white/15 border-t border-white/15">{treatments.map(([name,price,time]) => <article key={name} className="grid grid-cols-[1fr_auto] items-center gap-5 py-6 md:grid-cols-[1fr_auto_auto]"><h3 className="text-2xl" style={{ fontFamily: '"Bodoni 72", Didot, serif' }}>{name}</h3><span className="hidden text-[10px] tracking-[0.14em] text-white/45 uppercase md:block">{time}</span><span className="text-xs font-semibold">{price}</span></article>)}</div></div>
        </section>

        <section id="studion" className="grid items-stretch lg:grid-cols-2">
          <div className="relative min-h-[35rem] bg-cover bg-center saturate-[.7]" style={{ backgroundImage: `url(${images.studioDetail})` }}><div className="absolute inset-0 bg-[#bd8f93]/12 mix-blend-color" /></div>
          <div className="flex items-center bg-[#e2c8c6] p-8 md:p-14 lg:p-20"><div><p className="text-[10px] tracking-[0.25em] text-[#8b6265] uppercase">Vår filosofi</p><blockquote className="mt-8 text-5xl leading-[.96] tracking-[-0.04em] md:text-7xl" style={{ fontFamily: '"Bodoni 72", Didot, serif' }}>“Skönhet känns bäst när den fortfarande känns som du.”</blockquote><p className="mt-9 max-w-md text-sm leading-7 text-[#756364]">Linnea arbetar lugnt, nyfiket och med respekt för hårets naturliga rörelse. Resultatet ska fungera lika fint en vanlig tisdag som när du lämnar studion.</p><div className="mt-10 h-px w-24 bg-[#8b6265]" /></div></div>
        </section>

        <section id="boka" className="px-5 py-24 text-center md:px-10 lg:px-16"><p className="text-[10px] tracking-[0.28em] text-[#9a6f72] uppercase">Välkommen in</p><h2 className="mx-auto mt-6 max-w-4xl text-7xl leading-[.86] tracking-[-0.05em] md:text-9xl" style={{ fontFamily: '"Bodoni 72", Didot, serif' }}>En tid bara för <i>dig.</i></h2><p className="mx-auto mt-8 max-w-md text-sm leading-7 text-[#756364]">Välj behandling och tid i lugn och ro. Är du osäker börjar vi med en kostnadsfri färgkonsultation.</p><Link href="/kontakt" className="mt-9 inline-flex rounded-full bg-[#382d2d] px-8 py-4 text-xs font-semibold tracking-[0.14em] text-white uppercase">Få ett eget förslag ↗</Link></section>
      </main>
      <footer className="flex flex-wrap justify-between gap-4 border-t border-[#6f5656]/20 px-5 py-8 text-[10px] tracking-[0.12em] text-[#756364] uppercase md:px-10 lg:px-16"><span>Studio Linnea · Demokoncept</span><Link href="/exempel">Skapat med omsorg av Altura Nova</Link></footer>
    </div>
  );
}
