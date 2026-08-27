"use client";

import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/config/site";

const routeLabels: Record<string, string> = {
  "/exempel": "Exempel",
  "/kontakt": "Kontakt",
  "/om": "Om Altura Nova",
};

export function RouteBreadcrumbSchema() {
  const pathname = usePathname();
  const currentLabel = routeLabels[pathname];

  if (!currentLabel) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hem",
        item: SITE_CONFIG.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: currentLabel,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
