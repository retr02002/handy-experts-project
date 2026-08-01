/**
 * Sentinel error string returned by vendor-scoped live-call/service-call
 * actions when the caller's VendorProfile has no latitude/longitude set yet.
 * Kept in a plain module (not a "use server" action file, which may only
 * export async functions) so both server actions and client components can
 * import it directly instead of comparing against a magic string.
 */
export const LOCATION_NOT_SET = "LOCATION_NOT_SET";
