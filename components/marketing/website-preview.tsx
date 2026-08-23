type WebsitePreviewProps = {
  name: string;
  headline: string;
  industry: string;
  tone: "clay" | "navy" | "sage";
  compact?: boolean;
};

const tones = {
  clay: { shell: "bg-[#f6e7dc]", ink: "text-[#442b20]", accent: "bg-[#d0643e]", panel: "bg-[#fffaf5]" },
  navy: { shell: "bg-[#dce7ee]", ink: "text-[#142d3b]", accent: "bg-[#1e526b]", panel: "bg-[#f8fbfc]" },
  sage: { shell: "bg-[#e5ebdd]", ink: "text-[#30402d]", accent: "bg-[#68815d]", panel: "bg-[#fbfcf8]" },
};

export function WebsitePreview({ name, headline, industry, tone, compact = false }: WebsitePreviewProps) {
  const colors = tones[tone];
  return (
    <div className={`overflow-hidden rounded-[1.75rem] border border-black/10 ${colors.shell} shadow-[0_28px_70px_-40px_rgba(23,63,53,0.4)]`}>
      <div className="flex items-center gap-1.5 border-b border-black/8 bg-white/75 px-4 py-3" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-[#ff7c65]" /><span className="h-2 w-2 rounded-full bg-[#f4bf4f]" /><span className="h-2 w-2 rounded-full bg-[#63bd74]" />
        <span className="ml-3 h-2 w-24 rounded-full bg-black/8" />
      </div>
      <div className={`${compact ? "p-5" : "p-7 md:p-9"} ${colors.ink}`}>
        <div className="flex items-center justify-between border-b border-current/15 pb-4">
          <span className="font-semibold tracking-[-0.03em]">{name}</span>
          <span className="text-[9px] font-semibold tracking-[0.18em] uppercase opacity-60">{industry}</span>
        </div>
        <div className={`grid items-end gap-6 ${compact ? "pt-7" : "pt-10 md:grid-cols-[1fr_0.72fr]"}`}>
          <div>
            <p className={`${compact ? "text-2xl" : "text-3xl md:text-5xl"} max-w-lg font-semibold leading-[0.98] tracking-[-0.055em]`}>{headline}</p>
            <div className={`mt-6 inline-flex rounded-full ${colors.accent} px-4 py-2 text-[10px] font-bold tracking-[0.12em] text-white uppercase`}>Boka ett samtal</div>
          </div>
          {!compact ? <div className={`hidden aspect-[4/3] rounded-[1.25rem] ${colors.panel} p-4 md:block`}><div className="h-full rounded-[0.9rem] bg-[linear-gradient(135deg,rgba(255,255,255,.8),rgba(0,0,0,.08))]" /></div> : null}
        </div>
      </div>
    </div>
  );
}
