import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function TechnicianWalletPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Wallet</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your earnings and payouts.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <ClientIcon icon="ph:money" className="w-4 h-4" />
            Request Payout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-4 md:p-6 rounded-2xl md:rounded-3xl text-white shadow-sm flex flex-col justify-between h-36 md:h-40">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm md:text-base text-emerald-100">Available Balance</p>
            <ClientIcon icon="ph:wallet" className="w-5 h-5 md:w-6 md:h-6 text-emerald-200" />
          </div>
          <p className="text-3xl md:text-4xl font-bold">₹1,250.00</p>
        </div>
        
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm flex flex-col justify-between h-36 md:h-40">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm md:text-base text-slate-500 dark:text-slate-400">Lifetime Earnings</p>
            <ClientIcon icon="ph:chart-line-up" className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
          </div>
          <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">₹4,250.00</p>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
        <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Transaction History</h2>
        <div className="flex items-center justify-center py-8 md:py-12 text-slate-500">
          <p className="text-sm">No recent transactions.</p>
        </div>
      </div>
    </div>
  );
}
