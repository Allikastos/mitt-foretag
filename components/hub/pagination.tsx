import Link from "next/link";
import type { PaginatedResult } from "@/src/lib/hub/pagination";

type PaginationProps = Pick<
  PaginatedResult<unknown>,
  "page" | "totalPages" | "hasPreviousPage" | "hasNextPage"
> & {
  basePath: string;
  pageParam?: string;
  query?: Record<string, string | null | undefined>;
};

function pageHref(
  basePath: string,
  pageParam: string,
  page: number,
  query: PaginationProps["query"],
) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) search.set(key, value);
  }

  if (page > 1) search.set(pageParam, String(page));
  const queryString = search.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function HubPagination({
  basePath,
  pageParam = "page",
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  query,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const linkClass =
    "inline-flex min-h-10 items-center justify-center rounded-full border border-black/10 bg-[var(--hub-card)] px-4 py-2 text-sm font-medium text-[var(--hub-text)] transition hover:bg-[var(--hub-input)]";
  const disabledClass = `${linkClass} pointer-events-none opacity-45`;

  return (
    <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Sidindelning">
      <Link
        href={pageHref(basePath, pageParam, Math.max(1, page - 1), query)}
        aria-disabled={!hasPreviousPage}
        className={hasPreviousPage ? linkClass : disabledClass}
      >
        Föregående
      </Link>
      <span className="text-sm text-[var(--hub-muted)]">
        Sida {page} av {totalPages}
      </span>
      <Link
        href={pageHref(basePath, pageParam, page + 1, query)}
        aria-disabled={!hasNextPage}
        className={hasNextPage ? linkClass : disabledClass}
      >
        Nästa
      </Link>
    </nav>
  );
}
