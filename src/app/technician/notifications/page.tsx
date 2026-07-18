import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function TechnicianNotificationsPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">You have <span className="font-bold text-amber-500">2 unread</span> messages.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-500 transition-colors bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm w-fit">
          <ClientIcon icon="ph:check-circle" className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {/* Today Section */}
      <div className="flex flex-col gap-3 mt-2">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2">Today</h2>

        <div className="flex flex-col gap-3">

          {/* Actionable Notification Card (Unread/Urgent) */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all flex flex-col sm:flex-row gap-4 relative overflow-hidden group">

            <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-2xl h-fit text-amber-500 shrink-0 self-start">
              <ClientIcon icon="ph:warning-circle-fill" className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Urgent: New Service Call Assigned
                </h3>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-full whitespace-nowrap ml-4">
                  2 min ago
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                You have been assigned a high-priority plumbing job at 123 Maple St. The customer reported an active leak. Please acknowledge this assignment immediately.
              </p>

              <div className="flex gap-2">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  Accept Job
                </button>
                <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Standard Notification Card (Unread) */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all flex flex-col sm:flex-row gap-4 relative overflow-hidden group">

            <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-2xl h-fit text-blue-500 shrink-0 self-start">
              <ClientIcon icon="ph:star-fill" className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  New 5-Star Review!
                </h3>
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-4">
                  1 hour ago
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                &quot;John was incredibly fast and professional. Fixed the issue in under 30 minutes!&quot;
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Yesterday Section */}
      <div className="flex flex-col gap-3 mt-4">
        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-2">Yesterday</h2>

        <div className="flex flex-col gap-3">

          {/* Standard Notification Card (Read) */}
          <div className="bg-slate-50 dark:bg-[#0F172A]/50 border border-slate-100 dark:border-slate-800/50 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 group opacity-80 hover:opacity-100 transition-opacity">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-2xl h-fit text-emerald-500 shrink-0 self-start">
              <ClientIcon icon="ph:money-fill" className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  Payout Processed
                </h3>
                <span className="text-xs font-medium text-slate-500 whitespace-nowrap ml-4">
                  Yesterday, 4:00 PM
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-500 leading-relaxed">
                Your requested payout of $450.00 has been successfully processed to your linked bank account. It should appear within 1-2 business days.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
