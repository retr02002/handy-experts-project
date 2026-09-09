/**
 * When a scheduled job is allowed to become "on the way".
 *
 * A booking can be placed days ahead. Until the technician actually sets off,
 * there is nothing to track: an accepted job two days out that renders a live
 * map and "5 m · approx 1 min" is telling the customer something false. So
 * travel — and therefore tracking — is gated on the slot getting close.
 *
 * 2 hours is deliberately generous: it covers a cross-city trip in traffic
 * without letting a two-days-early tap flip the job into tracking. Beginning
 * the work is a separate, stricter gate — that still needs the customer's
 * start PIN, so nobody can open a job early even after travelling.
 */
export const TRAVEL_WINDOW_MINUTES = 120;

const MS_PER_MINUTE = 60_000;

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** The moment a technician may start travelling. Null for instant bookings. */
export function travelWindowOpensAt(scheduledFor: string | Date | null | undefined): Date | null {
  const scheduled = toDate(scheduledFor);
  return scheduled ? new Date(scheduled.getTime() - TRAVEL_WINDOW_MINUTES * MS_PER_MINUTE) : null;
}

/**
 * Whether the technician can set off yet. Instant bookings (no scheduled
 * time) are always ready; scheduled ones open TRAVEL_WINDOW_MINUTES ahead.
 */
export function canStartTravel(scheduledFor: string | Date | null | undefined, now: Date = new Date()): boolean {
  const opensAt = travelWindowOpensAt(scheduledFor);
  return opensAt === null || now.getTime() >= opensAt.getTime();
}

/** Minutes until travel may begin; 0 once it's open. */
export function minutesUntilTravelWindow(
  scheduledFor: string | Date | null | undefined,
  now: Date = new Date()
): number {
  const opensAt = travelWindowOpensAt(scheduledFor);
  if (opensAt === null) return 0;
  return Math.max(0, Math.ceil((opensAt.getTime() - now.getTime()) / MS_PER_MINUTE));
}

export function formatScheduledFor(scheduledFor: string | Date | null | undefined): string | null {
  const scheduled = toDate(scheduledFor);
  if (!scheduled) return null;
  return scheduled.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * How far off the slot is, in words — for the "when to do it" card that
 * replaces live tracking before the technician sets off.
 */
export function describeTimeUntil(scheduledFor: string | Date | null | undefined, now: Date = new Date()): string | null {
  const scheduled = toDate(scheduledFor);
  if (!scheduled) return null;

  const minutes = Math.round((scheduled.getTime() - now.getTime()) / MS_PER_MINUTE);
  if (minutes <= 0) return "Scheduled time has arrived";
  if (minutes < 60) return `In ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `In ${hours} hr${hours === 1 ? "" : "s"}`;

  const days = Math.round(hours / 24);
  return `In ${days} day${days === 1 ? "" : "s"}`;
}
