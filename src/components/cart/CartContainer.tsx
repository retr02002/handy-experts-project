"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { CartItemCard } from "./CartItemCard";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";
import { ClientIcon } from "@/components/ui/ClientIcon";

type Tab = "active" | "saved";

export function CartContainer() {
  const { items, savedItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("active");

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    // Minimal skeleton to avoid layout shift
    return <div className="animate-pulse h-[60vh] bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl"></div>;
  }

  const displayItems = activeTab === "active" ? items : savedItems;
  const isDisplayEmpty = displayItems.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Sleek Segmented Control Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B1221] rounded-lg w-full sm:w-fit border border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "active"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          <ClientIcon icon="ph:shopping-cart" className="w-4 h-4 shrink-0" />
          <span className="truncate">Active Cart</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
            {items.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "saved"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
          }`}
        >
          <ClientIcon icon="ph:bookmark-simple" className="w-4 h-4 shrink-0" />
          <span className="truncate">Saved Items</span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
            {savedItems.length}
          </span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Items List */}
        <div className="flex-1 w-full flex flex-col gap-4">
          {isDisplayEmpty ? (
            <EmptyCart isSavedTab={activeTab === "saved"} />
          ) : (
            <div className="flex flex-col gap-4">
              {displayItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  isSavedItem={activeTab === "saved"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary */}
        {activeTab === "active" && !isDisplayEmpty && <CartSummary />}
      </div>
    </div>
  );
}
