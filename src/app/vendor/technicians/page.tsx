import { mockTechnicians } from "@/lib/mockData";
import { TechniciansTable } from "@/components/vendor/TechniciansTable";

export default function VendorTechniciansPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Technicians</h1>
      </div>
      <TechniciansTable
        data={mockTechnicians.filter((t) => t.vendorName === "FixIt Plumbing Inc.")} // Using FixIt Plumbing as mock current vendor
      />
    </div>
  );
}
