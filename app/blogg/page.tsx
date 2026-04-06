import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { getPublishedPosts } from "@/src/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = createMetadata(
  "Blogg",
  `Artiklar från ${SITE_CONFIG.name} om redovisning, finansiell rapportering och ekonomisk rådgivning för växande och ägarledda bolag.`,
  { pathname: "/blogg" }
);

const contentClusters = [
  {
    title: "Byta redovisningsbyrå",
    description:
      "Artiklar för företag som utvärderar byte av ekonomipartner och vill förstå risker, process och vad som bör vara på plats från start.",
    href: "/tjanster/redovisning",
    cta: "Se hur redovisningstjänsten fungerar",
  },
  {
    title: "Månadsrapportering och uppföljning",
    description:
      "Innehåll för bolag som vill få bättre struktur i ekonomisk uppföljning och använda rapportering mer aktivt i styrning och prioritering.",
    href: "/tjanster/rapportering",
    cta: "Se upplägg för rapportering",
  },
  {
    title: "Lönsamhet och ekonomisk rådgivning",
    description:
      "Perspektiv för ägarledda bolag som vill fatta bättre beslut om kostnadsstruktur, marginaler och nästa steg i verksamheten.",
    href: "/tjanster/radgivning",
    cta: "Se upplägg för rådgivning",
  },
];

const faqItems = [
  {
    question: "Hur snabbt kan vi förvänta oss svar efter en kontaktförfrågan?",
    answer:
      "Normalt återkommer vi inom en arbetsdag med förslag på nästa steg utifrån ert nuläge.",
  },
  {
    question: "Passar innehållet även företag utanför Linköping?",
    answer:
      "Ja. Artiklar och rådgivning är relevanta för företag i hela Sverige, även om verksamheten har bas i Linköping.",
  },
  {
    question: "Vilka ämnen fokuserar bloggen på?",
    answer:
      "Bloggen fokuserar på redovisning, rapportering och rådgivning nära praktiska beslut i växande och ägarledda bolag.",
  },
];

function formatDate(value: string | null, fallback: string) {
  const date = value ?? fallback;

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <PageIntro
        eyebrow="Blogg"
        title="Kunskapsbank för redovisning, rapportering och ekonomisk styrning."
        description={`Här samlas artiklar från ${SITE_CONFIG.name} för företag som vill fatta bättre ekonomiska beslut och skapa starkare kontroll i vardagen.`}
      />

      <section className="pb-12 pt-4 md:pb-16 md:pt-8">
        <SectionContainer>
          <div className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Content-kluster
            </p>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-3xl">
              Välj område utifrån ert nuläge
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {contentClusters.map((cluster) => (
                <article
                  key={cluster.title}
                  className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] px-5 py-5"
                >
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#0B0B0C]">
                    {cluster.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#5F5F5F]">
                    {cluster.description}
                  </p>
                  <Link
                    href={cluster.href}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#0B0B0C] transition hover:text-[#C6A15B]"
                  >
                    {cluster.cta}
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="pb-16 pt-0 md:pb-20">
        <SectionContainer>
          {posts.length > 0 ? (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10"
                >
                  {post.image_url ? (
                    <div className="mb-6 overflow-hidden rounded-[1.5rem] bg-[#F7F7F5]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="text-sm font-medium tracking-[0.18em] text-[#C6A15B] uppercase">
                    {formatDate(post.publish_at, post.created_at)}
                  </p>
                  <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                    <Link href={`/blogg/${post.slug}`} className="transition hover:text-[#C6A15B]">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-[#5F5F5F]">
                    {post.excerpt || "Inlägget saknar utdrag än så länge."}
                  </p>
                    <Link
                      href={`/blogg/${post.slug}`}
                      className="mt-6 inline-flex text-sm font-medium text-[#0B0B0C] transition hover:text-[#C6A15B]"
                    >
                      {SITE_CONFIG.cta.readArticle}
                    </Link>
                  <div className="mt-4 border-t border-black/8 pt-4">
                    <p className="text-sm leading-7 text-[#5F5F5F]">
                      Vill ni omsätta insikterna i praktiken?
                    </p>
                    <Link
                      href="/kontakt"
                      className="mt-1 inline-flex text-sm font-medium text-[#0B0B0C] transition hover:text-[#C6A15B]"
                    >
                      {SITE_CONFIG.cta.primary}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-black/12 bg-white px-8 py-12 text-center shadow-[0_24px_60px_-55px_rgba(0,0,0,0.12)]">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C]">
                Inga publicerade inlägg ännu
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#5F5F5F]">
                När du har skapat <code>posts</code>-tabellen och publicerat ditt
                första inlägg i Supabase kommer bloggen att visa innehållet här.
              </p>
            </div>
          )}
        </SectionContainer>
      </section>

      <section className="pb-24 pt-0 md:pb-24">
        <SectionContainer>
          <div className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Vanliga frågor
            </p>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-3xl">
              Frågor kopplade till ekonomiskt beslutsstöd
            </h2>
            <div className="mt-6 space-y-4">
              {faqItems.map((item) => (
                <article
                  key={item.question}
                  className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] px-5 py-5"
                >
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#0B0B0C]">
                    {item.question}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#5F5F5F]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>
    </>
  );
}
