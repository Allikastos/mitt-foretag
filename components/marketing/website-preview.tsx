import Link from "next/link";

type WebsitePreviewProps = {
  slug: string;
  name: string;
  headline: string;
  industry: string;
  compact?: boolean;
};

const demoImage = {
  penseldrag: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
  nordform: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85",
  "studio-linnea": "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=85",
};

function BrowserBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 border-b px-4 py-3 ${dark ? "border-white/10 bg-[#111820]" : "border-black/8 bg-white/80"}`} aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-[#ff7c65]" />
      <span className="h-2 w-2 rounded-full bg-[#f4bf4f]" />
      <span className="h-2 w-2 rounded-full bg-[#63bd74]" />
      <span className={`ml-3 h-2 w-24 rounded-full ${dark ? "bg-white/10" : "bg-black/8"}`} />
    </div>
  );
}

function PenseldragPreview({ compact }: { compact: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-[#efe1cc] text-[#35271d] ${compact ? "min-h-64 p-5" : "min-h-[25rem] p-7 md:p-9"}`} style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif' }}>
      <div className="flex items-center justify-between border-b border-[#35271d]/20 pb-3">
        <span className="text-lg font-bold italic">Penseldrag</span>
        <span className="text-[8px] font-semibold tracking-[0.2em] uppercase">Projekt · Kulör · Omsorg</span>
      </div>
      <div className={`grid gap-5 pt-5 ${compact ? "grid-cols-[1.1fr_.9fr]" : "md:grid-cols-[1.05fr_.95fr]"}`}>
        <div className="relative z-10 flex flex-col justify-between">
          <div>
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#9c4f33] uppercase">Måleri med känsla för rummet</p>
            <p className={`${compact ? "mt-3 text-[1.65rem]" : "mt-5 text-4xl md:text-5xl"} max-w-md leading-[0.93] tracking-[-0.045em]`}>Rum med värme. Ytor som håller.</p>
          </div>
          <span className="mt-5 w-fit border-b-2 border-[#9c4f33] pb-1 text-[10px] font-bold uppercase">Se våra projekt ↗</span>
        </div>
        <div className={`relative overflow-hidden rounded-t-[5rem] rounded-br-[1.4rem] ${compact ? "min-h-36" : "min-h-64"}`}>
          <div className="absolute inset-0 bg-cover bg-center sepia-[.18]" style={{ backgroundImage: `url(${demoImage.penseldrag})` }} />
          <div className="absolute inset-0 bg-[#b65f3b]/10 mix-blend-multiply" />
          <span className="absolute right-3 bottom-3 rounded-full bg-[#f7eddf] px-3 py-1 text-[8px] font-bold uppercase">Villa Sunnan</span>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-8 -left-5 h-16 w-44 -rotate-6 rounded-[50%] border-[10px] border-[#b65f3b]/18" />
    </div>
  );
}

function NordformPreview({ compact }: { compact: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-[#0d1720] text-[#f2f5f6] ${compact ? "min-h-64 p-5" : "min-h-[25rem] p-7 md:p-9"}`} style={{ fontFamily: '"Avenir Next Condensed", "Franklin Gothic Medium", sans-serif' }}>
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative flex items-center justify-between">
        <span className="text-sm font-bold tracking-[0.28em] uppercase">N/F · Nordform</span>
        <div className="flex gap-3 text-[8px] font-bold tracking-[0.18em] uppercase text-white/55"><span>Expertis</span><span>Case</span><span>Kontakt</span></div>
      </div>
      <div className={`relative grid gap-4 ${compact ? "mt-7 grid-cols-[1.2fr_.8fr]" : "mt-12 md:grid-cols-[1.25fr_.75fr]"}`}>
        <div>
          <p className="font-mono text-[8px] tracking-[0.18em] text-[#78d6c6] uppercase">Strategi / organisation / genomförande</p>
          <p className={`${compact ? "mt-3 text-[1.55rem]" : "mt-5 text-4xl md:text-5xl"} max-w-lg font-semibold leading-[0.95] tracking-[-0.045em]`}>Klarhet för beslut som formar nästa steg.</p>
          <span className="mt-5 inline-flex bg-[#78d6c6] px-3 py-2 text-[9px] font-bold tracking-[0.14em] text-[#0d1720] uppercase">Boka ett första möte →</span>
        </div>
        <div className="flex flex-col justify-end border-l border-white/20 pl-4">
          <span className="font-mono text-[8px] text-white/45">ARBETSSÄTT / 01</span>
          <span className={`${compact ? "mt-2 text-xl" : "mt-4 text-3xl"} font-light text-[#78d6c6]`}>Klarhet</span>
          <span className="mt-1 text-[8px] leading-4 tracking-[0.12em] uppercase text-white/55">Från komplexitet till gemensam riktning</span>
        </div>
      </div>
      {!compact ? <div className="absolute right-7 bottom-7 h-16 w-32 bg-cover bg-center opacity-50 grayscale" style={{ backgroundImage: `url(${demoImage.nordform})` }} /> : null}
    </div>
  );
}

function StudioLinneaPreview({ compact }: { compact: boolean }) {
  return (
    <div className={`relative overflow-hidden bg-[#f6ece9] text-[#382d2d] ${compact ? "min-h-64 p-5" : "min-h-[25rem] p-7 md:p-9"}`} style={{ fontFamily: '"Bodoni 72", Didot, "Times New Roman", serif' }}>
      <div className="flex items-start justify-between">
        <span className="text-center text-base leading-4 tracking-[0.06em]">Studio<br /><i>Linnea</i></span>
        <div className="flex items-center gap-3 text-[8px] tracking-[0.15em] uppercase"><span>Behandlingar</span><span className="rounded-full border border-[#6f5656] px-3 py-1.5">Boka</span></div>
      </div>
      <div className={`grid items-center gap-5 ${compact ? "mt-4 grid-cols-[.8fr_1.2fr]" : "mt-7 md:grid-cols-[.82fr_1.18fr]"}`}>
        <div className={`relative overflow-hidden rounded-t-full ${compact ? "h-40" : "h-64 md:h-72"}`}>
          <div className="absolute inset-0 scale-105 bg-cover bg-center saturate-[.65]" style={{ backgroundImage: `url(${demoImage["studio-linnea"]})` }} />
          <div className="absolute inset-0 bg-[#c89ea1]/20 mix-blend-color" />
        </div>
        <div className="text-center">
          <p className="text-[8px] tracking-[0.25em] text-[#9a6f72] uppercase">Hår · färg · ritual</p>
          <p className={`${compact ? "mt-3 text-3xl" : "mt-5 text-5xl md:text-6xl"} leading-[0.86] tracking-[-0.05em]`}>Din stund.<br /><i>Ditt uttryck.</i></p>
          <span className="mt-5 inline-flex rounded-full bg-[#382d2d] px-4 py-2 text-[9px] tracking-[0.13em] text-white uppercase">Hitta din tid</span>
        </div>
      </div>
      <span className="absolute -right-8 bottom-7 h-px w-32 rotate-[-38deg] bg-[#9a6f72]/40" />
    </div>
  );
}

export function WebsitePreview({ slug, name, compact = false }: WebsitePreviewProps) {
  return (
    <Link href={`/demo/${slug}`} aria-label={`Öppna den fullständiga demon för ${name}`} className="group block overflow-hidden rounded-[1.75rem] border border-black/10 shadow-[0_28px_70px_-40px_rgba(23,63,53,0.4)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_34px_80px_-36px_rgba(23,63,53,0.5)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#e86f44]">
      <BrowserBar dark={slug === "nordform"} />
      {slug === "penseldrag" ? <PenseldragPreview compact={compact} /> : null}
      {slug === "nordform" ? <NordformPreview compact={compact} /> : null}
      {slug === "studio-linnea" ? <StudioLinneaPreview compact={compact} /> : null}
      <span className="sr-only">Visa fullständig demo</span>
    </Link>
  );
}
