"use client";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ServiceCall } from "@/lib/mockData";

const columns: ColumnDef<ServiceCall>[] = [
  {
    header: "ID",
    accessorKey: "id",
    sortable: true,
    cell: (item) => (
      <span className="font-medium text-slate-900 dark:text-white">
        {item.id}
      </span>
    ),
  },
  {
    header: "Customer",
    accessorKey: "customerName",
    sortable: true,
  },
  {
    header: "Service",
    accessorKey: "serviceType",
    sortable: true,
  },
  {
    header: "Date & Time",
    accessorKey: "date",
    sortable: true,
    cell: (item) => (
      <div className="flex flex-col">
        <span>{item.date}</span>
        <span className="text-xs text-slate-500">{item.time}</span>
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: (item) => {
      const colors = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        assigned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      };
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[item.status]}`}>
          {item.status.replace("_", " ")}
        </span>
      );
    },
  },
  {
    header: "Technician",
    cell: (item) => (
      <span className="text-sm font-medium">{item.technicianName || "Unassigned"}</span>
    ),
  },
  {
    header: "Amount",
    accessorKey: "amount",
    sortable: true,
    cell: (item) => (
      <span className="font-medium text-slate-900 dark:text-white">
        ₹{item.amount.toFixed(2)}
      </span>
    ),
  },
  {
    header: "Actions",
    cell: () => (
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
      { label: "Pending", value: "pending" },
      { label: "Assigned", value: "assigned" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ],
  },
];

export function ServiceCallsTable({ data }: { data: ServiceCall[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      filters={filters}
      searchPlaceholder="Search calls by ID, customer, service..."
      searchableFields={["id", "customerName", "serviceType", "location"]}
    />
  );
}
