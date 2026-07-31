"use client";

import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function OrderSuccess({ orderId }: { orderId: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-10 sm:p-14 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
        <ClientIcon icon="ph:check-bold" className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Payment submitted!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          We&apos;ve received your order details and payment confirmation. Our team will verify it and confirm your
          booking shortly.
        </p>
      </div>
      <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Order ID
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">{orderId}</span>
      </div>
      <Link
        href="/services"
        className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-800 dark:hover:bg-slate-100"
      >
        Continue Browsing <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />
      </Link>
    </div>
  );
}
