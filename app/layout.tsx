import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.url}/#organization`,
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: new URL(SITE_CONFIG.logoPath, SITE_CONFIG.url).toString(),
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.contact.email,
    telephone: SITE_CONFIG.contact.phoneDisplay,
    founder: {
      "@type": "Person",
      name: "Albin Holmberg",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "kundservice",
      email: SITE_CONFIG.contact.email,
      telephone: SITE_CONFIG.contact.phoneDisplay,
      availableLanguage: "sv",
      areaServed: "SE",
    },
    areaServed: {
      "@type": "Country",
      name: "Sverige",
    },
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    inLanguage: "sv-SE",
  };

  return (
    <html lang="sv" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
