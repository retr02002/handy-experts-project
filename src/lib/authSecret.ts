/**
 * Shared by src/lib/auth.ts and src/proxy.ts (edge middleware, so this file
 * must stay dependency-free). Fails fast instead of silently falling back
 * to a hardcoded secret — that literal string used to be committed to the
 * repo, so any deployment that forgot to set NEXTAUTH_SECRET would sign
 * every JWT with a publicly-known secret rather than failing to start.
 */
export const NEXTAUTH_SECRET = (() => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET must be set — refusing to start with no secret or a hardcoded fallback.");
  }
  return secret;
})();
