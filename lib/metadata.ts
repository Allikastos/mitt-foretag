import type { Metadata } from "next";
import { siteConfig } from "./site";

export function createMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      locale: "sv_SE",
      type: "website",
      siteName: siteConfig.name,
    },
  };
}
