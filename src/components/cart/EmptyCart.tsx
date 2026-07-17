"use client";

import React from "react";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface EmptyCartProps {
  isSavedTab?: boolean;
}

export function EmptyCart({ isSavedTab = false }: EmptyCartProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm text-center">
      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
        <ClientIcon 
          icon={isSavedTab ? "ph:bookmark-simple" : "ph:shopping-cart-simple"} 
          className="w-10 h-10" 
        />
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {isSavedTab ? "No saved items" : "Your cart is empty"}
      </h3>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
        {isSavedTab 
          ? "Items you save for later will appear here. Ready to find a service?"
          : "Looks like you haven't added any services yet. Explore our top-rated professionals to get started."}
      </p>
      
      <Link 
        href="/"
        className="h-12 px-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
      >
        <ClientIcon icon="ph:magnifying-glass-bold" className="w-4 h-4" />
        Explore Services
      </Link>
    </div>
  );
}
