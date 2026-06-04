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
    <nav className="flex flex-wrap gap-2">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-medium transition ${
            isActive(pathname, item.href)
              ? "bg-[#0B0B0C] text-white"
              : "bg-white text-[#5F5F5F] hover:bg-[#F1EFE8] hover:text-[#0B0B0C]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
