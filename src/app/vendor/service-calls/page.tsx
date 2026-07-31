import { mockServiceCalls } from "@/lib/mockData";
import { ServiceCallsTable } from "@/components/vendor/ServiceCallsTable";

export default function VendorServiceCallsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Service Calls</h1>
      </div>
      <ServiceCallsTable data={mockServiceCalls.filter((c) => c.vendorName === "FixIt Plumbing Inc.")} />
    </div>
  );
}
