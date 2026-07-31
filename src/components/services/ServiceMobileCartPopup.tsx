"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ServiceMobileCartPopup() {
  const { totalPrice, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || totalItems === 0) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 w-full z-[65] lg:hidden px-3 py-2 bg-white/95 dark:bg-[#0B1322]/95 border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-6px_20px_rgba(0,0,0,0.12)] dark:shadow-[0_-6px_20px_rgba(0,0,0,0.45)] animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-xl">
      <div className="max-w-[1340px] mx-auto flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#00B4FF] text-white flex items-center justify-center font-black shadow-xs shrink-0 relative">
            <ClientIcon icon="ph:shopping-cart-bold" className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0B1322] shadow-2xs">
              {totalItems}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1 truncate">
              <span>₹{totalPrice}</span>
              <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide shrink-0">({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            </div>
            <div className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0"></span>
              <span>Savings applied!</span>
            </div>
          </div>
        </div>
        <Link 
          href="/cart"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00B4FF] to-blue-600 text-white text-xs font-black shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1 uppercase tracking-wide whitespace-nowrap"
        >
          <span>View Cart</span>
          <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
