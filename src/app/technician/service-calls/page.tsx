import { mockServiceCalls } from "@/lib/mockData";
import { ServiceCallsTable } from "@/components/technician/ServiceCallsTable";

export default function TechnicianServiceCallsPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your assigned service calls and tasks.</p>
        </div>
      </div>

      <ServiceCallsTable
        data={mockServiceCalls.filter((c) => c.technicianName === "Mike Smith")} // Using Mike Smith as mock logged in tech
      />
    </div>
  );
}
