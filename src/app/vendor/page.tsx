import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { ServiceCallCard } from "@/components/shared/ServiceCallCard";
import { mockServiceCalls, mockTechnicians } from "@/lib/mockData";
import { getProfileDetails } from "@/actions/profile.actions";

export default async function VendorDashboardPage() {
  const profile = await getProfileDetails();
  const greetingName = profile?.vendorProfile?.companyName || profile?.name || "Vendor";

  return (
    <div className="flex flex-col gap-6">

      {/* Welcome Banner */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1E1B4B] dark:to-[#312E81] rounded-2xl p-8 shadow-sm dark:shadow-lg border border-blue-100 dark:border-indigo-900/50 transition-colors">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          Welcome, {greetingName} <span className="text-4xl">🛠️</span>
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
              <ClientIcon icon="ph:currency-inr" className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Earnings</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">₹4,250</div>
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
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col shadow-sm">
           <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Active Service Calls</h2>
           <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[500px]">
             {mockServiceCalls
               .filter(c => c.vendorName === "FixIt Plumbing Inc." || !c.vendorName)
               .slice(0, 5)
               .map((call) => (
                 <ServiceCallCard 
                   key={call.id} 
                   call={call} 
                   viewerRole="vendor" 
                 />
             ))}
           </div>
        </div>
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 min-h-[300px] flex flex-col shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-900 dark:text-white">Technician Status</h2>
             <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</button>
           </div>
           <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[500px]">
             {mockTechnicians.map((tech) => (
               <div key={tech.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold">
                       {tech.name.charAt(0)}
                     </div>
                     <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#0F172A]
                       ${tech.status === 'available' ? 'bg-emerald-500' : 
                         tech.status === 'on_job' ? 'bg-amber-500' : 
                         'bg-slate-400'}`}
                     />
                   </div>
                   <div>
                     <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{tech.name}</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{tech.status.replace('_', ' ')}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
                     <ClientIcon icon="ph:star-fill" className="w-3.5 h-3.5 text-amber-500" />
                     {tech.rating}
                   </div>
                   <div className="text-xs text-slate-500">{tech.completedJobs} jobs</div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
