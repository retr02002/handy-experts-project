"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { DiscountCodeForm } from "./DiscountCodeForm";

interface OrderSummaryPanelProps {
  showDiscount?: boolean;
  primaryLabel: string;
  primaryIcon?: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  onBack?: () => void;
  backLabel?: string;
}

export function OrderSummaryPanel({
  showDiscount = false,
  primaryLabel,
  primaryIcon = "ph:arrow-right-bold",
  onPrimary,
  primaryDisabled = false,
  onBack,
  backLabel = "Back",
}: OrderSummaryPanelProps) {
  const { totalPrice, totalItems } = useCart();

  const taxesAndFees = Math.round(totalPrice * 0.18);
  const grandTotal = totalPrice + taxesAndFees;

  if (totalItems === 0) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-full lg:w-[360px] shrink-0 lg:sticky lg:top-28">
        <div className="bg-white dark:bg-[#0B1221] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col gap-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ClientIcon icon="ph:receipt" className="w-5 h-5 text-slate-500" />
            Order Summary
          </h3>

          {showDiscount && <DiscountCodeForm />}

          <div className="flex flex-col gap-3 text-sm mt-2">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Subtotal ({totalItems} items)</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{totalPrice}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-2">GST (18%)</span>
              <span className="font-semibold text-slate-900 dark:text-white">₹{taxesAndFees}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-1">
            <div className="flex justify-between items-end mb-6">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Pay</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">₹{grandTotal}</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={onPrimary}
                disabled={primaryDisabled}
                className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 px-6 transition-all hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-900 dark:disabled:hover:bg-white"
              >
                {primaryLabel} <ClientIcon icon={primaryIcon} className="w-4 h-4" />
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" /> {backLabel}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <ClientIcon icon="ph:lock-key" className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Secure</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <ClientIcon icon="ph:shield-check" className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom action bar, app-style — replaces the site's generic tab bar during checkout */}
      <div className="lg:hidden fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[70] bg-white/95 dark:bg-[#0B1221]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label={backLabel}
            className="w-12 h-12 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
          >
            <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
          </button>
        )}
        <div className="flex flex-col leading-tight shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Total</span>
          <span className="text-base font-black text-slate-900 dark:text-white">₹{grandTotal}</span>
        </div>
        <button
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="flex-1 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {primaryLabel} <ClientIcon icon={primaryIcon} className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
