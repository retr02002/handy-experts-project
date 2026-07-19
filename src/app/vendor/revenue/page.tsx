import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { mockEarnings } from "@/lib/mockData";

export default function VendorRevenuePage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue & Earnings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your income and financial performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Available Balance</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{mockEarnings.balance}</h3>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Today</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{mockEarnings.today}</h3>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">This Week</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{mockEarnings.thisWeek}</h3>
        </div>
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">This Month</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{mockEarnings.thisMonth}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex items-center justify-center shadow-sm">
        <div className="text-center">
           <ClientIcon icon="ph:chart-line-up" className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
           <p className="text-slate-500 dark:text-slate-400 font-medium">Detailed Revenue Chart</p>
        </div>
      </div>
    </div>
  );
}
