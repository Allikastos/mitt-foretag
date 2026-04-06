import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { notFound } from "next/navigation";
import { CTABlock } from "@/components/cta-block";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { createMetadata } from "@/lib/metadata";
import { getServiceBySlug, services } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return createMetadata(
      "Tjänst",
      `Detaljsida för tjänst hos ${SITE_CONFIG.name}.`
    );
  }

  return createMetadata(service.seoTitle, service.seoDescription);
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <PageIntro
        eyebrow={service.label}
        title={service.detailTitle}
        description={service.overview}
        aside={
          <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_20px_50px_-45px_rgba(0,0,0,0.2)]">
            <p className="text-sm font-medium tracking-[0.2em] text-[#C6A15B] uppercase">
              Passar när
            </p>
            <ul className="mt-5 space-y-3">
              {service.fit.map((item) => (
                <li
                  key={item}
                  className="rounded-[1.15rem] border border-black/8 bg-[#F7F7F5] px-4 py-3 text-sm leading-6 text-[#5F5F5F]"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/kontakt"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white transition duration-200 hover:opacity-90"
            >
              Boka ett första samtal
            </Link>
          </div>
        }
      />

      <section className="pb-6 pt-8 md:pb-10 md:pt-10">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                {service.includedTitle}
              </h2>
              <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                {service.includedLead}
              </p>
              <ul className="mt-8 space-y-4">
                {service.included.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] p-5 text-sm leading-7 text-[#5F5F5F]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              {service.includedOutro ? (
                <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                  {service.includedOutro}
                </p>
              ) : null}
            </article>

            <article className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                {service.secondaryTitle}
              </h2>
              <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                {service.secondaryLead}
              </p>
              <ul className="mt-8 space-y-4">
                {service.secondary.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] p-5 text-sm leading-7 text-[#5F5F5F]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-[2.15rem] bg-[#0B0B0C] p-8 text-white shadow-[0_28px_60px_-50px_rgba(0,0,0,0.45)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] md:text-3xl">
                {service.workTitle}
              </h2>
              <div className="mt-6 space-y-5">
                {service.workParagraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-base leading-7 text-white/72"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                {service.fitTitle}
              </h2>
              <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                {service.fitLead}
              </p>
              <ul className="mt-8 space-y-4">
                {service.fit.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] p-5 text-sm leading-7 text-[#5F5F5F]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </SectionContainer>
      </section>

      <section className="pb-6 pt-4 md:pb-10 md:pt-6">
        <SectionContainer>
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Nästa steg
              </p>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                Så ser ett första samtal ut
              </h2>
              <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                Vi går igenom hur ni arbetar idag, var ekonomin skapar mest
                friktion och vilket upplägg som skulle ge bäst effekt direkt i
                vardagen.
              </p>
              <Link
                href="/kontakt"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:border-[#0B0B0C] hover:bg-[#F7F7F5]"
              >
                Gå till kontakt
                <span aria-hidden="true">→</span>
              </Link>
            </article>

            <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
                Vidare läsning
              </p>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                Få mer kontext innan du tar nästa steg
              </h2>
              <p className="mt-6 text-base leading-7 text-[#5F5F5F]">
                Om du vill fördjupa dig först finns artiklar om {service.label.toLowerCase()},
                ekonomisk styrning och vanliga frågor för mindre företag i bloggen.
              </p>
              <Link
                href="/blogg"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[#0B0B0C] transition duration-200 hover:border-[#0B0B0C] hover:bg-[#F7F7F5]"
              >
                Till bloggen
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title={service.ctaTitle}
        description={service.ctaDescription}
        primary={{ href: "/kontakt", label: "Boka ett första samtal" }}
        secondary={{ href: "/tjanster", label: "Tillbaka till tjänster" }}
      />
    </>
  );
}
