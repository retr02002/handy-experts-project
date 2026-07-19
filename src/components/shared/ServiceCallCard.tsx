"use client";

import React from "react";
import { ServiceCall } from "@/lib/mockData";
import { ClientIcon } from "@/components/ui/ClientIcon";
import Link from "next/link";

interface ServiceCallCardProps {
  call: ServiceCall;
  onAction?: (actionId: string, callId: string) => void;
  viewerRole: "super_admin" | "vendor" | "technician";
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function ServiceCallCard({ call, onAction, viewerRole }: ServiceCallCardProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all group gap-4">
      
      {/* Left Section: Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[call.status]}`}>
            {call.status.replace("_", " ")}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {call.id}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <ClientIcon icon="heroicons:calendar" className="w-3.5 h-3.5 mr-1" />
            {call.date} at {call.time}
          </span>
        </div>
        
        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate mb-1">
          {call.serviceType}
        </h3>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center">
            <ClientIcon icon="heroicons:user" className="w-4 h-4 mr-1 text-slate-400" />
            {call.customerName}
          </div>
          <div className="flex items-center">
            <ClientIcon icon="heroicons:map-pin" className="w-4 h-4 mr-1 text-slate-400" />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">{call.location}</span>
          </div>
          <div className="flex items-center font-medium text-slate-700 dark:text-slate-300">
            <ClientIcon icon="heroicons:currency-rupee" className="w-4 h-4 mr-1 text-slate-400" />
            ₹{call.amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Right Section: Actions & Assignment Info */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-4 gap-3">
        
        {/* Assignment info based on viewer */}
        <div className="text-sm text-left md:text-right hidden sm:block">
          {viewerRole === "super_admin" && (
            <>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Vendor</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{call.vendorName || "Unassigned"}</p>
            </>
          )}
          {viewerRole === "vendor" && (
            <>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Technician</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{call.technicianName || "Unassigned"}</p>
            </>
          )}
          {viewerRole === "technician" && (
             <p className="font-medium text-slate-800 dark:text-slate-200 mt-2">
               {call.status === "completed" ? "Done" : "Pending Action"}
             </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Link
            href={`#view-${call.id}`}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
          >
            Details
          </Link>
          
          {(viewerRole === "super_admin" || viewerRole === "vendor") && call.status === "pending" && (
            <button
              onClick={() => onAction?.("assign", call.id)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg shadow-sm transition-colors"
            >
              Assign
            </button>
          )}

          {viewerRole === "technician" && call.status === "assigned" && (
            <button
              onClick={() => onAction?.("start", call.id)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
            >
              Start Job
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
