/**
 * Sentinel error string returned by vendor-scoped live-call/service-call
 * actions when the caller's VendorProfile has no latitude/longitude set yet.
 * Kept in a plain module (not a "use server" action file, which may only
 * export async functions) so both server actions and client components can
 * import it directly instead of comparing against a magic string.
 */
export const LOCATION_NOT_SET = "LOCATION_NOT_SET";

/** Sentinel returned when a deactivated vendor tries to act on live calls. */
export const VENDOR_INACTIVE = "VENDOR_INACTIVE";

/**
 * How long a LiveCall stays broadcasting (or, for the Pay Online path,
 * awaiting payment) before the lazy expiry sweep marks it EXPIRED. Shared
 * between livecall.actions.ts and payment.actions.ts.
 */
export const LIVE_CALL_EXPIRY_MINUTES = 15;

/**
 * Past this age a stored technician position stops being "where they are"
 * and becomes "where they last were". On duty the device writes every
 * ~12s, so 10 minutes is ~50 consecutive missed writes — a dead phone,
 * denied location, or a closed app, not a brief GPS gap. Shared between
 * tracking.actions.ts (server-side staleness checks) and every client
 * component that needs to render the same "disconnected" state (the
 * tracking map's red-dot overlay) without duplicating the magic number.
 */
export const STALE_POSITION_AFTER_SECONDS = 600;

/**
 * How close a technician must be to the customer's address to start or
 * complete a job. Not a security boundary on its own — the customer's PIN
 * is still required, and a spoofed GPS fix doesn't produce a customer who
 * reads their PIN aloud. This is the second factor that stops a job being
 * started from across the city.
 */
export const JOB_GEOFENCE_RADIUS_METERS = 150;

/**
 * Added to the radius, capped at the device's own reported accuracy. An
 * urban indoor GPS fix routinely reports 80-150m of error, so without this
 * a technician standing in the customer's living room gets blocked by their
 * own phone's uncertainty. Capped so a garbage 5km accuracy reading can't
 * widen the fence to uselessness.
 */
export const GEOFENCE_ACCURACY_GRACE_METERS = 60;

/**
 * Off by default on purpose. While false, distances are still measured and
 * recorded on every start/complete but nothing is blocked — that data is
 * what tells us whether 150m is actually achievable in the field before we
 * start denying real technicians. Flip to "true" once the recorded
 * distances look sane. See LiveCall coordinate precision: addresses typed
 * manually at checkout can geocode to a city centroid, which would make the
 * fence unachievable on those orders.
 */
export const GEOFENCE_ENFORCED = process.env.GEOFENCE_ENFORCED === "true";

/** Sentinel so the technician UI can offer "enable location → retry" instead of a dead-end error. */
export const GEOFENCE_POSITION_REQUIRED = "GEOFENCE_POSITION_REQUIRED";

/** What a technician sees in place of the customer's name once a job is completed. */
export const MASKED_CUSTOMER_LABEL = "Customer";

/** Per-phase (before/after) cap on job photos, enforced server-side at upload. */
export const JOB_PHOTO_MAX_PER_PHASE = 8;

/** Server-side upload cap. Photos are downscaled client-side first, so this is a backstop, not the normal path. */
export const JOB_PHOTO_MAX_BYTES = 8 * 1024 * 1024;

/** Ceiling on photos embedded into a generated PDF, to bound render time and file size. */
export const PDF_MAX_EMBEDDED_PHOTOS = 8;
