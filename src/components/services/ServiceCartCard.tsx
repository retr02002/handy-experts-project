"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function ServiceCartCard() {
  const { items, updateQuantity, totalPrice, totalItems } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-[#0E172B] p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs relative flex flex-col w-full min-w-0">
      <div className="flex items-center justify-between mb-3 sm:mb-3.5">
        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#00B4FF] flex items-center justify-center shadow-2xs">
            <ClientIcon icon="ph:shopping-cart-duotone" className="w-4 h-4" />
          </div>
          Your Cart
        </h3>
        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </span>
      </div>

      {!mounted || items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-3 text-center bg-slate-50/60 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/80">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mb-2 text-slate-400 dark:text-slate-500 shadow-2xs border border-slate-100 dark:border-slate-700">
            <ClientIcon icon="ph:shopping-bag-open-duotone" className="w-5 h-5 text-[#00B4FF]" />
          </div>
          <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">No items added yet</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 max-w-[170px] leading-snug">
            Select services from the middle packages list to proceed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 min-w-0 w-full">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-1">
                <span className="text-xs font-black text-slate-900 dark:text-white truncate">{item.pkg.name}</span>
                <span className="text-xs font-extrabold text-[#00B4FF]">₹{item.pkg.price}</span>
              </div>
              <div className="flex items-center justify-between w-18 h-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shrink-0 shadow-2xs font-bold text-xs">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                  className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-[#00B4FF] transition-colors"
                >
                  <ClientIcon icon="ph:minus-bold" className="w-3 h-3" />
                </button>
                <span className="flex-1 text-center text-[11px] text-slate-900 dark:text-white">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                  className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-[#00B4FF] transition-colors"
                >
                  <ClientIcon icon="ph:plus-bold" className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {mounted && items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3 w-full">
          <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-[11px] font-bold p-2.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 flex items-center gap-1.5">
            <ClientIcon icon="ph:tag-duotone" className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate font-extrabold">🎉 Savings applied on booking!</span>
          </div>

          <div className="flex justify-between items-center my-0.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total payable</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">₹{totalPrice}</span>
          </div>

          <Link 
            href="/cart" 
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00B4FF] to-blue-600 text-white text-xs sm:text-[13px] font-black transition-all hover:scale-[1.02] shadow-sm active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer text-center"
          >
            <span>Proceed to Checkout</span>
            <ClientIcon icon="ph:arrow-right-bold" className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
      )}
    </div>
  );
}
