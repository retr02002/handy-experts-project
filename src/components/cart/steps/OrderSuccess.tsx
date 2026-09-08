"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function OrderSuccess({ orderId }: { orderId: string }) {
  const [copied, setCopied] = useState(false);
  const displayId = orderId.toUpperCase();

  const handleCopy = () => {
    navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full items-center justify-center py-6 sm:py-10 px-2 sm:px-4">
      <div className="flex flex-col items-center text-center gap-6 w-full max-w-sm mx-auto">
        
        {/* Animated Checkmark */}
        <div className="relative mt-4">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500 flex items-center justify-center relative z-10 shadow-lg shadow-emerald-500/30">
            <ClientIcon icon="ph:check-bold" className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
        </div>
        
        {/* Heading & Text */}
        <div className="mt-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Booking Confirmed!</h2>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed px-4">
            Your payment was successful. Our team will verify and confirm your booking shortly.
          </p>
        </div>
        
        {/* Order ID Box */}
        <div className="w-full bg-white dark:bg-[#0F172A] border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm mt-2">
          <div className="flex flex-col items-start text-left flex-1 min-w-0 pr-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Order ID
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-widest truncate w-full">
              {displayId}
            </span>
          </div>
          <button 
            onClick={handleCopy}
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-[0.95] ${
              copied 
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-label="Copy Order ID"
          >
            <ClientIcon icon={copied ? "ph:check-bold" : "ph:copy-bold"} className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 mt-4">
          <Link
            href={`/customer/orders/${orderId}`}
            className="w-full h-14 rounded-2xl bg-[#00B4FF] text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-[#00B4FF]/25"
          >
            Track Order Details <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />
          </Link>
          <Link
            href="/services"
            className="w-full h-14 rounded-2xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[15px] font-bold flex items-center justify-center border-2 border-slate-100 dark:border-slate-800 transition-transform active:scale-[0.98]"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
