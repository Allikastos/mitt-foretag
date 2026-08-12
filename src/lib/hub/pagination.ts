export const HUB_DEFAULT_PAGE_SIZE = 25;
export const HUB_MAX_PAGE_SIZE = 100;

export type PaginationInput = {
  page?: number | string | null;
  pageSize?: number | string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function positiveInteger(value: number | string | null | undefined, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

export function normalizePagination(input: PaginationInput = {}) {
  const page = positiveInteger(input.page, 1);
  const pageSize = Math.min(
    positiveInteger(input.pageSize, HUB_DEFAULT_PAGE_SIZE),
    HUB_MAX_PAGE_SIZE,
  );
  const from = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    from,
    to: from + pageSize - 1,
  };
}

export function createPaginatedResult<T>(params: {
  items: T[];
  count: number | null;
  page: number;
  pageSize: number;
}): PaginatedResult<T> {
  const totalCount = Math.max(0, params.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / params.pageSize));

  return {
    items: params.items,
    page: params.page,
    pageSize: params.pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: params.page > 1,
    hasNextPage: params.page < totalPages,
  };
}
