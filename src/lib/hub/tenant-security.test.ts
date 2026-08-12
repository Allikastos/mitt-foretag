import test from "node:test";
import assert from "node:assert/strict";
import {
  assertMembership,
  assertTenantResource,
  scopeTenantResourceQuery,
} from "./tenant-security.ts";

test("a membership must match both user and active organization", () => {
  assert.doesNotThrow(() =>
    assertMembership({
      membership: { organization_id: "org-a", user_id: "user-a" },
      organizationId: "org-a",
      userId: "user-a",
    }),
  );

  assert.throws(
    () =>
      assertMembership({
        membership: null,
        organizationId: "org-a",
        userId: "user-a",
      }),
    /saknar medlemskap/,
  );
});

test("a resource from another organization is denied", () => {
  assert.throws(
    () =>
      assertTenantResource({
        activeOrganizationId: "org-a",
        resourceOrganizationId: "org-b",
      }),
    /tillhör inte/,
  );
});

test("read, update and delete checks all reject a foreign tenant resource", () => {
  for (const operation of ["läsa", "uppdatera", "radera"]) {
    assert.throws(
      () =>
        assertTenantResource({
          activeOrganizationId: "org-a",
          resourceOrganizationId: "org-b",
        }),
      /tillhör inte/,
      operation,
    );
  }
});

test("a manipulated object id never replaces the organization filter", () => {
  const filters: Array<[string, string]> = [];
  const query = {
    eq(column: string, value: string) {
      filters.push([column, value]);
      return this;
    },
  };

  scopeTenantResourceQuery(query, {
    organizationId: "org-a",
    resourceId: "object-from-org-b",
  });

  assert.deepEqual(filters, [
    ["organization_id", "org-a"],
    ["id", "object-from-org-b"],
  ]);
});
