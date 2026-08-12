import test from "node:test";
import assert from "node:assert/strict";
import { createPaginatedResult, normalizePagination } from "./pagination.ts";

test("pagination defaults to page one and 25 rows", () => {
  assert.deepEqual(normalizePagination(), {
    page: 1,
    pageSize: 25,
    from: 0,
    to: 24,
  });
});

test("pagination rejects invalid pages and caps page size", () => {
  assert.deepEqual(normalizePagination({ page: "-3", pageSize: "500" }), {
    page: 1,
    pageSize: 100,
    from: 0,
    to: 99,
  });
});

test("pagination calculates boundaries and navigation state", () => {
  const pagination = normalizePagination({ page: 3, pageSize: 25 });
  const result = createPaginatedResult({
    items: ["row"],
    count: 76,
    page: pagination.page,
    pageSize: pagination.pageSize,
  });

  assert.equal(pagination.from, 50);
  assert.equal(pagination.to, 74);
  assert.equal(result.totalPages, 4);
  assert.equal(result.hasPreviousPage, true);
  assert.equal(result.hasNextPage, true);
});
