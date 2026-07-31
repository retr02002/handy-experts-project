import { mockVendors } from "@/lib/mockData";
import { VendorsTable } from "@/components/admin/VendorsTable";

export default function VendorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendors & Companies</h1>
      <VendorsTable data={mockVendors} />
    </div>
  );
}
