"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { validateCouponAction } from "@/actions/coupon.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface Props {
  className?: string;
  /** The currently-applied coupon code, if any — lifted to CartContainer so
   *  it persists and affects the total across every checkout step. */
  appliedCode?: string | null;
  onApplied?: (coupon: { code: string; discountAmount: number }) => void;
  onRemoved?: () => void;
}

export function DiscountCodeForm({ className = "", appliedCode = null, onApplied, onRemoved }: Props) {
  const { items } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || items.length === 0) return;

    setIsApplying(true);
    try {
      const res = await validateCouponAction(
        couponCode,
        items.map((item) => ({ packageId: item.id, unitPrice: item.pkg.price, quantity: item.quantity }))
      );
      if (!res.success || !res.data) {
        toast.error((res.success ? undefined : res.error) || "Invalid or expired coupon code.");
        return;
      }
      toast.success(`Coupon applied — you save ₹${res.data.discountAmount}`);
      onApplied?.({ code: res.data.couponCode, discountAmount: res.data.discountAmount });
      setCouponCode("");
    } finally {
      setIsApplying(false);
    }
  };

  if (appliedCode) {
    return (
      <div className={`flex items-center justify-between gap-2 px-3 h-11 rounded-lg border border-dashed border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 ${className}`}>
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <ClientIcon icon="ph:ticket-fill" className="w-4 h-4" />
          {appliedCode} applied
        </span>
        <button
          type="button"
          onClick={onRemoved}
          className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 cursor-pointer"
        >
          Remove
        </button>
      </div>
    );
  }

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
