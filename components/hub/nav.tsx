"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/hub", label: "Översikt" },
  { href: "/hub/kunder", label: "Kunder" },
  { href: "/hub/uppgifter", label: "Uppgifter" },
  { href: "/hub/dokument", label: "Dokument" },
  { href: "/hub/fakturor", label: "Fakturor" },
  { href: "/hub/installningar", label: "Inställningar" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/hub" && pathname.startsWith(`${href}/`));
}

export function HubNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5" aria-label="Hub navigation">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          className={`flex min-h-11 items-center justify-between rounded-[1.15rem] px-4 py-3 text-sm font-medium transition ${
            isActive(pathname, item.href)
              ? "bg-white text-[#111111] shadow-[0_14px_28px_-24px_rgba(255,255,255,0.45)]"
              : "text-white/72 hover:bg-white/8 hover:text-white"
          }`}
        >
          <span>{item.label}</span>
          <span aria-hidden="true" className="text-white/32">
            →
          </span>
        </Link>
      ))}
    </nav>
  );
}
