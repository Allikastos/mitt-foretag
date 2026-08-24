"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/config/site";
import { navigationItems } from "@/lib/site";
import { SectionContainer } from "./section-container";

function isActivePath(pathname: string, href: string) {
  const path = href.split("#")[0];
  return path !== "/" && pathname.startsWith(path);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#173f35]/10 bg-[#f3f0e8]/90 backdrop-blur-xl">
      <SectionContainer className="py-3.5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center leading-none" onClick={() => setIsMenuOpen(false)}>
            <Image src={SITE_CONFIG.logoPath} alt={SITE_CONFIG.name} width={224} height={56} priority className="h-9 w-auto md:h-10" />
          </Link>

          <div className="hidden items-center gap-5 xl:flex">
            <nav aria-label="Huvudmeny" className="flex items-center gap-1 rounded-full border border-[#173f35]/10 bg-white/65 p-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition ${isActivePath(pathname, item.href) ? "bg-[#173f35] text-white" : "text-[#53635c] hover:bg-white hover:text-[#173f35]"}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link href="/kontakt" className="inline-flex items-center justify-center rounded-full bg-[#e86f44] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(156,66,35,0.65)] transition hover:-translate-y-0.5 hover:bg-[#d95f35]">
              {SITE_CONFIG.cta.primaryShort}
            </Link>
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Link href="/kontakt" className="hidden rounded-full bg-[#e86f44] px-4 py-2.5 text-xs font-semibold text-white sm:inline-flex">Få ett förslag</Link>
            <button type="button" aria-expanded={isMenuOpen} aria-controls="mobile-navigation" aria-label={isMenuOpen ? "Stäng meny" : "Öppna meny"} onClick={() => setIsMenuOpen((open) => !open)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#173f35]/15 bg-white/70 text-[#173f35]">
              <span aria-hidden="true" className="text-xl leading-none">{isMenuOpen ? "×" : "≡"}</span>
            </button>
          </div>
        </div>

        <div className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 xl:hidden ${isMenuOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <nav id="mobile-navigation" aria-label="Mobilmeny" className="rounded-[1.5rem] border border-[#173f35]/10 bg-[#fffdf8] p-3 shadow-xl shadow-[#173f35]/8">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-medium text-[#45564f] hover:bg-[#eef2ec]">{item.label}</Link>
              ))}
              <div className="mt-2 border-t border-[#173f35]/10 pt-3">
                <Link href="/kontakt" onClick={() => setIsMenuOpen(false)} className="block rounded-xl bg-[#e86f44] px-4 py-3 text-center text-sm font-semibold text-white">Få ett kostnadsfritt förslag</Link>
              </div>
            </nav>
          </div>
        </div>
      </SectionContainer>
    </header>
  );
}
