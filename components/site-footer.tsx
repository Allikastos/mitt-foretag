import Image from "next/image";
import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";
import { navigationItems } from "@/lib/site";
import { SectionContainer } from "./section-container";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[#173f35] py-16 text-white">
      <SectionContainer>
        <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="max-w-md">
            <Image src={SITE_CONFIG.footerLogoPath} alt={SITE_CONFIG.name} width={260} height={64} className="h-8 w-auto" />
            <p className="mt-5 text-base leading-7 text-white/70">{SITE_CONFIG.description}</p>
            <p className="mt-5 text-xs leading-6 text-white/45">{SITE_CONFIG.legalNotice}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#f3b89f] uppercase">Utforska</p>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {navigationItems.map((item) => <li key={item.href}><Link href={item.href} className="hover:text-white">{item.label}</Link></li>)}
              <li><Link href="/integritet" className="hover:text-white">Integritet</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#f3b89f] uppercase">Kontakt</p>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><a href={`mailto:${SITE_CONFIG.contact.email}`} className="hover:text-white">{SITE_CONFIG.contact.email}</a></li>
              <li><a href={SITE_CONFIG.contact.phoneHref} className="hover:text-white">{SITE_CONFIG.contact.phoneDisplay}</a></li>
              <li>Digital leverans i {SITE_CONFIG.contact.country} och Norden</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE_CONFIG.name}</span>
          <span>{SITE_CONFIG.tagline}</span>
        </div>
      </SectionContainer>
    </footer>
  );
}
