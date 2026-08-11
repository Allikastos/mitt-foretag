"use client";

import { useState } from "react";
import { hubThemeLabel, hubThemes, type HubTheme } from "@/src/lib/hub";

const themeSwatches: Record<
  HubTheme,
  { panel: string; accent: string; surface: string }
> = {
  nova: { panel: "#111111", accent: "#C6A15B", surface: "#F0EDE4" },
  forest: { panel: "#245B37", accent: "#C9E979", surface: "#D8EBC8" },
  coast: { panel: "#075985", accent: "#8FD3E8", surface: "#CCECF4" },
  graphite: { panel: "#4B4A45", accent: "#D7CDBA", surface: "#DED8CB" },
};

function isHubTheme(value: string): value is HubTheme {
  return hubThemes.some((theme) => theme === value);
}

export function ThemePicker({ currentTheme }: { currentTheme: string }) {
  const initialTheme = isHubTheme(currentTheme) ? currentTheme : "nova";
  const [selectedTheme, setSelectedTheme] = useState<HubTheme>(initialTheme);

  function previewTheme(theme: HubTheme) {
    setSelectedTheme(theme);

    document
      .querySelectorAll<HTMLElement>("[data-hub-theme]")
      .forEach((element) => {
        element.dataset.hubTheme = theme;
      });
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {hubThemes.map((theme) => {
        const swatch = themeSwatches[theme];
        const isSelected = selectedTheme === theme;

        return (
          <label
            key={theme}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-sm text-[var(--hub-text)] transition ${
              isSelected
                ? "border-[var(--hub-accent-strong)] bg-[var(--hub-card)] shadow-[0_18px_34px_-30px_rgba(0,0,0,0.32)]"
                : "border-black/8 bg-[var(--hub-card)] hover:border-black/16"
            }`}
          >
            <input
              type="radio"
              name="hub_theme"
              value={theme}
              checked={isSelected}
              onChange={() => previewTheme(theme)}
              className="size-4 accent-[var(--hub-panel)]"
            />
            <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span className="font-medium">{hubThemeLabel(theme)}</span>
              <span
                className="flex gap-1 rounded-full border border-black/10 p-1"
                style={{ backgroundColor: swatch.surface }}
                aria-hidden="true"
              >
                <span
                  className="size-4 rounded-full"
                  style={{ backgroundColor: swatch.panel }}
                />
                <span
                  className="size-4 rounded-full"
                  style={{ backgroundColor: swatch.accent }}
                />
                <span className="size-4 rounded-full bg-white" />
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
