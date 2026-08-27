import { IndustryLandingPage } from "@/components/marketing/industry-landing-page";
import { createMetadata } from "@/lib/metadata";
import { getIndustryPage } from "@/lib/marketing-seo";

const page = getIndustryPage("hemsida-for-salong")!;

export const metadata = createMetadata(page.seoTitle, page.seoDescription, {
  pathname: `/${page.slug}`,
});

export default function SalonWebsitePage() {
  return <IndustryLandingPage page={page} />;
}
