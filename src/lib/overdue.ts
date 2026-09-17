const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether an order has sat unaccepted/unassigned too long, computed purely
 * from timestamps already on the row — no cron, no stored flag to keep in
 * sync, same "compute on read" idiom the rest of this codebase uses for
 * time-based state (sweepExpiredAwaitingPayment, sweepExpiredOffers).
 *
 * Instant orders (no scheduledFor) are overdue 24h after referenceAt (the
 * moment the clock started — LiveCall.createdAt for "no vendor yet",
 * LiveCall.acceptedAt for "no technician yet"). Scheduled orders instead go
 * overdue the calendar day after the scheduled job date, regardless of how
 * long referenceAt has been waiting — a job scheduled three days out isn't
 * "overdue" the moment nobody grabs it instantly.
 */
export function isOrderOverdue(scheduledFor: Date | null, referenceAt: Date): boolean {
  const now = Date.now();
  if (scheduledFor) {
    const dayAfterScheduled = new Date(scheduledFor);
    dayAfterScheduled.setHours(0, 0, 0, 0);
    dayAfterScheduled.setDate(dayAfterScheduled.getDate() + 1);
    return now >= dayAfterScheduled.getTime();
  }
  return now - referenceAt.getTime() >= ONE_DAY_MS;
}
