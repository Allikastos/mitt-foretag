import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogRichText } from "@/components/blog-rich-text";
import { CTABlock } from "@/components/cta-block";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import { createMetadata } from "@/lib/metadata";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
} from "@/src/lib/supabase-server";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string | null, fallback: string) {
  const date = value ?? fallback;

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return createMetadata("Artikel", "Den efterfrågade artikeln kunde inte hittas.");
  }

  const title = post.seo_title || post.title;
  const description =
    post.seo_description ||
    post.excerpt ||
    `Artikel från ${SITE_CONFIG.name} om redovisning, rapportering och ekonomisk rådgivning.`;

  return createMetadata(title, description, {
    pathname: `/blogg/${post.slug}`,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .slice(0, 3);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo_title || post.title,
    description:
      post.seo_description ||
      post.excerpt ||
      `Artikel från ${SITE_CONFIG.name} om redovisning, rapportering och rådgivning.`,
    datePublished: post.publish_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
    },
    mainEntityOfPage: `${SITE_CONFIG.url}/blogg/${post.slug}`,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hem",
        item: `${SITE_CONFIG.url}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blogg",
        item: `${SITE_CONFIG.url}/blogg`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_CONFIG.url}/blogg/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="pt-8">
        <SectionContainer>
          <nav aria-label="Brödsmulor" className="text-sm text-[#5F5F5F]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-[#0B0B0C]">
                  Hem
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/blogg" className="transition hover:text-[#0B0B0C]">
                  Blogg
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#0B0B0C]">{post.title}</li>
            </ol>
          </nav>
        </SectionContainer>
      </section>

      <PageIntro
        eyebrow="Blogg"
        title={post.title}
        description={
          post.excerpt ||
          "Praktiska perspektiv för företag som vill arbeta mer strukturerat med redovisning, rapportering och ekonomisk styrning."
        }
      />

      <section className="pb-12 pt-2 md:pb-16">
        <SectionContainer>
          <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
            <p className="text-sm font-medium tracking-[0.18em] text-[#C6A15B] uppercase">
              Publicerad {formatDate(post.publish_at, post.created_at)}
            </p>
            <BlogRichText content={post.content} className="mt-6" />
          </article>
        </SectionContainer>
      </section>

      {relatedPosts.length > 0 ? (
        <section className="pb-16">
          <SectionContainer>
            <div className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-3xl">
                Relaterade artiklar
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blogg/${relatedPost.slug}`}
                    className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] px-5 py-5 transition hover:border-black/20"
                  >
                    <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#0B0B0C]">
                      {relatedPost.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#5F5F5F]">
                      {relatedPost.excerpt || "Läs mer om ämnet i artikeln."}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </SectionContainer>
        </section>
      ) : null}

      <CTABlock
        title="Vill du diskutera hur detta påverkar ditt företags ekonomi i praktiken?"
        description="Boka ett första samtal så går vi igenom nuläge, prioriteringar och vilka steg som kan ge bäst effekt i er verksamhet."
        primary={{ href: "/kontakt", label: SITE_CONFIG.cta.primary }}
        secondary={{ href: "/tjanster", label: SITE_CONFIG.cta.services }}
      />
    </>
  );
}
