import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";

type MetadataOptions = {
  pathname?: string;
  type?: "website" | "article";
};

export function createMetadata(
  title: string,
  description: string,
  options: MetadataOptions = {}
): Metadata {
  const canonical = options.pathname || undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      locale: "sv_SE",
      type: options.type || "website",
      siteName: SITE_CONFIG.name,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
    },
  };
}
