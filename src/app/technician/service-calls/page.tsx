"use client";

import React from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { mockServiceCalls, ServiceCall } from "@/lib/mockData";

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
    header: "Location",
    accessorKey: "location",
    sortable: true,
    cell: (item) => (
      <span className="text-sm max-w-[200px] truncate block">{item.location}</span>
    )
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
    header: "Actions",
    cell: (item) => (
      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
        {item.status === "completed" ? "View Summary" : "Update Status"}
      </button>
    ),
  },
];

const filters = [
  {
    id: "status",
    label: "Status",
    options: [
      { label: "Assigned", value: "assigned" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
    ],
  },
];

export default function TechnicianServiceCallsPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Service Calls</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your assigned service calls and tasks.</p>
        </div>
      </div>

      <DataTable 
        data={mockServiceCalls.filter(c => c.technicianName === "Mike Smith")} // Using Mike Smith as mock logged in tech
        columns={columns} 
        filters={filters} 
        searchPlaceholder="Search assigned calls..."
        searchableFields={["id", "customerName", "serviceType", "location"]}
      />
    </div>
  );
}
