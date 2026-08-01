"use client";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import type { ServiceCallSummary } from "@/actions/servicecall.actions";

const statusColors: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  EN_ROUTE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function buildColumns(onManage: (call: ServiceCallSummary) => void): ColumnDef<ServiceCallSummary>[] {
  return [
    {
      header: "Customer",
      accessorKey: "customerName",
      sortable: true,
    },
    {
      header: "Phone",
      accessorKey: "customerPhone",
    },
    {
      header: "Service",
      accessorKey: "itemSummary",
    },
    {
      header: "Location",
      cell: (item) => (
        <span className="text-sm max-w-[180px] truncate block">
          {item.city}, {item.pincode}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[item.status] ?? ""}`}>
          {item.status.replace("_", " ").toLowerCase()}
        </span>
      ),
    },
    {
      header: "Technician",
      accessorKey: "technicianName",
    },
    {
      header: "Assigned",
      accessorKey: "assignedAt",
      sortable: true,
      cell: (item) => (
        <span className="text-sm text-slate-500">
          {new Date(item.assignedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      ),
    },
    {
      header: "Amount",
      accessorKey: "total",
      sortable: true,
      cell: (item) => <span className="font-medium text-slate-900 dark:text-white">₹{item.total.toFixed(2)}</span>,
    },
    {
      header: "Actions",
      cell: (item) => (
        <button
          onClick={() => onManage(item)}
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
    id: "status",
    label: "Status",
    options: [
      { label: "Assigned", value: "ASSIGNED" },
      { label: "En Route", value: "EN_ROUTE" },
      { label: "In Progress", value: "IN_PROGRESS" },
      { label: "Completed", value: "COMPLETED" },
      { label: "Cancelled", value: "CANCELLED" },
    ],
  },
];

export function ServiceCallsTable({ data, onManage }: { data: ServiceCallSummary[]; onManage: (call: ServiceCallSummary) => void }) {
  return (
    <DataTable
      data={data}
      columns={buildColumns(onManage)}
      filters={filters}
      searchPlaceholder="Search calls by customer, technician, service..."
      searchableFields={["customerName", "itemSummary", "city", "technicianName"]}
    />
  );
}
