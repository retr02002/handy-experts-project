import React from "react";
import { mockServiceCalls } from "@/lib/mockData";
import { ServiceCallCard } from "@/components/shared/ServiceCallCard";

export default function VendorBookingsPage() {
  const bookings = mockServiceCalls.filter(c => c.status === "pending" || c.status === "assigned" || c.status === "in_progress");

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Bookings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage scheduled service calls and assignments.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {bookings.map(call => (
            <ServiceCallCard 
              key={call.id} 
              call={call} 
              viewerRole="vendor" 
            />
          ))}
          
          {bookings.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No upcoming bookings found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
