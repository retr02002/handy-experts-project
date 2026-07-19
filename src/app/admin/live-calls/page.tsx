import React from "react";
import { mockServiceCalls } from "@/lib/mockData";
import { ServiceCallCard } from "@/components/shared/ServiceCallCard";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function LiveCallsPage() {
  const liveCalls = mockServiceCalls.filter(call => call.status === "in_progress" || call.status === "assigned");

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Calls</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor active service calls across the platform.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Tracking Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 min-h-[500px] flex flex-col shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {/* Simple placeholder for a map */}
            <div className="text-center opacity-50">
              <ClientIcon icon="ph:map-trifold" className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">Map Interface View</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-slate-900/5 dark:bg-[#0F172A]/20"></div>
          
          <div className="relative z-10 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 mb-auto mx-2 mt-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ClientIcon icon="ph:map-pin" className="w-4 h-4 text-emerald-500" />
              Service Area Map
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{liveCalls.length} Active Technicians</span>
          </div>
          
          {/* Mock map markers */}
          <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-blue-500 text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce z-10">
            <ClientIcon icon="ph:user" className="w-4 h-4" />
          </div>
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-emerald-500 text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10">
            <ClientIcon icon="ph:user" className="w-4 h-4" />
          </div>
          <div className="absolute bottom-1/4 right-1/3 w-8 h-8 bg-purple-500 text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center z-10">
            <ClientIcon icon="ph:user" className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Active Service Calls</h2>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-2">
            {liveCalls.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                No active calls right now.
              </div>
            ) : (
              liveCalls.map(call => (
                <ServiceCallCard 
                  key={call.id} 
                  call={call} 
                  viewerRole="super_admin" 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
