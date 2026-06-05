import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTABlock } from "@/components/cta-block";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import { createMetadata } from "@/lib/metadata";
import {
  getServiceBySlug,
  services,
  type Service,
  type ServiceSlug,
} from "@/lib/site";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

function getRelatedServices(currentSlug: ServiceSlug): Service[] {
  return services.filter((service) => service.slug !== currentSlug).slice(0, 2);
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return createMetadata("Tjänst", "Den efterfrågade tjänsten kunde inte hittas.");
  }

  return createMetadata(service.seoTitle, service.seoDescription, {
    pathname: service.href,
  });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const relatedServices = getRelatedServices(service.slug);
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.title} | ${SITE_CONFIG.name}`,
    description: service.summary,
    provider: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    areaServed: "SE",
    url: `${SITE_CONFIG.url}${service.href}`,
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
        name: "Tjänster",
        item: `${SITE_CONFIG.url}/tjanster`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.title,
        item: `${SITE_CONFIG.url}${service.href}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
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
                <Link href="/tjanster" className="transition hover:text-[#0B0B0C]">
                  Tjänster
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-[#0B0B0C]">{service.title}</li>
            </ol>
          </nav>
        </SectionContainer>
      </section>

      <PageIntro
        eyebrow={service.label}
        title={service.detailTitle}
        description={service.overview}
      />

      <section className="pb-8 pt-4 md:pb-10 md:pt-8">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-3xl">
                {service.includedTitle}
              </h2>
              <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
                {service.includedLead}
              </p>
              <ul className="mt-6 space-y-3">
                {service.included.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.25rem] border border-black/8 bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-[#5F5F5F]"
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

            <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-3xl">
                {service.secondaryTitle}
              </h2>
              <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
                {service.secondaryLead}
              </p>
              <ul className="mt-6 space-y-3">
                {service.secondary.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.25rem] border border-black/8 bg-[#F7F7F5] px-5 py-4 text-sm leading-7 text-[#5F5F5F]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </SectionContainer>
      </section>

      <section className="py-24">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
            <article className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-3xl">
                {service.workTitle}
              </h2>
              <div className="mt-5 space-y-5 text-base leading-7 text-[#5F5F5F]">
                {service.workParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-black/8 bg-[#F7F7F5] p-8 md:p-10">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#0B0B0C] md:text-3xl">
                {service.fitTitle}
              </h2>
              <p className="mt-5 text-base leading-7 text-[#5F5F5F]">
                {service.fitLead}
              </p>
              <ul className="mt-6 space-y-3">
                {service.fit.map((item) => (
                  <li
                    key={item}
                    className="rounded-[1.25rem] border border-black/8 bg-white px-5 py-4 text-sm leading-7 text-[#5F5F5F]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </SectionContainer>
      </section>

      <section className="pb-12">
        <SectionContainer>
          <div className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
            <p className="text-sm font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Relaterade tjänster
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {relatedServices.map((related) => (
                <Link
                  key={related.slug}
                  href={related.href}
                  className="rounded-[1.5rem] border border-black/8 bg-[#F7F7F5] px-5 py-5 transition hover:border-black/20"
                >
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#0B0B0C]">
                    {related.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#5F5F5F]">
                    {related.summary}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href="/blogg"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0B0B0C] transition hover:text-[#C6A15B]"
              >
                Läs relevanta artiklar i bloggen
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title={service.ctaTitle}
        description={service.ctaDescription}
        primary={{ href: "/kontakt", label: SITE_CONFIG.cta.primary }}
        secondary={{ href: "/tjanster", label: "Till alla tjänster" }}
      />
    </>
  );
}
