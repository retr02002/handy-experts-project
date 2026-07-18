import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function TechnicianDashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Here is what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-full px-4 py-2 shadow-sm w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Available for Jobs</span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full mt-2">

        {/* Next Job Card (Hero) */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-amber-600 dark:to-orange-700 p-6 md:p-8 rounded-3xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />

          <div className="relative z-10 flex flex-col h-full gap-6">
            <div className="flex justify-between items-start">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Up Next
              </span>
              <span className="text-sm font-medium text-slate-200 dark:text-amber-100 flex items-center gap-1.5">
                <ClientIcon icon="ph:clock" className="w-4 h-4" /> Today, 2:30 PM
              </span>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Plumbing Repair - Leak</h2>
              <p className="text-slate-300 dark:text-amber-100 text-sm flex items-center gap-2">
                <ClientIcon icon="ph:map-pin" className="w-4 h-4" /> 123 Maple Street, Suite 400
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">JD</div>
                <div>
                  <p className="text-xs text-slate-300 dark:text-amber-200">Customer</p>
                  <p className="text-sm font-semibold">John Doe</p>
                </div>
              </div>
              <button className="bg-white text-slate-900 dark:text-amber-900 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-105 transition-transform">
                Navigate
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Stack */}
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 hover:border-amber-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:wallet-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Earnings</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">$1,250</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:wrench-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jobs Done</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">14</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <ClientIcon icon="ph:star-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rating</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">4.9</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mt-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today&apos;s Schedule</h2>
          <button className="text-sm font-semibold text-amber-600 dark:text-amber-500 hover:underline">View All</button>
        </div>

        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 pb-4">

          <div className="relative pl-6">
            <div className="absolute w-4 h-4 bg-emerald-500 border-4 border-white dark:border-[#0F172A] rounded-full -left-[9px] top-1" />
            <p className="text-xs font-bold text-slate-400 mb-1">09:00 AM</p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
              <p className="font-semibold text-slate-900 dark:text-white line-through opacity-70">HVAC Maintenance</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Completed - Earned $120</p>
            </div>
          </div>

          <div className="relative pl-6">
            <div className="absolute w-4 h-4 bg-amber-500 border-4 border-white dark:border-[#0F172A] rounded-full -left-[9px] top-1 ring-2 ring-amber-500/30" />
            <p className="text-xs font-bold text-amber-600 dark:text-amber-500 mb-1">02:30 PM</p>
            <div className="bg-amber-50 dark:bg-amber-500/5 rounded-2xl p-4 border border-amber-200 dark:border-amber-500/20 shadow-sm">
              <p className="font-semibold text-slate-900 dark:text-white">Plumbing Repair - Leak</p>
              <p className="text-xs text-slate-500 mt-1">123 Maple Street, Suite 400</p>
            </div>
          </div>

          <div className="relative pl-6">
            <div className="absolute w-4 h-4 bg-slate-300 dark:bg-slate-600 border-4 border-white dark:border-[#0F172A] rounded-full -left-[9px] top-1" />
            <p className="text-xs font-bold text-slate-400 mb-1">04:00 PM</p>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
              <p className="font-semibold text-slate-900 dark:text-white">Electrical Assessment</p>
              <p className="text-xs text-slate-500 mt-1">456 Oak Avenue</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
