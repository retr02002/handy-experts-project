"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { updateServiceCallStatusAction, type ServiceCallSummary } from "@/actions/servicecall.actions";
import { NEXT_STEP, JOB_STATUS_COLORS, jobStatusLabel } from "@/lib/jobStatus";
import { canStartTravel } from "@/lib/jobSchedule";

function ActionCell({
  item,
  onUpdated,
  onView,
}: {
  item: ServiceCallSummary;
  onUpdated: () => void;
  onView: (item: ServiceCallSummary) => void;
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const step = NEXT_STEP[item.status];
  if (!step) return <span className="text-xs text-slate-400">—</span>;
  // Same rule the server enforces: a scheduled job can't be set off days early.
  const travelLocked = item.status === "ASSIGNED" && !canStartTravel(item.scheduledFor);

  const handleClick = async () => {
    // Start/complete need the customer's PIN — hand off to the job panel.
    if (step.gated) {
      onView(item);
      return;
    }
    setIsUpdating(true);
    try {
      const res = await updateServiceCallStatusAction(item.id, step.next);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      toast.success(`Marked as ${jobStatusLabel(step.next)}`);
      onUpdated();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isUpdating || travelLocked}
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {isUpdating ? "Updating..." : travelLocked ? "Not yet" : step.label}
    </button>
  );
}

function buildColumns(onUpdated: () => void, onView: (item: ServiceCallSummary) => void): ColumnDef<ServiceCallSummary>[] {
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
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${JOB_STATUS_COLORS[item.status] ?? ""}`}>
          {jobStatusLabel(item.status)}
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => onView(item)}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium text-sm cursor-pointer"
          >
            View
          </button>
          <ActionCell item={item} onUpdated={onUpdated} onView={onView} />
        </div>
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
      { label: "On the Way", value: "EN_ROUTE" },
      { label: "In Progress", value: "IN_PROGRESS" },
      { label: "Completed", value: "COMPLETED" },
    ],
  },
];

export function ServiceCallsTable({
  data,
  onUpdated,
  onView,
}: {
  data: ServiceCallSummary[];
  onUpdated: () => void;
  onView: (item: ServiceCallSummary) => void;
}) {
  return (
    <DataTable
      data={data}
      columns={buildColumns(onUpdated, onView)}
      filters={filters}
      searchPlaceholder="Search assigned calls..."
      searchableFields={["customerName", "itemSummary", "city"]}
    />
  );
}
