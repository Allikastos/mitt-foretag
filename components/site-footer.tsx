import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { navigationItems } from "@/lib/site";
import { SectionContainer } from "./section-container";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[#0B0B0C] py-20 text-white">
      <SectionContainer>
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start">
          <div className="max-w-lg">
            <Image
              src={SITE_CONFIG.footerLogoPath}
              alt={SITE_CONFIG.name}
              width={260}
              height={64}
              className="h-8 w-auto md:h-9"
            />
            <p className="mt-5 text-lg leading-8 text-white/72">
              {SITE_CONFIG.description}
            </p>
            <p className="mt-5 max-w-md text-xs leading-6 text-white/44">
              {SITE_CONFIG.legalNotice}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-[#C6A15B] uppercase">
              Navigering
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
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="transition duration-200 hover:text-white"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.contact.phoneHref}
                  className="transition duration-200 hover:text-white"
                >
                  {SITE_CONFIG.contact.phoneDisplay}
                </a>
              </li>
              <li>
                {SITE_CONFIG.contact.city}, {SITE_CONFIG.contact.country}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/8 pt-6 text-xs tracking-[0.18em] text-white/40 uppercase">
          {SITE_CONFIG.tagline}
        </div>
      </SectionContainer>
    </footer>
  );
}
