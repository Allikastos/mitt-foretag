"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/config/site";
import { navigationItems } from "@/lib/site";
import { SectionContainer } from "./section-container";

function isActivePath(pathname: string, href: string) {
  return pathname === href;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wordmarkFirstLine, ...wordmarkRest] = SITE_CONFIG.name.split(" ");
  const wordmarkSecondLine = wordmarkRest.join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-black/6 bg-[#F7F7F5]/88 backdrop-blur-xl">
      <SectionContainer className="py-3.5 md:py-5 lg:py-6">
        <div className="flex items-center justify-between gap-3 md:gap-8">
          <Link href="/" className="flex min-w-0 flex-col leading-none">
            <span className="text-[1rem] font-medium tracking-[0.19em] text-[#0B0B0C] uppercase sm:text-[1.05rem] md:text-lg md:tracking-[0.24em]">
              {wordmarkFirstLine}
            </span>
            {wordmarkSecondLine ? (
              <span className="mt-1.5 text-[9px] tracking-[0.22em] text-[#6B6B6B] uppercase md:mt-2 md:text-[10px] md:tracking-[0.28em]">
                {wordmarkSecondLine}
              </span>
            ) : null}
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6 lg:gap-8">
            <nav className="flex items-center gap-6 text-sm lg:gap-8">
              {navigationItems.map((item) => {
                const isActive = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`transition duration-200 ${
                      isActive
                        ? "text-[#0B0B0C]"
                        : "text-[#6B6B6B] hover:text-[#0B0B0C]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-full bg-[#0B0B0C] px-5 py-3 text-sm font-medium text-white shadow-[0_18px_35px_-24px_rgba(0,0,0,0.45)] transition duration-200 hover:opacity-90"
            >
              Boka möte
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/kontakt"
              className="inline-flex items-center justify-center rounded-full bg-[#0B0B0C] px-3.5 py-2 text-[11px] font-medium text-white shadow-[0_14px_30px_-24px_rgba(0,0,0,0.45)] transition duration-200 hover:opacity-90"
            >
              Boka möte
            </Link>

            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "Stäng meny" : "Öppna meny"}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/88 text-[#0B0B0C] transition duration-200 hover:border-black/18"
            >
              <span className="relative h-4 w-4">
                <span
                  className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition duration-300 ${
                    isMenuOpen ? "translate-y-0 rotate-45" : "-translate-y-[5px]"
                  }`}
                />
                <span
                  className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition duration-300 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 bg-current transition duration-300 ${
                    isMenuOpen ? "translate-y-0 -rotate-45" : "translate-y-[5px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 hidden border-t border-black/6 pt-3 text-[11px] uppercase tracking-[0.18em] text-[#6B6B6B] md:flex md:items-center md:justify-between">
          <span>{SITE_CONFIG.tagline}</span>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${SITE_CONFIG.contact.email}`}
              className="transition duration-200 hover:text-[#0B0B0C]"
            >
              {SITE_CONFIG.contact.email}
            </a>
            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="transition duration-200 hover:text-[#0B0B0C]"
            >
              {SITE_CONFIG.contact.phoneDisplay}
            </a>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out md:hidden ${
            isMenuOpen
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div
              id="mobile-navigation"
              className="rounded-[1.5rem] border border-black/8 bg-white/96 p-3 shadow-[0_24px_45px_-34px_rgba(0,0,0,0.25)]"
            >
              <nav className="flex flex-col">
                {navigationItems.map((item) => {
                  const isActive = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`rounded-[1rem] px-3.5 py-3 text-sm transition duration-200 ${
                        isActive
                          ? "bg-[#F7F7F5] text-[#0B0B0C]"
                          : "text-[#5F5F5F] hover:bg-[#F7F7F5] hover:text-[#0B0B0C]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </SectionContainer>
    </header>
  );
}
