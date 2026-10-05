import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import MarkdownIt from "markdown-it";

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
});

const articleHeading = /^## [A-Z]\d{2} —/m;
const articleSections = /(?=^## [A-Z]\d{2} —)/m;
const slugPattern = /^## [A-Z]\d{2} —[^\n]+\n\n\*\*Slug:\*\* `([^`]+)`/m;

let cachedOverrides: Map<string, string> | null = null;

function readOverrides() {
  if (cachedOverrides) {
    return cachedOverrides;
  }

  const overrides = new Map<string, string>();

  try {
    const draftFile = readFileSync(
      join(process.cwd(), "docs", "seo-rewrite-drafts-2026-10.md"),
      "utf8"
    );

    for (const section of draftFile.split(articleSections)) {
      if (!articleHeading.test(section)) {
        continue;
      }

      const slug = section.match(slugPattern)?.[1];
      const body = section.split("\n").slice(6).join("\n").trim();

      if (slug && body) {
        overrides.set(slug, markdown.render(body));
      }
    }
  } catch (error) {
    console.error("Failed to read full Altura Nova article drafts", error);
  }

  cachedOverrides = overrides;
  return overrides;
}

export function getMarketingContentOverride(slug: string) {
  return readOverrides().get(slug) ?? null;
}
