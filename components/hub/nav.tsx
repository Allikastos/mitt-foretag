"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/hub", label: "Översikt" },
  { href: "/hub/kunder", label: "Kunder" },
  { href: "/hub/uppgifter", label: "Uppgifter" },
  { href: "/hub/dokument", label: "Dokument" },
  { href: "/hub/fakturor", label: "Fakturor" },
  { href: "/hub/bokforing", label: "Bokföring" },
  { href: "/hub/processer", label: "Aktivitet" },
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
    <nav className="space-y-1.5" aria-label="Hubbnavigering">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          title={isCollapsed ? item.label : undefined}
          className={`flex min-h-11 items-center rounded-[1.15rem] px-4 py-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--hub-panel-active)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hub-panel)] ${
            isActive(pathname, item.href)
              ? "bg-[var(--hub-panel-active)] text-[var(--hub-panel-active-text)] shadow-[0_14px_28px_-24px_rgba(255,255,255,0.45)]"
              : "text-[var(--hub-panel-muted)] hover:bg-[var(--hub-panel-hover)] hover:text-[var(--hub-panel-contrast)]"
          }`}
        >
          {isCollapsed ? (
            <span className="mx-auto inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--hub-panel-hover)] px-2 text-xs font-semibold tracking-[0.08em]">
              {item.label.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <>
              <span>{item.label}</span>
              <span aria-hidden="true" className="ml-auto text-[var(--hub-panel-subtle)]">
                →
              </span>
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
