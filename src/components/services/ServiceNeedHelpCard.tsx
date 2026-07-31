import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ServiceNeedHelpCard() {
  return (
    <div className="bg-slate-100/70 dark:bg-slate-800/30 rounded-xl p-3 text-center border border-slate-200/50 dark:border-slate-800/50">
      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">Need customized assistance?</p>
      <Link href="/contact" className="text-[11px] font-extrabold text-[#00B4FF] hover:underline inline-flex items-center gap-1">
        <span>Chat with an Expert</span> <ClientIcon icon="ph:chat-circle-dots-bold" className="w-3 h-3" />
      </Link>
    </div>
  );
}
