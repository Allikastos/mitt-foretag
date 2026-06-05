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

export function HubNav({
  isCollapsed = false,
}: {
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1.5" aria-label="Hub navigation">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          title={isCollapsed ? item.label : undefined}
          className={`flex min-h-11 items-center rounded-[1.15rem] px-4 py-3 text-sm font-medium transition ${
            isActive(pathname, item.href)
              ? "bg-white text-[#111111] shadow-[0_14px_28px_-24px_rgba(255,255,255,0.45)]"
              : "text-white/72 hover:bg-white/8 hover:text-white"
          }`}
        >
          {isCollapsed ? (
            <span className="mx-auto inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white/8 px-2 text-xs font-semibold tracking-[0.08em]">
              {item.label.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <>
              <span>{item.label}</span>
              <span aria-hidden="true" className="ml-auto text-white/32">
                →
              </span>
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
