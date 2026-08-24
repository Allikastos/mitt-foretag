import assert from "node:assert/strict";
import test from "node:test";
import {
  filterCustomerOptions,
  mergeCustomerOptions,
  normalizeCustomerSearch,
} from "./customer-search.ts";

const customers = [
  { id: "1", company_name: "Ångström Konsult" },
  { id: "2", company_name: "Nordisk Form AB" },
  { id: "3", company_name: "Form & Funktion" },
];

test("normalizes customer search without accepting unbounded input", () => {
  assert.equal(normalizeCustomerSearch("  Nordisk   Form  "), "Nordisk Form");
  assert.equal(normalizeCustomerSearch("x".repeat(100)).length, 80);
});

test("filters customer names case-insensitively", () => {
  assert.deepEqual(
    filterCustomerOptions(customers, "FORM").map((customer) => customer.id),
    ["2", "3"],
  );
});

test("merges remote and local results without duplicates", () => {
  assert.deepEqual(
    mergeCustomerOptions([customers[2]], customers).map((customer) => customer.id),
    ["3", "1", "2"],
  );
});
