import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NordformSite, PenseldragSite, StudioLinneaSite } from "@/components/marketing/demo-sites";
import { demoProjects } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return demoProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = demoProjects.find((item) => item.slug === slug);
  if (!project) return { title: "Demokoncept" };

  return {
    title: `${project.name} · Demokoncept av Altura Nova`,
    description: project.direction,
    robots: { index: false, follow: false },
  };
}

export default async function DemoPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "penseldrag") return <PenseldragSite />;
  if (slug === "nordform") return <NordformSite />;
  if (slug === "studio-linnea") return <StudioLinneaSite />;
  notFound();
}
