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
      "Detaljsida för tjänst hos Bidewind Consulting."
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

      <CTABlock
        title={service.ctaTitle}
        description={service.ctaDescription}
        primary={{ href: "/kontakt", label: "Gå till kontakt" }}
        secondary={{ href: "/tjanster", label: "Tillbaka till tjänster" }}
      />
    </>
  );
}
