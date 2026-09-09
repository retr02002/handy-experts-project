import type { ServiceCallStatusValue } from "@/actions/servicecall.actions";

/**
 * The technician's next action for a given job status. Single source of
 * truth — this used to be copy-pasted into the technician detail modal, the
 * card grid and the table, which meant a gate added in one place silently
 * didn't apply in the other two.
 *
 * `gated` hops don't go through updateServiceCallStatusAction: they need the
 * customer's PIN (and, for completion, the report form).
 */
export const NEXT_STEP: Partial<
  Record<string, { label: string; next: ServiceCallStatusValue; gated: "start" | "complete" | null }>
> = {
  // "Start" alone read as "start the job"; it actually means "set off", and
  // it's the hop that switches the customer's screen into live tracking.
  ASSIGNED: { label: "Start Journey", next: "EN_ROUTE", gated: null },
  EN_ROUTE: { label: "Arrived — Begin Job", next: "IN_PROGRESS", gated: "start" },
  IN_PROGRESS: { label: "Complete Job", next: "COMPLETED", gated: "complete" },
};

export const JOB_STATUS_COLORS: Record<string, string> = {
  UNASSIGNED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  EN_ROUTE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// Plain-English overrides for statuses whose enum name doesn't read
// naturally once the underscore is just swapped for a space — "en route"
// reads as a stray French phrase rather than "on their way here". Anything
// not listed falls back to the generic transform below.
const STATUS_LABEL_OVERRIDES: Record<string, string> = {
  EN_ROUTE: "on the way",
};

export function jobStatusLabel(status: string): string {
  return STATUS_LABEL_OVERRIDES[status] ?? status.replace(/_/g, " ").toLowerCase();
}

/** Reasons a technician can pick when turning a job down. */
export const DECLINE_REASONS = [
  "Too far from me",
  "Already on another job",
  "Outside my skill set",
  "Vehicle or equipment issue",
  "Customer unreachable",
  "Other",
] as const;
