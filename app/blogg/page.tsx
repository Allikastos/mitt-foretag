import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { getPublishedPosts } from "@/src/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata = createMetadata(
  "Blogg",
  "Artiklar från Bidewind Consulting om redovisning, finansiell rapportering och ekonomisk rådgivning för mindre företag."
);

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
        title="Perspektiv på redovisning, rapportering och ekonomisk styrning."
        description="Här samlas artiklar och insikter från Bidewind Consulting. Innehållet hämtas från Supabase och är redo att fyllas på med publicerade inlägg."
      />

      <section className="pb-24 pt-4 md:pb-24 md:pt-8">
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
                    Läs artikel
                  </Link>
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
    </>
  );
}
