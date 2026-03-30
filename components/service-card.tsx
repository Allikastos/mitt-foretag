import Link from "next/link";

type ServiceCardProps = {
  title: string;
  summary: string;
  href: string;
  label?: string;
  variant?: "compact" | "feature";
};

export function ServiceCard({
  title,
  summary,
  href,
  label = "Tjänst",
  variant = "compact",
}: ServiceCardProps) {
  const isFeature = variant === "feature";

  return (
    <article
      className={[
        "flex h-full flex-col rounded-[2rem] border border-black/8 bg-white shadow-[0_22px_60px_-50px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_28px_70px_-48px_rgba(0,0,0,0.28)]",
        isFeature ? "p-8 md:p-10" : "p-6 md:p-7",
      ].join(" ")}
    >
      <p className="text-xs font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
        {label}
      </p>
      <h3 className="mt-6 text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] text-balance">
        {title}
      </h3>
      <p className="mt-4 flex-1 text-base leading-7 text-[#5F5F5F]">{summary}</p>
      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:border-[#0B0B0C] hover:bg-[#F7F7F5]"
      >
        Läs mer
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
