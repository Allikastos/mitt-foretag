"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { HubNav } from "@/components/hub/nav";
import { HubSignOutButton } from "@/components/hub/sign-out-button";

const storageKey = "altura-hub-sidebar-collapsed";
const storageEventName = "altura-hub-sidebar-changed";
const collapsibleMediaQuery = "(min-width: 1280px)";

type HubAppShellProps = {
  children: React.ReactNode;
  organizationName: string;
  userEmail: string;
  membershipRoleLabel: string;
  supportEmail: string;
};

function compactBadge(label: string) {
  return label
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleStorage(event: Event) {
    if (event instanceof StorageEvent && event.key && event.key !== storageKey) {
      return;
    }

    onStoreChange();
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(storageEventName, handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(storageEventName, handleStorage);
  };
}

function getSidebarSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(storageKey) === "true";
}

function subscribeToCollapsible(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const mediaQuery = window.matchMedia(collapsibleMediaQuery);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getCollapsibleSnapshot() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia(collapsibleMediaQuery).matches;
}

export function HubAppShell({
  children,
  organizationName,
  userEmail,
  membershipRoleLabel,
  supportEmail,
}: HubAppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isCollapsed = useSyncExternalStore(
    subscribe,
    getSidebarSnapshot,
    () => false
  );
  const canCollapse = useSyncExternalStore(
    subscribeToCollapsible,
    getCollapsibleSnapshot,
    () => false
  );
  const isVisuallyCollapsed = canCollapse && isCollapsed;

  function handleToggle() {
    const nextValue = !isCollapsed;
    window.localStorage.setItem(storageKey, String(nextValue));
    window.dispatchEvent(new Event(storageEventName));
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="lg:hidden">
        <div className="rounded-[1.5rem] border border-[color:var(--hub-panel-border)] bg-[var(--hub-panel)] px-4 py-3 text-[var(--hub-panel-contrast)] shadow-[0_22px_60px_-48px_rgba(0,0,0,0.55)]">
          <div className="flex min-h-12 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--hub-accent)]">
                Hub
              </p>
              <p className="mt-1 truncate text-base font-semibold tracking-[-0.025em]">
                {organizationName}
              </p>
            </div>
            <span className="rounded-full bg-[var(--hub-panel-hover)] px-3 py-1.5 text-xs text-[var(--hub-panel-muted)]">
              {membershipRoleLabel}
            </span>
            <button
              type="button"
              aria-expanded={isMobileMenuOpen}
              aria-controls="hub-mobile-navigation"
              aria-label={
                isMobileMenuOpen ? "Stäng mobilmenyn" : "Öppna mobilmenyn"
              }
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--hub-panel-active)] px-4 text-sm font-medium text-[var(--hub-panel-active-text)] transition hover:opacity-90"
            >
              {isMobileMenuOpen ? "Stäng" : "Meny"}
            </button>
          </div>

          {isMobileMenuOpen ? (
            <div
              id="hub-mobile-navigation"
              className="mt-3 border-t border-[color:var(--hub-panel-border)] pt-3"
            >
              <p className="mb-3 text-xs leading-5 text-[var(--hub-panel-muted)]">
                Inloggad som {userEmail}
              </p>
              <HubNav onNavigate={() => setIsMobileMenuOpen(false)} />
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[color:var(--hub-panel-border)] pt-4">
                <a
                  href={`mailto:${supportEmail}`}
                  className="text-sm text-[var(--hub-panel-muted)] transition hover:text-[var(--hub-panel-contrast)]"
                >
                  Support
                </a>
                <Link
                  href="/"
                  className="text-sm text-[var(--hub-panel-muted)] transition hover:text-[var(--hub-panel-contrast)]"
                >
                  Till Altura Nova
                </Link>
                <HubSignOutButton compact />
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <aside
        className={`hidden lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-3rem)] lg:self-start ${
          isVisuallyCollapsed ? "lg:w-[5.75rem]" : "lg:w-[16.75rem] xl:w-[18.5rem]"
        }`}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={!isVisuallyCollapsed}
            aria-label={
              isVisuallyCollapsed ? "Expandera sidomenyn" : "Fäll in sidomenyn"
            }
            className="absolute right-4 top-4 z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-[color:var(--hub-panel-border)] bg-[var(--hub-panel-hover)] text-sm font-medium text-[var(--hub-panel-muted)] transition hover:bg-[var(--hub-panel-active)] hover:text-[var(--hub-panel-active-text)] xl:inline-flex"
          >
            {isVisuallyCollapsed ? ">" : "<"}
          </button>

          <div className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain rounded-[2rem] border border-[color:var(--hub-panel-border)] bg-[var(--hub-panel)] p-5 text-[var(--hub-panel-contrast)] shadow-[0_30px_80px_-52px_rgba(0,0,0,0.55)] md:p-6">
            <div className={isVisuallyCollapsed ? "pr-12" : "pr-16"}>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--hub-accent)]">
                Hub
              </p>
              {isVisuallyCollapsed ? (
                <div
                  className="mt-4 flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[var(--hub-panel-hover)] text-lg font-semibold text-[var(--hub-panel-contrast)]"
                  title={organizationName}
                >
                  {compactBadge(organizationName)}
                </div>
              ) : (
                <>
                  <h1 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.045em] text-[var(--hub-panel-contrast)]">
                    {organizationName}
                  </h1>
                  <p className="mt-4 text-sm leading-6 text-[var(--hub-panel-muted)]">
                    Inloggad som {userEmail} med rollen {membershipRoleLabel}.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 flex-1">
              <HubNav isCollapsed={isVisuallyCollapsed} />
            </div>

            <div className="mt-8 border-t border-[color:var(--hub-panel-border)] pt-5">
              {isVisuallyCollapsed ? (
                <div className="space-y-2">
                  <a
                    href={`mailto:${supportEmail}`}
                    title="Support"
                    className="flex h-11 items-center justify-center rounded-[1rem] text-sm font-medium text-[var(--hub-panel-muted)] transition hover:bg-[var(--hub-panel-hover)] hover:text-[var(--hub-panel-contrast)]"
                  >
                    S
                  </a>
                  <Link
                    href="/"
                    title="Till Altura Nova"
                    className="flex h-11 items-center justify-center rounded-[1rem] text-sm font-medium text-[var(--hub-panel-muted)] transition hover:bg-[var(--hub-panel-hover)] hover:text-[var(--hub-panel-contrast)]"
                  >
                    AN
                  </Link>
                  <HubSignOutButton compact isCollapsed />
                </div>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--hub-panel-subtle)]">
                    Snabblankar
                  </p>
                  <div className="mt-4 space-y-1.5">
                    <a
                      href={`mailto:${supportEmail}`}
                      className="block text-sm text-[var(--hub-panel-muted)] transition hover:text-[var(--hub-panel-contrast)]"
                    >
                      Support
                    </a>
                    <Link
                      href="/"
                      className="block text-sm text-[var(--hub-panel-muted)] transition hover:text-[var(--hub-panel-contrast)]"
                    >
                      Till Altura Nova
                    </Link>
                    <HubSignOutButton compact />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
