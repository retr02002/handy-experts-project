"use client";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import type { AdminVendor } from "@/actions/admin.actions";

function buildColumns(onView: (vendor: AdminVendor) => void): ColumnDef<AdminVendor>[] {
  return [
    {
      header: "Company",
      accessorKey: "companyName",
      sortable: true,
      cell: (item) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{item.companyName}</div>
          <div className="text-xs text-slate-400">{item.companyType}</div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "contactName",
      sortable: true,
      cell: (item) => (
        <div className="flex flex-col">
          <span className="text-sm">{item.contactName}</span>
          <span className="text-xs text-slate-500">{item.email}</span>
        </div>
      ),
    },
    {
      header: "GST / PAN",
      cell: (item) => (
        <div className="flex flex-col text-xs">
          <span>{item.gstNumber}</span>
          <span className="text-slate-500">{item.panNumber}</span>
        </div>
      ),
    },
    {
      header: "Location",
      cell: (item) => (
        <span className="text-sm">
          {item.city}, {item.pincode}
        </span>
      ),
    },
    {
      header: "Technicians",
      accessorKey: "technicianCount",
      sortable: true,
    },
    {
      header: "Service Calls",
      accessorKey: "serviceCallCount",
      sortable: true,
    },
    {
      header: "Status",
      cell: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            item.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {item.isActive ? "Active" : "Deactivated"}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item) => (
        <button
          onClick={() => onView(item)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm cursor-pointer"
        >
          Manage
        </button>
      ),
    },
  ];
}

const filters = [
  {
    id: "isActive",
    label: "Status",
    options: [
      { label: "Active", value: "true" },
      { label: "Deactivated", value: "false" },
    ],
  },
];

export function VendorsTable({ data, onView }: { data: AdminVendor[]; onView: (vendor: AdminVendor) => void }) {
  return (
    <DataTable
      data={data}
      columns={buildColumns(onView)}
      filters={filters}
      searchPlaceholder="Search vendors by company, contact..."
      searchableFields={["companyName", "contactName", "email"]}
    />
  );
}
