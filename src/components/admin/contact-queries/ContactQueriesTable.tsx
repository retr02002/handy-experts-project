"use client";

import React from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { AdminContactQuery } from "@/actions/contactquery.actions";
import { REASON_LABELS, REASON_STYLES, STATUS_LABELS, STATUS_STYLES } from "./contactQueryStyles";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

interface Props {
  data: AdminContactQuery[];
  onView: (query: AdminContactQuery) => void;
  onDelete: (id: string) => void;
  busyId: string | null;
}

function buildColumns(onView: Props["onView"], onDelete: Props["onDelete"], busyId: string | null): ColumnDef<AdminContactQuery>[] {
  return [
    {
      header: "Name",
      accessorKey: "firstName",
      sortable: true,
      cell: (item) => (
        <div className="font-medium text-slate-900 dark:text-white">
          {item.firstName} {item.lastName}
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      sortable: true,
      cell: (item) => <span className="text-sm">{item.email}</span>,
    },
    {
      header: "Reason",
      cell: (item) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${REASON_STYLES[item.reason]}`}>
          {REASON_LABELS[item.reason]}
        </span>
      ),
    },
    {
      header: "Message",
      cell: (item) => <span className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs block">{item.message}</span>,
    },
    {
      header: "Status",
      cell: (item) => (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[item.status]}`}>
          {STATUS_LABELS[item.status]}
        </span>
      ),
    },
    {
      header: "Submitted",
      accessorKey: "createdAt",
      sortable: true,
      cell: (item) => <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(item.createdAt)}</span>,
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onView(item)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm cursor-pointer"
          >
            View
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={busyId === item.id}
            aria-label={`Delete query from ${item.firstName} ${item.lastName}`}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center disabled:opacity-50 cursor-pointer transition-colors"
          >
            <ClientIcon icon="ph:trash-bold" className="w-3.5 h-3.5" />
          </button>
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
      { label: "New", value: "NEW" },
      { label: "In Progress", value: "IN_PROGRESS" },
      { label: "Resolved", value: "RESOLVED" },
      { label: "Closed", value: "CLOSED" },
    ],
  },
  {
    id: "reason",
    label: "Reason",
    options: [
      { label: "General Inquiry", value: "GENERAL" },
      { label: "Customer Support", value: "SUPPORT" },
      { label: "Sales & Pricing", value: "SALES" },
      { label: "Become a Partner", value: "PARTNER" },
    ],
  },
];

export function ContactQueriesTable({ data, onView, onDelete, busyId }: Props) {
  return (
    <DataTable
      data={data}
      columns={buildColumns(onView, onDelete, busyId)}
      filters={filters}
      searchPlaceholder="Search by name or email..."
      searchableFields={["firstName", "lastName", "email"]}
    />
  );
}
