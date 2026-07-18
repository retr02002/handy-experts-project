import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function VendorDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Welcome Banner */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1E1B4B] dark:to-[#312E81] rounded-2xl p-8 shadow-sm dark:shadow-lg border border-blue-100 dark:border-indigo-900/50 transition-colors">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          Welcome to your Vendor Portal <span className="text-4xl">🛠️</span>
        </h1>
        <p className="text-slate-600 dark:text-indigo-200">
          Manage your technicians, review live service calls, and track your earnings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        
        {/* Total Calls Assigned */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:phone-call" className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Total Assigned</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">142</div>
            <div className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <ClientIcon icon="ph:trend-up" className="w-3 h-3" />
              +5%
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500 w-full" />
          </div>
        </div>

        {/* Active Technicians */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:users" className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Active Techs</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">12</div>
            <div className="text-xs font-medium text-amber-500 dark:text-amber-400">On Duty</div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-amber-500 w-[70%]" />
          </div>
        </div>

        {/* Completed Jobs */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:check-circle" className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Completed</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">1,204</div>
            <div className="text-xs font-medium text-slate-500">All Time</div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-[85%]" />
          </div>
        </div>

        {/* Earnings */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:currency-dollar" className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Earnings</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">$4,250</div>
            <div className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
               This Month
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-rose-500 w-[60%]" />
          </div>
        </div>

      </div>

      {/* Placeholder for larger charts, matching screenshot's bottom rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex items-center justify-center shadow-sm">
           <span className="text-slate-400 dark:text-slate-600 font-medium tracking-widest uppercase text-sm">Performance Chart Placeholder</span>
        </div>
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex items-center justify-center shadow-sm">
           <span className="text-slate-400 dark:text-slate-600 font-medium tracking-widest uppercase text-sm">Technician Status Placeholder</span>
        </div>
      </div>
    </div>
  );
}
