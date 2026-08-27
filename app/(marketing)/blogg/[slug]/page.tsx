import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import { createMetadata } from "@/lib/metadata";
import { getMarketingArticle, marketingArticles } from "@/lib/marketing-seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return marketingArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getMarketingArticle((await params).slug);

  if (!article) {
    return createMetadata("Guiden kunde inte hittas", "Den efterfrågade guiden finns inte.");
  }

  return createMetadata(article.seoTitle, article.description, {
    pathname: `/blogg/${article.slug}`,
    type: "article",
  });
}

export default async function ArticlePage({ params }: Props) {
  const article = getMarketingArticle((await params).slug);

  if (!article) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: `${SITE_CONFIG.url}/blogg/${article.slug}`,
    author: {
      "@type": "Person",
      name: "Albin Holmberg",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_CONFIG.url}/#organization`,
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: new URL(SITE_CONFIG.logoPath, SITE_CONFIG.url).toString(),
      },
    },
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Hem", href: "/" },
          { label: "Guider", href: "/blogg" },
          { label: article.title },
        ]}
      />
      <article className="pb-20 pt-12 md:pb-28 md:pt-20">
        <SectionContainer>
          <header className="mx-auto max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold tracking-[0.16em] text-[#e86f44] uppercase">
              <span>Guide</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#75827c]">{article.readTime}</span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] text-[#173f35] text-balance md:text-6xl">
              {article.title}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#617169] md:text-xl">
              {article.description}
            </p>
          </header>

          <div className="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
            <div className="rounded-[2.25rem] border border-[#173f35]/10 bg-[#fffdf8] p-7 md:p-10">
              <div className="space-y-5 text-base leading-8 text-[#45564f]">
                {article.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>

              {article.sections.map((section) => (
                <section key={section.heading} className="mt-11">
                  <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#173f35]">
                    {section.heading}
                  </h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mt-5 text-base leading-8 text-[#45564f]">{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="mt-5 space-y-3">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-base leading-7 text-[#45564f]">
                          <span aria-hidden="true" className="mt-0.5 font-bold text-[#e86f44]">✓</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              <div className="mt-12 rounded-[1.75rem] bg-[#eef2ec] p-6 md:p-8">
                <p className="text-xs font-bold tracking-[0.18em] text-[#e86f44] uppercase">Sammanfattning</p>
                <p className="mt-4 text-base leading-8 text-[#173f35]">{article.conclusion}</p>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-[1.75rem] bg-[#173f35] p-6 text-white">
                <p className="text-xs font-bold tracking-[0.16em] text-[#f3b89f] uppercase">Jämför omfattning</p>
                <p className="mt-4 text-sm leading-7 text-white/70">Se vilket fast paket som passar företagets innehåll och mål.</p>
              </div>
              {[
                { label: "Mini · 2 995 kr", href: "/mini" },
                { label: "Start · 4 995 kr", href: "/tjanster/start" },
                { label: "Företag · 7 995 kr", href: "/tjanster/foretag" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-[1.25rem] border border-[#173f35]/10 bg-white/65 px-5 py-4 text-sm font-semibold text-[#173f35] transition hover:bg-white"
                >
                  {link.label}<span aria-hidden="true">→</span>
                </Link>
              ))}
              <Link
                href="/kontakt"
                className="flex justify-center rounded-full bg-[#e86f44] px-5 py-3.5 text-sm font-semibold text-white"
              >
                Få ett kostnadsfritt förslag
              </Link>
            </aside>
          </div>
        </SectionContainer>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
