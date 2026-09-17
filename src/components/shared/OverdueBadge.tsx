import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
      <ClientIcon icon="ph:warning-fill" className="w-3.5 h-3.5" />
      Overdue
    </span>
  );
}
