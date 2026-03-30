import Link from "next/link";
import { navigationItems, siteConfig } from "@/lib/site";
import { SectionContainer } from "./section-container";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[#0B0B0C] py-20 text-white">
      <SectionContainer>
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start">
          <div className="max-w-lg">
            <p className="text-xs font-medium tracking-[0.24em] text-[#C6A15B] uppercase">
              {siteConfig.name}
            </p>
            <p className="mt-5 text-lg leading-8 text-white/72">
              Premium redovisning, finansiell rapportering och ekonomisk rådgivning
              för mindre företag i Linköping och i övriga Sverige.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Navigation
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/72">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition duration-200 hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Kontakt
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/72">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition duration-200 hover:text-white"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.phoneHref}
                  className="transition duration-200 hover:text-white"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li>
                {siteConfig.city}, {siteConfig.country}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/8 pt-6 text-xs tracking-[0.18em] text-white/40 uppercase">
          Ekonomisk styrning, redovisning och rådgivning för mindre företag
        </div>
      </SectionContainer>
    </footer>
  );
}
