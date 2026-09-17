import type { ContactQueryReasonValue, ContactQueryStatusValue } from "@/actions/contactquery.actions";

export const REASON_LABELS: Record<ContactQueryReasonValue, string> = {
  GENERAL: "General Inquiry",
  SUPPORT: "Customer Support",
  SALES: "Sales & Pricing",
  PARTNER: "Become a Partner",
};

export const REASON_STYLES: Record<ContactQueryReasonValue, string> = {
  GENERAL: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  SUPPORT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SALES: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  PARTNER: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export const STATUS_LABELS: Record<ContactQueryStatusValue, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const STATUS_STYLES: Record<ContactQueryStatusValue, string> = {
  NEW: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export const STATUS_ORDER: ContactQueryStatusValue[] = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
