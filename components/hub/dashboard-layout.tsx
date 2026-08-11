"use client";

import { useSyncExternalStore } from "react";

export type DashboardSection = {
  id: string;
  title: string;
  children: React.ReactNode;
};

const storageKey = "altura-hub-dashboard-section-order";
const storageEventName = "altura-hub-dashboard-section-order-changed";

function orderSections(sections: DashboardSection[], order: string[]) {
  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  const ordered = order
    .map((id) => sectionMap.get(id))
    .filter((section): section is DashboardSection => Boolean(section));
  const missing = sections.filter((section) => !order.includes(section.id));

  return [...ordered, ...missing];
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  function handleChange(event: Event) {
    if (event instanceof StorageEvent && event.key && event.key !== storageKey) {
      return;
    }

    onStoreChange();
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(storageEventName, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(storageEventName, handleChange);
  };
}

function getOrderSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  return window.localStorage.getItem(storageKey) ?? "[]";
}

function parseOrder(snapshot: string) {
  try {
    const parsed = JSON.parse(snapshot);

    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === "string");
    }
  } catch {
    return [];
  }

  return [];
}

export function DashboardSectionOrder({
  sections,
}: {
  sections: DashboardSection[];
}) {
  const orderSnapshot = useSyncExternalStore(
    subscribe,
    getOrderSnapshot,
    () => "[]",
  );
  const order = parseOrder(orderSnapshot);

  function saveOrder(nextOrder: string[]) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextOrder));
    window.dispatchEvent(new Event(storageEventName));
  }

  function moveSection(id: string, direction: -1 | 1) {
    const currentOrder = orderSections(sections, order).map((section) => section.id);
    const index = currentOrder.indexOf(id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) {
      return;
    }

    const nextOrder = [...currentOrder];
    const [item] = nextOrder.splice(index, 1);
    nextOrder.splice(nextIndex, 0, item);
    saveOrder(nextOrder);
  }

  function resetOrder() {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(storageEventName));
  }

  const orderedSections = orderSections(sections, order);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[1.4rem] border border-black/8 bg-[var(--hub-card)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--hub-text)]">
            Anpassa översikten
          </p>
          <p className="mt-1 text-sm text-[var(--hub-muted)]">
            Flytta sektionerna i den ordning du själv vill arbeta.
          </p>
        </div>
        <button
          type="button"
          onClick={resetOrder}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)]"
        >
          Återställ ordning
        </button>
      </div>

      {orderedSections.map((section, index) => (
        <section key={section.id} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--hub-accent-strong)]">
              {section.title}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveSection(section.id, -1)}
                disabled={index === 0}
                className="rounded-full border border-black/10 bg-[var(--hub-card)] px-3 py-1.5 text-xs font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Upp
              </button>
              <button
                type="button"
                onClick={() => moveSection(section.id, 1)}
                disabled={index === orderedSections.length - 1}
                className="rounded-full border border-black/10 bg-[var(--hub-card)] px-3 py-1.5 text-xs font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Ner
              </button>
            </div>
          </div>
          {section.children}
        </section>
      ))}
    </div>
  );
}
