"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export function DiscountCodeForm({ className = "" }: { className?: string }) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      toast.error("Invalid or expired coupon code.");
    }, 1000);
  };

  return (
    <form onSubmit={handleApplyCoupon} className={`relative flex items-center ${className}`}>
      <input
        id="coupon"
        type="text"
        placeholder="Discount code"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        className="w-full h-11 sm:h-10 pl-3 pr-20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition-all uppercase"
      />
      <button
        type="submit"
        disabled={isApplying || !couponCode.trim()}
        className="absolute right-1 h-9 sm:h-8 px-3 rounded-md bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] font-bold disabled:opacity-50 transition-colors hover:bg-slate-800 dark:hover:bg-slate-600"
      >
        {isApplying ? "..." : "Apply"}
      </button>
    </form>
  );
}
