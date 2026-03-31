/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogRichText } from "@/components/blog-rich-text";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { getPublishedPostBySlug } from "@/src/lib/supabase-server";

export const dynamic = "force-dynamic";

function formatDate(value: string | null, fallback: string) {
  const date = value ?? fallback;

  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return createMetadata(
      "Blogg",
      "Artikel från Bidewind Consulting om redovisning och ekonomisk rådgivning."
    );
  }

  return {
    ...createMetadata(
      post.seo_title || post.title,
      post.seo_description ||
        post.excerpt ||
        post.content.replace(/<[^>]+>/g, "").slice(0, 140)
    ),
    openGraph: {
      title: `${post.seo_title || post.title} | Bidewind Consulting`,
      description:
        post.seo_description ||
        post.excerpt ||
        post.content.replace(/<[^>]+>/g, "").slice(0, 140),
      locale: "sv_SE",
      type: "article",
      siteName: "Bidewind Consulting",
      images: post.image_url ? [{ url: post.image_url }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="pb-20 pt-10 md:pb-24 md:pt-14">
      <SectionContainer>
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blogg"
            className="text-sm font-medium text-[#5F5F5F] transition hover:text-[#0B0B0C]"
          >
            Tillbaka till blogg
          </Link>

          <article className="mt-6 rounded-[2.25rem] border border-black/8 bg-white p-8 shadow-[0_30px_70px_-58px_rgba(0,0,0,0.24)] md:p-12">
            <p className="text-sm font-medium tracking-[0.18em] text-[#C6A15B] uppercase">
              {formatDate(post.publish_at, post.created_at)}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.045em] text-[#0B0B0C] md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-6 text-lg leading-8 text-[#5F5F5F]">
                {post.excerpt}
              </p>
            ) : null}

            {post.image_url ? (
              <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-[#F7F7F5]">
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null}

            <BlogRichText content={post.content} className="mt-10" />
          </article>
        </div>
      </SectionContainer>
    </section>
  );
}
