"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  getHubNavItems,
  hubNavAreas,
  isHubAreaActive,
  isHubPathActive,
  type HubNavItem,
} from "@/src/lib/hub/navigation";

const linkClassName =
  "flex min-h-11 items-center rounded-[1.05rem] px-4 py-2.5 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--hub-panel-active)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--hub-panel)]";

function NavLink({
  item,
  pathname,
  onNavigate,
  compact = false,
}: {
  item: HubNavItem;
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const active = isHubPathActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={compact ? item.label : undefined}
      className={`${linkClassName} ${
        active
          ? "bg-[var(--hub-panel-active)] text-[var(--hub-panel-active-text)] shadow-[0_14px_28px_-24px_rgba(255,255,255,0.45)]"
          : "text-[var(--hub-panel-muted)] hover:bg-[var(--hub-panel-hover)] hover:text-[var(--hub-panel-contrast)]"
      }`}
    >
      {compact ? (
        <span className="mx-auto inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-[var(--hub-panel-hover)] px-2 text-[11px] font-semibold tracking-[0.08em]">
          {item.compactLabel}
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
  );
}

export function HubNav({
  isCollapsed = false,
  onNavigate,
}: {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [collapsedAreas, setCollapsedAreas] = useState<string[]>(() =>
    hubNavAreas
      .filter((area) => !isHubAreaActive(pathname, area))
      .map((area) => area.id),
  );

  if (isCollapsed) {
    return (
      <nav className="space-y-1.5" aria-label="Hubbnavigering">
        {getHubNavItems().map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
            compact
          />
        ))}
      </nav>
    );
  }

  return (
    <nav className="space-y-2" aria-label="Hubbnavigering">
      {hubNavAreas.map((area) => {
        const isActive = isHubAreaActive(pathname, area);
        const isExpanded = !collapsedAreas.includes(area.id);
        const regionId = `hub-nav-area-${area.id}`;

        return (
          <section
            key={area.id}
            className={`rounded-[1.2rem] border px-1.5 py-1.5 transition ${
              isActive
                ? "border-[color:var(--hub-panel-border)] bg-[var(--hub-panel-hover)]"
                : "border-transparent"
            }`}
          >
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={regionId}
              onClick={() =>
                setCollapsedAreas((current) =>
                  current.includes(area.id)
                    ? current.filter((id) => id !== area.id)
                    : [...current, area.id],
                )
              }
              className="flex min-h-10 w-full items-center rounded-[0.9rem] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hub-panel-subtle)] outline-none transition hover:text-[var(--hub-panel-contrast)] focus-visible:ring-2 focus-visible:ring-[var(--hub-panel-active)]"
            >
              <span>{area.label}</span>
              <span aria-hidden="true" className="ml-auto text-base leading-none">
                {isExpanded ? "−" : "+"}
              </span>
            </button>
            <div id={regionId} hidden={!isExpanded} className="mt-1 space-y-1">
              {area.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
