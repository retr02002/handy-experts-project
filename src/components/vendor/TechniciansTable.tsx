"use client";

import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import type { VendorTechnician } from "@/actions/technician.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

function buildColumns(onView: (tech: VendorTechnician) => void): ColumnDef<VendorTechnician>[] {
  return [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
      cell: (item) => <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>,
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (item) => <span className="text-sm text-slate-600 dark:text-slate-400">{item.email}</span>,
    },
    {
      header: "Phone",
      accessorKey: "phone",
    },
    {
      header: "Skill",
      accessorKey: "skillCategory",
      sortable: true,
      cell: (item) => (
        <span className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {item.skillCategory}
        </span>
      ),
    },
    {
      header: "Experience",
      accessorKey: "experienceYears",
      sortable: true,
      cell: (item) => <span>{item.experienceYears} yrs</span>,
    },
    {
      header: "Service Area",
      accessorKey: "servicePincode",
    },
    {
      header: "Added",
      accessorKey: "createdAt",
      sortable: true,
      cell: (item) => (
        <span className="text-sm text-slate-500">
          {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${
            item.isOnDuty
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          <ClientIcon icon="ph:circle-fill" className="w-2 h-2" />
          {item.isOnDuty ? "On Duty" : "Off Duty"}
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
    id: "isOnDuty",
    label: "Status",
    options: [
      { label: "On Duty", value: "true" },
      { label: "Off Duty", value: "false" },
    ],
  },
];

export function TechniciansTable({ data, onView }: { data: VendorTechnician[]; onView: (tech: VendorTechnician) => void }) {
  return (
    <DataTable
      data={data}
      columns={buildColumns(onView)}
      filters={filters}
      searchPlaceholder="Search technicians by name..."
      searchableFields={["name", "email"]}
    />
  );
}
