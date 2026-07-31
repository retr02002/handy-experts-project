"use client";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Technician } from "@/lib/mockData";
import { ClientIcon } from "@/components/ui/ClientIcon";

const columns: ColumnDef<Technician>[] = [
  {
    header: "Name",
    accessorKey: "name",
    sortable: true,
    cell: (item) => (
      <div className="font-medium text-slate-900 dark:text-white">
        {item.name}
      </div>
    ),
  },
  {
    header: "Skills",
    cell: (item) => (
      <div className="flex flex-wrap gap-1">
        {item.skills.map((skill, idx) => (
          <span key={idx} className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {skill}
          </span>
        ))}
      </div>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: (item) => {
      const colors = {
        available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        on_job: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        offline: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
      };
      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[item.status]}`}>
          {item.status.replace("_", " ")}
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
    header: "Jobs",
    accessorKey: "completedJobs",
    sortable: true,
  },
  {
    header: "Actions",
    cell: () => (
      <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
        Manage
      </button>
    ),
  },
];

const filters = [
  {
    id: "status",
    label: "Status",
    options: [
      { label: "Available", value: "available" },
      { label: "On Job", value: "on_job" },
      { label: "Offline", value: "offline" },
    ],
  },
];

export function TechniciansTable({ data }: { data: Technician[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      filters={filters}
      searchPlaceholder="Search technicians by name..."
      searchableFields={["name"]}
    />
  );
}
