import Link from "next/link";
import { navigationItems, siteConfig } from "@/lib/site";
import { SectionContainer } from "./section-container";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/6 bg-[#F7F7F5]/92 backdrop-blur-xl">
      <SectionContainer className="py-6 sm:py-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="text-lg font-medium tracking-[0.24em] text-[#0B0B0C] uppercase sm:text-xl">
              Bidewind
            </span>
            <span className="mt-2 text-[10px] tracking-[0.28em] text-[#6B6B6B] uppercase">
              Consulting
            </span>
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6 md:justify-end">
            <nav className="flex flex-wrap items-center gap-6 text-sm text-[#6B6B6B]">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition duration-200 hover:text-[#0B0B0C]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-2xl bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_-24px_rgba(0,0,0,0.45)] transition duration-200 hover:opacity-90"
            >
              Boka möte
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-black/6 pt-4 text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B] sm:flex-row sm:items-center sm:justify-between">
          <span>{siteConfig.tagline}</span>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${siteConfig.email}`}
              className="transition duration-200 hover:text-[#0B0B0C]"
            >
              {siteConfig.email}
            </a>
            <a
              href={siteConfig.phoneHref}
              className="transition duration-200 hover:text-[#0B0B0C]"
            >
              {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      </SectionContainer>
    </header>
  );
}
