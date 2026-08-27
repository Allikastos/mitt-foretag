import Link from "next/link";
import { CTABlock } from "@/components/cta-block";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { WebsitePreview } from "@/components/marketing/website-preview";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import type { IndustryPage } from "@/lib/marketing-seo";
import { demoProjects } from "@/lib/site";

type IndustryLandingPageProps = {
  page: IndustryPage;
};

export function IndustryLandingPage({ page }: IndustryLandingPageProps) {
  const demo = demoProjects.find((project) => project.slug === page.demoSlug);

  if (!demo) return null;

  return (
    <>
      <Breadcrumbs items={[{ label: "Hem", href: "/" }, { label: page.eyebrow }]} />
      <PageIntro
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        aside={<WebsitePreview {...demo} compact />}
      />

      <section className="pb-16 md:pb-24">
        <SectionContainer>
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">
                Vad sidan behöver lösa
              </p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[#173f35] text-balance">
                Byggd kring hur kunder faktiskt väljer {page.industry}.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#617169]">{page.intro}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              {page.priorities.map((priority, index) => (
                <article
                  key={priority.title}
                  className="rounded-[1.75rem] border border-[#173f35]/10 bg-white/65 p-6"
                >
                  <span className="text-xs font-bold text-[#e86f44]">0{index + 1}</span>
                  <h3 className="mt-7 text-xl font-semibold tracking-[-0.03em] text-[#173f35]">
                    {priority.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#617169]">
                    {priority.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>

      <section className="py-16 md:py-24">
        <SectionContainer>
          <div className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
            <article className="rounded-[2.25rem] bg-[#173f35] p-7 text-white md:p-10">
              <p className="text-xs font-bold tracking-[0.2em] text-[#f3b89f] uppercase">
                Rekommenderat innehåll
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
                Delar som brukar göra störst nytta
              </h2>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {page.sections.map((section) => (
                  <li
                    key={section}
                    className="flex gap-3 rounded-[1.25rem] bg-white/8 p-4 text-sm leading-6 text-white/75"
                  >
                    <span aria-hidden="true" className="text-[#f3b89f]">✓</span>
                    {section}
                  </li>
                ))}
              </ul>
            </article>

            <aside className="rounded-[2.25rem] bg-[#e8c8ad] p-7 text-[#173f35] md:p-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase">Paket som ofta passar</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em]">{page.package.name}</h2>
              <p className="mt-5 text-base leading-8 text-[#45564f]">{page.package.reason}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={page.package.href}
                  className="inline-flex justify-center rounded-full bg-[#173f35] px-5 py-3 text-sm font-semibold text-white"
                >
                  Se paketet
                </Link>
                <Link
                  href={`/demo/${page.demoSlug}`}
                  className="inline-flex justify-center rounded-full border border-[#173f35]/20 px-5 py-3 text-sm font-semibold"
                >
                  Se {page.demoName}
                </Link>
              </div>
            </aside>
          </div>
        </SectionContainer>
      </section>

      <section className="py-16 md:py-24">
        <SectionContainer>
          <div className="mx-auto max-w-4xl rounded-[2.25rem] border border-[#173f35]/10 bg-[#fffdf8] p-7 md:p-10">
            <p className="text-xs font-bold tracking-[0.2em] text-[#e86f44] uppercase">
              Vanliga frågor
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-[#173f35]">
              Inför en ny hemsida för {page.industry}
            </h2>
            <div className="mt-6 divide-y divide-[#173f35]/10">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold text-[#173f35]">
                    <span>{faq.question}</span>
                    <span aria-hidden="true" className="text-xl text-[#e86f44] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 max-w-3xl pr-8 text-sm leading-7 text-[#617169]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>

      <CTABlock
        title={`Vill du ha ett förslag på en hemsida för ditt ${page.industry}?`}
        description="Berätta kort om verksamheten, tjänsterna och vad du vill att kunderna ska göra på sidan. Jag återkommer med ett tydligt nästa steg utan kostnad."
        primary={{ href: "/kontakt", label: SITE_CONFIG.cta.primary }}
        secondary={{ href: "/tjanster", label: "Jämför paket" }}
      />
    </>
  );
}
