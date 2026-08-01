"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { updateServiceCallStatusAction, type ServiceCallSummary, type ServiceCallStatusValue } from "@/actions/servicecall.actions";

const statusColors: Record<string, string> = {
  ASSIGNED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  EN_ROUTE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const NEXT_STATUS: Partial<Record<string, { label: string; next: ServiceCallStatusValue }>> = {
  ASSIGNED: { label: "Start", next: "EN_ROUTE" },
  EN_ROUTE: { label: "Begin Job", next: "IN_PROGRESS" },
  IN_PROGRESS: { label: "Complete", next: "COMPLETED" },
};

function ActionCell({ item, onUpdated }: { item: ServiceCallSummary; onUpdated: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const step = NEXT_STATUS[item.status];
  if (!step) return <span className="text-xs text-slate-400">—</span>;

  const handleClick = async () => {
    setIsUpdating(true);
    try {
      const res = await updateServiceCallStatusAction(item.id, step.next);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      toast.success(`Marked as ${step.next.replace("_", " ").toLowerCase()}`);
      onUpdated();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isUpdating}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm disabled:opacity-50 cursor-pointer"
    >
      {isUpdating ? "Updating..." : step.label}
    </button>
  );
}

function buildColumns(onUpdated: () => void): ColumnDef<ServiceCallSummary>[] {
  return [
    {
      header: "Customer",
      accessorKey: "customerName",
      sortable: true,
    },
    {
      header: "Service",
      accessorKey: "itemSummary",
    },
    {
      header: "Location",
      cell: (item) => (
        <span className="text-sm max-w-[200px] truncate block">
          {item.address}, {item.city}
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
      header: "Amount",
      accessorKey: "total",
      sortable: true,
      cell: (item) => <span className="font-medium text-slate-900 dark:text-white">₹{item.total.toFixed(2)}</span>,
    },
    {
      header: "Actions",
      cell: (item) => <ActionCell item={item} onUpdated={onUpdated} />,
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
    ],
  },
];

export function ServiceCallsTable({ data, onUpdated }: { data: ServiceCallSummary[]; onUpdated: () => void }) {
  return (
    <DataTable
      data={data}
      columns={buildColumns(onUpdated)}
      filters={filters}
      searchPlaceholder="Search assigned calls..."
      searchableFields={["customerName", "itemSummary", "city"]}
    />
  );
}
