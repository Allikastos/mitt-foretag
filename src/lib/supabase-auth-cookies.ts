const staleRefreshTokenCodes = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
]);

export function isSupabaseAuthCookieName(name: string) {
  return name.startsWith("sb-") && name.includes("-auth-token");
}

export function isStaleRefreshTokenError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as { code?: unknown; message?: unknown };
  if (
    typeof candidate.code === "string" &&
    staleRefreshTokenCodes.has(candidate.code)
  ) {
    return true;
  }

  return (
    typeof candidate.message === "string" &&
    candidate.message.toLowerCase().includes("invalid refresh token")
  );
}
