"use client";

import React from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { mockVendors, Vendor } from "@/lib/mockData";
import { ClientIcon } from "@/components/ui/ClientIcon";

const columns: ColumnDef<Vendor>[] = [
  {
    header: "Company Name",
    accessorKey: "companyName",
    sortable: true,
    cell: (item) => (
      <div className="font-medium text-slate-900 dark:text-white">
        {item.companyName}
      </div>
    ),
  },
  {
    header: "Contact",
    accessorKey: "contactPerson",
    sortable: true,
    cell: (item) => (
      <div className="flex flex-col">
        <span className="text-sm">{item.contactPerson}</span>
        <span className="text-xs text-slate-500">{item.email}</span>
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: (item) => {
      const colors = {
        active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      };
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[item.status]}`}>
          {item.status}
        </span>
      );
    },
  },
  {
    header: "Rating",
    accessorKey: "rating",
    sortable: true,
    cell: (item) => (
      <div className="flex items-center text-amber-500">
        <ClientIcon icon="heroicons:star-solid" className="w-4 h-4 mr-1" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">
          {item.rating > 0 ? item.rating.toFixed(1) : "N/A"}
        </span>
      </div>
    ),
  },
  {
    header: "Completed Jobs",
    accessorKey: "completedJobs",
    sortable: true,
  },
  {
    header: "Actions",
    cell: (item) => (
      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
        View Details
      </button>
    ),
  },
];

const filters = [
  {
    id: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
];

export default function VendorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vendors & Companies</h1>
      <DataTable 
        data={mockVendors} 
        columns={columns} 
        filters={filters} 
        searchPlaceholder="Search vendors..."
        searchableFields={["companyName", "contactPerson", "email"]}
      />
    </div>
  );
}
