import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CTABlock } from "@/components/cta-block";
import { PageIntro } from "@/components/page-intro";
import { SectionContainer } from "@/components/section-container";
import { SITE_CONFIG } from "@/config/site";
import { createMetadata } from "@/lib/metadata";
import { getServiceBySlug, services } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const service = getServiceBySlug((await params).slug); return service ? createMetadata(service.seoTitle, service.seoDescription, { pathname: service.href }) : createMetadata("Paket", "Paketet kunde inte hittas."); }

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  if (["redovisning", "rapportering", "radgivning"].includes(slug)) permanentRedirect("/tjanster");
  const service = getServiceBySlug(slug);
  if (!service) notFound();
  return <>
    <section className="pt-8"><SectionContainer><nav aria-label="Brödsmulor" className="text-sm text-[#617169]"><Link href="/">Hem</Link><span className="mx-2">/</span><Link href="/tjanster">Paket</Link><span className="mx-2">/</span><span className="text-[#173f35]">{service.title}</span></nav></SectionContainer></section>
    <PageIntro eyebrow={service.label} title={service.detailTitle} description={service.overview} aside={<div className="rounded-[1.75rem] bg-[#173f35] p-6 text-white"><p className="text-xs font-bold tracking-[0.16em] text-[#f3b89f] uppercase">Introduktionspris</p><p className="mt-3 text-4xl font-semibold tracking-[-0.05em]">{service.price}<span className="ml-1 text-sm text-white/60">{service.suffix}</span></p><p className="mt-1 text-xs text-white/55">exklusive moms</p></div>} />
    <section className="pb-12"><SectionContainer><div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><article className="rounded-[2rem] border border-[#173f35]/10 bg-white/65 p-8"><h2 className="text-2xl font-semibold text-[#173f35]">Det här ingår</h2><ul className="mt-6 space-y-3">{service.included.map((item) => <li key={item} className="flex gap-3 rounded-xl bg-[#eef2ec] px-4 py-3 text-sm leading-6 text-[#52645b]"><span aria-hidden="true" className="text-[#e86f44]">✓</span>{item}</li>)}</ul></article><div className="space-y-6"><article className="rounded-[2rem] bg-[#e86f44] p-8 text-white"><h2 className="text-2xl font-semibold">Tidsplan och återkoppling</h2><p className="mt-5 text-sm leading-7 text-white/80">{service.delivery}</p><p className="mt-3 text-sm leading-7 text-white/80">{service.revisions}</p></article><article className="rounded-[2rem] border border-[#173f35]/10 bg-white/65 p-8"><h2 className="text-2xl font-semibold text-[#173f35]">Ingår inte</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-[#617169]">{service.exclusions.map((item) => <li key={item}>• {item}</li>)}</ul></article></div></div></SectionContainer></section>
    <CTABlock title={service.ctaTitle} description={service.ctaDescription} primary={{ href: "/kontakt", label: SITE_CONFIG.cta.primary }} secondary={{ href: "/tjanster", label: "Jämför paket" }} />
  </>;
}
