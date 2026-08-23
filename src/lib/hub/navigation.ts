export type HubNavItem = {
  href: string;
  label: string;
  compactLabel: string;
};

export type HubNavArea = {
  id: string;
  label: string;
  items: readonly HubNavItem[];
};

export const hubNavAreas: readonly HubNavArea[] = [
  {
    id: "overview",
    label: "Översikt",
    items: [{ href: "/hub", label: "Översikt", compactLabel: "ÖV" }],
  },
  {
    id: "customers-business",
    label: "Kunder & affärer",
    items: [
      { href: "/hub/kunder", label: "Kunder", compactLabel: "KU" },
      { href: "/hub/uppgifter", label: "Uppgifter", compactLabel: "UP" },
    ],
  },
  {
    id: "finance",
    label: "Ekonomi",
    items: [
      { href: "/hub/fakturor", label: "Fakturor", compactLabel: "FA" },
      { href: "/hub/bokforing", label: "Bokföring", compactLabel: "BK" },
    ],
  },
  {
    id: "documents",
    label: "Dokument",
    items: [{ href: "/hub/dokument", label: "Dokument", compactLabel: "DO" }],
  },
  {
    id: "processes",
    label: "Processer",
    items: [{ href: "/hub/processer", label: "Processer", compactLabel: "PR" }],
  },
  {
    id: "integrations",
    label: "Integrationer",
    items: [
      {
        href: "/hub/integrationer",
        label: "Integrationer",
        compactLabel: "IN",
      },
    ],
  },
  {
    id: "settings",
    label: "Inställningar",
    items: [
      {
        href: "/hub/installningar",
        label: "Inställningar",
        compactLabel: "IS",
      },
    ],
  },
] as const;

export function isHubPathActive(pathname: string, href: string) {
  return pathname === href || (href !== "/hub" && pathname.startsWith(`${href}/`));
}

export function isHubAreaActive(pathname: string, area: HubNavArea) {
  return area.items.some((item) => isHubPathActive(pathname, item.href));
}

export function getHubNavItems() {
  return hubNavAreas.flatMap((area) => area.items);
}
