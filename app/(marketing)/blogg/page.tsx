import Link from "next/link";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { marketingArticles } from "@/lib/marketing-seo";

export const metadata = createMetadata(
  "Guider om hemsidor för företag",
  "Praktiska guider om pris, innehåll, struktur och när företagets hemsida behöver göras om.",
  { pathname: "/blogg" },
);

export default function BlogPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Hem", href: "/" }, { label: "Guider" }]} />
      <PageIntro
        eyebrow="Guider"
        title="Tydliga svar innan du beställer en hemsida."
        description="Praktiska genomgångar för företag som vill förstå pris, omfattning och vilka val som faktiskt påverkar resultatet."
      />
      <section className="pb-16 md:pb-24">
        <SectionContainer>
          <div className="grid gap-6 md:grid-cols-2">
            {marketingArticles.map((article, index) => (
              <article
                key={article.slug}
                className={`flex flex-col rounded-[2.25rem] border border-[#173f35]/10 p-7 md:p-9 ${
                  index === 0 ? "bg-[#173f35] text-white" : "bg-white/65 text-[#173f35]"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-xs font-bold tracking-[0.14em] uppercase">
                  <span className={index === 0 ? "text-[#f3b89f]" : "text-[#e86f44]"}>Guide</span>
                  <span className={index === 0 ? "text-white/45" : "text-[#75827c]"}>{article.readTime}</span>
                </div>
                <h2 className="mt-8 text-3xl font-semibold tracking-[-0.045em] text-balance">
                  {article.title}
                </h2>
                <p className={`mt-5 flex-1 text-sm leading-7 ${index === 0 ? "text-white/68" : "text-[#617169]"}`}>
                  {article.excerpt}
                </p>
                <Link
                  href={`/blogg/${article.slug}`}
                  className={`mt-8 inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4 ${
                    index === 0 ? "decoration-[#f3b89f]" : "decoration-[#e86f44]"
                  }`}
                >
                  Läs guiden <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
