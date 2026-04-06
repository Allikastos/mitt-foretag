import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";

export function createMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      locale: "sv_SE",
      type: "website",
      siteName: SITE_CONFIG.name,
    },
  };
}
