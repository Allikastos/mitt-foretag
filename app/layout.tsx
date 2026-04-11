import type { Metadata } from "next";
import Script from "next/script";
import { SITE_CONFIG } from "@/config/site";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen flex-col bg-[#F7F7F5] text-[#1A1A1A]">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        <Script id="schema-organization" type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </Script>
        <Script id="schema-website" type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VH5R30NZY6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
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
