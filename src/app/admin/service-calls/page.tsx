import { mockServiceCalls } from "@/lib/mockData";
import { ServiceCallsTable } from "@/components/admin/ServiceCallsTable";

export default function ServiceCallsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
      <ServiceCallsTable data={mockServiceCalls} />
    </div>
  );
}
