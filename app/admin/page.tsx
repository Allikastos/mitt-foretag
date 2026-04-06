import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SITE_CONFIG } from "@/config/site";
import { AdminPostEditor } from "@/components/admin-post-editor";
import { AdminSignOutButton } from "@/components/admin-sign-out-button";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { getAdminPosts, getLoggedInUser } from "@/src/lib/supabase-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  ...createMetadata(
    "Admin",
    `Adminpanel för att hantera blogg och innehåll i ${SITE_CONFIG.name}.`
  ),
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const user = await getLoggedInUser();

  if (!user) {
    redirect("/admin/login");
  }

  const posts = await getAdminPosts();
  const publishedCount = posts.filter((post) => post.status === "published").length;
  const scheduledCount = posts.filter((post) => post.status === "scheduled").length;
  const draftCount = posts.filter((post) => post.status === "draft").length;

  return (
    <section className="pb-16 pt-8 md:pb-24 md:pt-12">
      <SectionContainer>
        <div className="space-y-6 md:space-y-7">
          <div className="flex flex-col gap-5 rounded-[1.9rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbf8_100%)] p-6 shadow-[0_28px_60px_-52px_rgba(0,0,0,0.18)] md:flex-row md:items-end md:justify-between md:rounded-[2.15rem] md:p-8">
            <div>
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Adminpanel
              </p>
              <h1 className="mt-3 text-[1.95rem] font-semibold tracking-[-0.045em] text-[#0B0B0C] md:mt-4 md:text-[2.65rem]">
                Blogg, publicering och SEO
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5F5F5F] md:text-base">
                Inloggad som {user.email ?? "okänd användare"}. Här hanterar du
                utkast, schemaläggning, publicering, featured images och SEO för
                varje artikel.
              </p>
            </div>

            <AdminSignOutButton />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.45rem] border border-black/8 bg-white p-5 shadow-[0_20px_44px_-48px_rgba(0,0,0,0.18)] md:p-6">
              <p className="text-sm font-medium tracking-[0.18em] text-[#C6A15B] uppercase">
                Publicerade
              </p>
              <p className="mt-3 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#0B0B0C]">
                {publishedCount}
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-white p-5 shadow-[0_20px_44px_-48px_rgba(0,0,0,0.18)] md:p-6">
              <p className="text-sm font-medium tracking-[0.18em] text-[#C6A15B] uppercase">
                Schemalagda
              </p>
              <p className="mt-3 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#0B0B0C]">
                {scheduledCount}
              </p>
            </div>
            <div className="rounded-[1.45rem] border border-black/8 bg-white p-5 shadow-[0_20px_44px_-48px_rgba(0,0,0,0.18)] md:p-6">
              <p className="text-sm font-medium tracking-[0.18em] text-[#C6A15B] uppercase">
                Utkast
              </p>
              <p className="mt-3 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#0B0B0C]">
                {draftCount}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/blogg"
              className="text-sm font-medium text-[#0B0B0C] transition hover:text-[#C6A15B]"
            >
              Visa publika bloggen
            </Link>
          </div>

          <AdminPostEditor initialPosts={posts} />
        </div>
      </SectionContainer>
    </section>
  );
}
