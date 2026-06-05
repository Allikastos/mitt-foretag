"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { HubNav } from "@/components/hub/nav";
import { HubSignOutButton } from "@/components/hub/sign-out-button";

const storageKey = "altura-hub-sidebar-collapsed";
const storageEventName = "altura-hub-sidebar-changed";

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

export function HubAppShell({
  children,
  organizationName,
  userEmail,
  membershipRoleLabel,
  supportEmail,
}: HubAppShellProps) {
  const isCollapsed = useSyncExternalStore(
    subscribe,
    getSidebarSnapshot,
    () => false
  );

  function handleToggle() {
    const nextValue = !isCollapsed;
    window.localStorage.setItem(storageKey, String(nextValue));
    window.dispatchEvent(new Event(storageEventName));
  }

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <aside
        className={`xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:self-start ${
          isCollapsed ? "xl:w-[5.75rem]" : "xl:w-[18.5rem]"
        }`}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expandera sidomenyn" : "Fäll in sidomenyn"}
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8 text-sm font-medium text-white/78 transition hover:bg-white/14 hover:text-white"
          >
            {isCollapsed ? ">" : "<"}
          </button>

          <div className="flex h-full flex-col rounded-[2rem] border border-black/8 bg-[#111111] p-5 text-white shadow-[0_30px_80px_-52px_rgba(0,0,0,0.55)] md:p-6">
            <div className={isCollapsed ? "pr-12" : "pr-16"}>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-[#C6A15B]">
                Hub
              </p>
              {isCollapsed ? (
                <div
                  className="mt-4 flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-white/8 text-lg font-semibold text-white"
                  title={organizationName}
                >
                  {compactBadge(organizationName)}
                </div>
              ) : (
                <>
                  <h1 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.045em] text-white">
                    {organizationName}
                  </h1>
                  <p className="mt-4 text-sm leading-6 text-white/68">
                    Inloggad som {userEmail} med rollen {membershipRoleLabel}.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 flex-1">
              <HubNav isCollapsed={isCollapsed} />
            </div>

            <div className="mt-8 border-t border-white/10 pt-5">
              {isCollapsed ? (
                <div className="space-y-2">
                  <a
                    href={`mailto:${supportEmail}`}
                    title="Support"
                    className="flex h-11 items-center justify-center rounded-[1rem] text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white"
                  >
                    S
                  </a>
                  <Link
                    href="/"
                    title="Till Altura Nova"
                    className="flex h-11 items-center justify-center rounded-[1rem] text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white"
                  >
                    AN
                  </Link>
                  <HubSignOutButton compact isCollapsed />
                </div>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">
                    Snabblankar
                  </p>
                  <div className="mt-4 space-y-1.5">
                    <a
                      href={`mailto:${supportEmail}`}
                      className="block text-sm text-white/72 transition hover:text-white"
                    >
                      Support
                    </a>
                    <Link
                      href="/"
                      className="block text-sm text-white/72 transition hover:text-white"
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
