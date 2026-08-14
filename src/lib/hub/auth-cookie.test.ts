import assert from "node:assert/strict";
import test from "node:test";
import {
  isStaleRefreshTokenError,
  isSupabaseAuthCookieName,
} from "../supabase-auth-cookies.ts";

test("only Supabase auth session cookies are selected for cleanup", () => {
  assert.equal(
    isSupabaseAuthCookieName("sb-example-ref-auth-token"),
    true,
  );
  assert.equal(
    isSupabaseAuthCookieName("sb-example-ref-auth-token.0"),
    true,
  );
  assert.equal(isSupabaseAuthCookieName("theme"), false);
  assert.equal(isSupabaseAuthCookieName("sb-example-other"), false);
});

test("only stale refresh token failures trigger session cleanup", () => {
  assert.equal(
    isStaleRefreshTokenError({ code: "refresh_token_not_found" }),
    true,
  );
  assert.equal(
    isStaleRefreshTokenError({ message: "Invalid Refresh Token: missing" }),
    true,
  );
  assert.equal(isStaleRefreshTokenError({ code: "over_request_rate_limit" }), false);
  assert.equal(isStaleRefreshTokenError(new Error("Network unavailable")), false);
});
