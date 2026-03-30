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
        title={service.title}
        description={service.overview}
        aside={
          <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 text-sm leading-7 text-[#5F5F5F] shadow-[0_20px_50px_-45px_rgba(0,0,0,0.2)]">
            {service.detailLead}
          </div>
        }
      />

      <section className="pb-6 pt-8 md:pb-10 md:pt-10">
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
            <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)] md:p-10">
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C] md:text-3xl">
                {service.includedTitle}
              </h2>
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
            </div>

            <div className="space-y-6">
              <div className="rounded-[2.15rem] border border-black/8 bg-white p-8 shadow-[0_24px_60px_-55px_rgba(0,0,0,0.18)]">
                <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-[#0B0B0C]">
                  {service.fitTitle}
                </h2>
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
              </div>

              <div className="rounded-[2.15rem] bg-[#0B0B0C] p-8 text-white shadow-[0_28px_60px_-50px_rgba(0,0,0,0.45)]">
                <h2 className="text-balance text-2xl font-semibold tracking-[-0.035em]">
                  {service.examplesTitle}
                </h2>
                <ul className="mt-8 space-y-4">
                  {service.examples.map((item) => (
                    <li
                      key={item}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/72"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title={`Vill du prata om ${service.title.toLowerCase()} för ditt företag?`}
        description="Hör av dig för ett första samtal om hur ett mer strukturerat ekonomiskt upplägg kan se ut i din verksamhet."
        primary={{ href: "/kontakt", label: "Gå till kontakt" }}
        secondary={{ href: "/tjanster", label: "Tillbaka till tjänster" }}
      />
    </>
  );
}
