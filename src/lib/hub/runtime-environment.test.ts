import assert from "node:assert/strict";
import test from "node:test";
import {
  assertSafeHubFeatureConfiguration,
  assertSafeHubEnvironment,
  assessHubEnvironment,
  supabaseProjectRef,
} from "./runtime-environment.ts";

const TEST_REF = "testproject1234567890";
const PROD_REF = "prodproject1234567890";

function environment(overrides: Record<string, string | undefined> = {}) {
  return {
    NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: "development",
    NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "local",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_HUB_PRODUCTION_SUPABASE_PROJECT_REF: PROD_REF,
    ...overrides,
  };
}

test("local development is allowed only with local Supabase", () => {
  assert.equal(assessHubEnvironment(environment()).valid, true);
  assert.equal(
    assessHubEnvironment(
      environment({
        NEXT_PUBLIC_SUPABASE_URL: `https://${TEST_REF}.supabase.co`,
      }),
    ).valid,
    false,
  );
});

test("preview accepts a separate test project", () => {
  const result = assessHubEnvironment(
    environment({
      NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: "preview",
      NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "test",
      NEXT_PUBLIC_SUPABASE_URL: `https://${TEST_REF}.supabase.co`,
    }),
  );

  assert.equal(result.valid, true);
  assert.equal(result.supabaseProjectRef, TEST_REF);
});

test("preview and test fail closed when they point at production", () => {
  for (const runtime of ["preview", "test"] as const) {
    assert.equal(
      assessHubEnvironment(
        environment({
          NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: runtime,
          NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "test",
          NEXT_PUBLIC_SUPABASE_URL: `https://${PROD_REF}.supabase.co`,
        }),
      ).valid,
      false,
    );
  }
});

test("production requires an exact, explicitly named project", () => {
  assert.equal(
    assessHubEnvironment(
      environment({
        NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: "production",
        NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "production",
        NEXT_PUBLIC_SUPABASE_URL: `https://${PROD_REF}.supabase.co`,
      }),
    ).valid,
    true,
  );
  assert.equal(
    assessHubEnvironment(
      environment({
        NEXT_PUBLIC_HUB_RUNTIME_ENVIRONMENT: "production",
        NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: "production",
        NEXT_PUBLIC_SUPABASE_URL: `https://${TEST_REF}.supabase.co`,
      }),
    ).valid,
    false,
  );
});

test("missing markers fail without exposing configuration values", () => {
  const secretUrl = `https://${PROD_REF}.supabase.co`;
  assert.throws(
    () =>
      assertSafeHubEnvironment(
        environment({
          NEXT_PUBLIC_HUB_DATA_ENVIRONMENT: undefined,
          NEXT_PUBLIC_SUPABASE_URL: secretUrl,
        }),
      ),
    (error: unknown) => {
      assert.equal(error instanceof Error, true);
      assert.equal((error as Error).message.includes(PROD_REF), false);
      return true;
    },
  );
});

test("project references are extracted only from Supabase project hosts", () => {
  assert.equal(
    supabaseProjectRef(`https://${TEST_REF}.supabase.co`),
    TEST_REF,
  );
  assert.equal(supabaseProjectRef("http://127.0.0.1:54321"), null);
  assert.equal(supabaseProjectRef("https://example.com"), null);
});

test("mutating features require the shared safety flag", () => {
  assert.throws(() =>
    assertSafeHubFeatureConfiguration({
      HUB_FEATURE_ACCOUNTING: "true",
      HUB_FEATURE_SAFE_MUTATIONS: "false",
    }),
  );
  assert.doesNotThrow(() =>
    assertSafeHubFeatureConfiguration({
      HUB_FEATURE_ACCOUNTING: "true",
      HUB_FEATURE_SAFE_MUTATIONS: "true",
    }),
  );
});

test("external features require a non-development provider", () => {
  for (const provider of [undefined, "disabled", "memory", "development"]) {
    assert.throws(() =>
      assertSafeHubFeatureConfiguration({
        HUB_FEATURE_SAFE_MUTATIONS: "true",
        HUB_FEATURE_BACKGROUND_JOBS: "true",
        HUB_JOB_QUEUE_PROVIDER: provider,
      }),
    );
  }

  assert.doesNotThrow(() =>
    assertSafeHubFeatureConfiguration({
      HUB_FEATURE_SAFE_MUTATIONS: "true",
      HUB_FEATURE_BACKGROUND_JOBS: "true",
      HUB_JOB_QUEUE_PROVIDER: "reviewed-durable-provider",
    }),
  );
});
