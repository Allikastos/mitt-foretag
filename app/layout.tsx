import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Bidewind Consulting hjälper mindre företag med redovisning, finansiell rapportering och ekonomisk analys för bättre kontroll, tydligare beslutsunderlag och långsiktigt hållbar styrning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen flex-col bg-[#F7F7F5] text-[#1A1A1A]">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
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
