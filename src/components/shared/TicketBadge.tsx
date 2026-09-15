import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

/** Small pill showing an order's human-readable ticket number, for on-site verification and lookups. */
export function TicketBadge({ ticketNumber, className = "" }: { ticketNumber: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold text-[11px] tracking-wide text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5 ${className}`}
    >
      <ClientIcon icon="ph:ticket-bold" className="w-3 h-3 text-slate-400" />
      {ticketNumber}
    </span>
  );
}
