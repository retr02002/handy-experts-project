"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function CartSummary() {
  const { totalPrice, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const taxesAndFees = Math.round(totalPrice * 0.18);
  const grandTotal = totalPrice + taxesAndFees;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      alert("Invalid or expired coupon code.");
    }, 1000);
  };

  if (totalItems === 0) return null;

  return (
    <div className="w-full lg:w-[360px] shrink-0 lg:sticky lg:top-28">
      <div className="bg-white dark:bg-[#0B1221] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col gap-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ClientIcon icon="ph:receipt" className="w-5 h-5 text-slate-500" />
          Order Summary
        </h3>

        {/* Coupon Code Section */}
        <form onSubmit={handleApplyCoupon} className="relative flex items-center">
          <input
            id="coupon"
            type="text"
            placeholder="Discount code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="w-full h-10 pl-3 pr-20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-all uppercase"
          />
          <button
            type="submit"
            disabled={isApplying || !couponCode.trim()}
            className="absolute right-1 h-8 px-3 rounded-md bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold disabled:opacity-50 transition-colors hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            {isApplying ? "..." : "Apply"}
          </button>
        </form>

        <div className="flex flex-col gap-3 text-sm mt-2">
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span>Subtotal ({totalItems} items)</span>
            <span className="font-semibold text-slate-900 dark:text-white">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              GST (18%)
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">₹{taxesAndFees}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-1">
          <div className="flex justify-between items-end mb-6">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Pay</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">₹{grandTotal}</span>
          </div>

          <button className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 px-6 transition-all hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm">
            Checkout <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Trust Badges */}
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
  );
}
