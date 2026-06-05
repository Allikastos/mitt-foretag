import type { Metadata } from "next";
import Script from "next/script";
import { SITE_CONFIG } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    email: SITE_CONFIG.contact.email,
    telephone: SITE_CONFIG.contact.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.contact.city,
      addressCountry: SITE_CONFIG.contact.country,
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
    <html lang="sv" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <Script id="schema-organization" type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </Script>
        <Script id="schema-website" type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VH5R30NZY6"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VH5R30NZY6');
          `}
        </Script>
      </body>
    </html>
  );
}
