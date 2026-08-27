import { IndustryLandingPage } from "@/components/marketing/industry-landing-page";
import { createMetadata } from "@/lib/metadata";
import { getIndustryPage } from "@/lib/marketing-seo";

const page = getIndustryPage("hemsida-for-konsultbolag")!;

export const metadata = createMetadata(page.seoTitle, page.seoDescription, {
  pathname: `/${page.slug}`,
});

export default function ConsultingWebsitePage() {
  return <IndustryLandingPage page={page} />;
}
