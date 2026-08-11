"use client";

import { useState, useSyncExternalStore } from "react";

export type DashboardSection = {
  id: string;
  title: string;
  children: React.ReactNode;
};

const storageKey = "altura-hub-dashboard-section-order";
const storageEventName = "altura-hub-dashboard-section-order-changed";

type DashboardPreferences = {
  order: string[];
  hidden: string[];
};

const emptyPreferences: DashboardPreferences = {
  order: [],
  hidden: [],
};

function orderSections(sections: DashboardSection[], order: string[]) {
  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  const ordered = order
    .map((id) => sectionMap.get(id))
    .filter((section): section is DashboardSection => Boolean(section));
  const missing = sections.filter((section) => !order.includes(section.id));

  return [...ordered, ...missing];
}

function normalizePreferences(
  snapshot: string,
  sections: DashboardSection[],
): DashboardPreferences {
  try {
    const parsed = JSON.parse(snapshot);

    if (Array.isArray(parsed)) {
      return {
        order: parsed.filter((id): id is string => typeof id === "string"),
        hidden: [],
      };
    }

    if (parsed && typeof parsed === "object") {
      const maybePreferences = parsed as Partial<DashboardPreferences>;
      const validIds = new Set(sections.map((section) => section.id));

      return {
        order: Array.isArray(maybePreferences.order)
          ? maybePreferences.order.filter(
              (id): id is string => typeof id === "string" && validIds.has(id),
            )
          : [],
        hidden: Array.isArray(maybePreferences.hidden)
          ? maybePreferences.hidden.filter(
              (id): id is string => typeof id === "string" && validIds.has(id),
            )
          : [],
      };
    }
  } catch {
    return emptyPreferences;
  }

  return emptyPreferences;
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

export function DashboardSectionOrder({
  sections,
}: {
  sections: DashboardSection[];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [draftPreferences, setDraftPreferences] =
    useState<DashboardPreferences>(emptyPreferences);
  const orderSnapshot = useSyncExternalStore(
    subscribe,
    getOrderSnapshot,
    () => "[]",
  );
  const preferences = normalizePreferences(orderSnapshot, sections);

  function savePreferences(nextPreferences: DashboardPreferences) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextPreferences));
    window.dispatchEvent(new Event(storageEventName));
  }

  function openCustomizer() {
    setDraftPreferences(preferences);
    setIsMenuOpen(false);
    setIsCustomizerOpen(true);
  }

  function closeCustomizer() {
    setDraggedId(null);
    setIsCustomizerOpen(false);
  }

  function reorderDraft(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      return;
    }

    const currentOrder = orderSections(sections, draftPreferences.order).map(
      (section) => section.id,
    );
    const draggedIndex = currentOrder.indexOf(draggedId);
    const targetIndex = currentOrder.indexOf(targetId);

    if (draggedIndex < 0 || targetIndex < 0) {
      return;
    }

    const nextOrder = [...currentOrder];
    const [item] = nextOrder.splice(draggedIndex, 1);
    nextOrder.splice(targetIndex, 0, item);

    setDraftPreferences((current) => ({
      ...current,
      order: nextOrder,
    }));
  }

  function toggleSection(sectionId: string) {
    setDraftPreferences((current) => {
      const hidden = current.hidden.includes(sectionId)
        ? current.hidden.filter((id) => id !== sectionId)
        : [...current.hidden, sectionId];

      return { ...current, hidden };
    });
  }

  function saveDraft() {
    savePreferences(draftPreferences);
    closeCustomizer();
  }

  function resetOrder() {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(storageEventName));
    setDraftPreferences(emptyPreferences);
    closeCustomizer();
  }

  const orderedSections = orderSections(sections, preferences.order).filter(
    (section) => !preferences.hidden.includes(section.id),
  );
  const draftSections = orderSections(sections, draftPreferences.order);

  return (
    <div className="space-y-6">
      <div className="relative flex justify-end">
        <button
          type="button"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          aria-label="Öppna översiktsmeny"
          className="inline-flex size-11 items-center justify-center rounded-full border border-black/10 bg-[var(--hub-card)] text-xl font-semibold leading-none text-[var(--hub-text)] shadow-[0_14px_32px_-28px_rgba(0,0,0,0.35)] transition hover:bg-[var(--hub-input)]"
        >
          ...
        </button>
        {isMenuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-20 w-56 rounded-[1.15rem] border border-black/10 bg-[var(--hub-card)] p-2 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.42)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={openCustomizer}
              className="block w-full rounded-[0.9rem] px-3 py-2.5 text-left text-sm font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)]"
            >
              Anpassa översikt
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={resetOrder}
              className="block w-full rounded-[0.9rem] px-3 py-2.5 text-left text-sm text-[var(--hub-muted)] transition hover:bg-[var(--hub-input)]"
            >
              Återställ standard
            </button>
          </div>
        ) : null}
      </div>

      {orderedSections.map((section) => (
        <section key={section.id}>
          {section.children}
        </section>
      ))}

      {orderedSections.length ? null : (
        <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-[var(--hub-card)] px-5 py-10 text-center">
          <p className="text-base font-semibold text-[var(--hub-text)]">
            Översikten är tom
          </p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--hub-muted)]">
            Öppna anpassningen och lägg tillbaka de sektioner du vill se här.
          </p>
          <button
            type="button"
            onClick={openCustomizer}
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--hub-panel)] px-4 py-2 text-sm font-medium text-[var(--hub-panel-contrast)]"
          >
            Anpassa översikt
          </button>
        </div>
      )}

      {isCustomizerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/42 px-4 py-8 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-customizer-title"
            className="w-full max-w-xl rounded-[1.7rem] border border-black/10 bg-[var(--hub-card)] p-5 shadow-[0_34px_90px_-46px_rgba(0,0,0,0.55)] md:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--hub-accent-strong)]">
                  Översikt
                </p>
                <h2
                  id="dashboard-customizer-title"
                  className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--hub-text)]"
                >
                  Anpassa startsidan
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--hub-muted)]">
                  Dra sektionerna till rätt ordning och stäng av det du inte
                  vill ha på översikten.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCustomizer}
                aria-label="Stäng anpassning"
                className="inline-flex size-10 items-center justify-center rounded-full border border-black/10 text-lg text-[var(--hub-muted)] transition hover:bg-[var(--hub-input)] hover:text-[var(--hub-text)]"
              >
                x
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {draftSections.map((section) => {
                const isVisible = !draftPreferences.hidden.includes(section.id);

                return (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={() => setDraggedId(section.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      reorderDraft(section.id);
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    className={`flex cursor-grab items-center gap-3 rounded-[1.15rem] border p-3 transition active:cursor-grabbing ${
                      draggedId === section.id
                        ? "border-[var(--hub-accent)] bg-[var(--hub-chip)] opacity-75"
                        : "border-black/8 bg-[var(--hub-card-soft)]"
                    }`}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--hub-card)] text-lg text-[var(--hub-muted)]">
                      ::
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--hub-text)]">
                        {section.title}
                      </p>
                      <p className="mt-1 text-xs text-[var(--hub-muted)]">
                        Dra för att ändra ordning
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-[var(--hub-text)]">
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleSection(section.id)}
                        className="size-4 accent-[var(--hub-panel)]"
                      />
                      Visa
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={resetOrder}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[var(--hub-muted)] transition hover:bg-[var(--hub-input)]"
              >
                Återställ
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeCustomizer}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-black/10 px-5 py-3 text-sm font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)]"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={saveDraft}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--hub-panel)] px-5 py-3 text-sm font-medium text-[var(--hub-panel-contrast)] transition hover:opacity-90"
                >
                  Spara
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
