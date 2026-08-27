import type { ReactNode } from "react";
import { RouteBreadcrumbSchema } from "@/components/marketing/route-breadcrumb-schema";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="marketing-surface flex min-h-screen flex-col text-[#16201c]">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <RouteBreadcrumbSchema />
    </div>
  );
}
