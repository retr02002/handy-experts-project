import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { ServiceCallCard } from "@/components/shared/ServiceCallCard";
import { mockServiceCalls, mockVendors } from "@/lib/mockData";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Welcome Banner */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1E1B4B] dark:to-[#312E81] rounded-2xl p-8 shadow-sm dark:shadow-lg border border-blue-100 dark:border-indigo-900/50 transition-colors">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          Welcome back to Handy Experts <span className="text-4xl">👋</span>
        </h1>
        <p className="text-slate-600 dark:text-indigo-200">
          Here is the real-time overview of your service infrastructure and call metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Total Calls */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:phone-call" className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Total Calls</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">4,291</div>
            <div className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <ClientIcon icon="ph:trend-up" className="w-3 h-3" />
              +12%
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500 w-full" />
          </div>
        </div>

        {/* Open Calls */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:phone-incoming" className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Open Calls</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">124</div>
            <div className="text-xs font-medium text-amber-500 dark:text-amber-400">Needs action</div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-amber-500 w-[40%]" />
          </div>
        </div>

        {/* Accepted Calls */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:check-circle" className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Accepted</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">842</div>
            <div className="text-xs font-medium text-slate-500">In Progress</div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-[60%]" />
          </div>
        </div>

        {/* Closed Calls */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:folder-simple-lock" className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Closed</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">3,325</div>
            <div className="text-xs font-medium text-slate-500">Completed</div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-slate-400 dark:bg-slate-600 w-[85%]" />
          </div>
        </div>

        {/* Feedback Customer */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:star" className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Feedback</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">4.8</div>
            <div className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
               Avg Score
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-rose-500 w-[96%]" />
          </div>
        </div>

      </div>

      {/* Placeholder for larger charts, matching screenshot's bottom rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Service Calls</h2>
           <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[500px]">
             {mockServiceCalls.slice(0, 5).map((call) => (
               <ServiceCallCard 
                 key={call.id} 
                 call={call} 
                 viewerRole="super_admin" 
               />
             ))}
           </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Top Vendor Performance</h2>
           <div className="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[500px]">
             {mockVendors.slice(0, 5).map((vendor) => (
               <div key={vendor.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div>
                   <h3 className="font-semibold text-slate-900 dark:text-white">{vendor.companyName}</h3>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">{vendor.status}</span>
                     <span className="text-xs text-slate-500 flex items-center gap-1"><ClientIcon icon="ph:star-fill" className="w-3 h-3 text-amber-500" /> {vendor.rating}</span>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-sm font-bold text-slate-900 dark:text-white">{vendor.completedJobs}</div>
                   <div className="text-xs text-slate-500">Jobs Completed</div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
