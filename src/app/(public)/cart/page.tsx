import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { CartContainer } from "@/components/cart/CartContainer";

export const metadata: Metadata = {
  title: "Checkout - Handy Experts",
  description: "Review and manage your selected services before checkout.",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0F1C] pt-28 pb-32 lg:pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Page Header (Server Rendered) */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-white dark:bg-[#0B1221] border border-slate-200 dark:border-slate-800/80 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-sm"
          >
            <ClientIcon icon="ph:arrow-left-bold" className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Checkout
          </h1>
        </div>

        {/* Client Side Cart Content */}
        <CartContainer />
        
      </div>
    </div>
  );
}
