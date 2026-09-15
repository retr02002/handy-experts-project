"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Modal } from "@/components/shared/Modal";
import { SupportTicketThread } from "@/components/shared/SupportTicketThread";
import {
  approveTicketAction,
  resolveTicketAction,
  type SupportTicketSummary,
} from "@/actions/supportticket.actions";

const CATEGORY_LABELS: Record<string, string> = {
  SERVICE_AREA: "Service area",
  CATEGORY_ACCESS: "Category access",
  GENERAL: "General",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  CLOSED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const FILTERS = ["OPEN", "RESOLVED", "ALL"] as const;

export function AdminSupportTicketsClient({ initialTickets }: { initialTickets: SupportTicketSummary[] }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("OPEN");
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [isActing, setIsActing] = useState(false);

  const openTicket = tickets.find((t) => t.id === openTicketId) ?? null;
  const visible = tickets.filter((t) => filter === "ALL" || t.status === filter);

  const markResolvedLocally = (id: string) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "RESOLVED" as const } : t)));

  const approve = async () => {
    if (!openTicket) return;
    setIsActing(true);
    try {
      const res = await approveTicketAction(openTicket.id);
      if (!res.success) {
        toast.error(res.error || "Couldn't approve this ticket");
        return;
      }
      toast.success("Approved and resolved");
      markResolvedLocally(openTicket.id);
    } finally {
      setIsActing(false);
    }
  };

  const resolve = async () => {
    if (!openTicket) return;
    if (!resolveNote.trim()) {
      toast.error("Add a closing note for the vendor");
      return;
    }
    setIsActing(true);
    try {
      const res = await resolveTicketAction(openTicket.id, resolveNote);
      if (!res.success) {
        toast.error(res.error || "Couldn't resolve this ticket");
        return;
      }
      toast.success("Ticket resolved");
      markResolvedLocally(openTicket.id);
      setResolveNote("");
    } finally {
      setIsActing(false);
    }
  };

  const canApprove = openTicket && (openTicket.category === "SERVICE_AREA" || openTicket.category === "CATEGORY_ACCESS");

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Vendor requests for service areas, category access, and general help.
          </p>
        </div>
        <Link
          href="/admin/support/contacts"
          className="h-10 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center gap-2 shrink-0 hover:border-blue-400 transition-colors"
        >
          <ClientIcon icon="ph:address-book-bold" className="w-4 h-4" /> Manage Contacts
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer ${
              filter === f
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <ClientIcon icon="ph:headset" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No {filter !== "ALL" ? filter.toLowerCase() : ""} tickets.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {visible.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpenTicketId(t.id)}
              className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.subject}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {t.vendorName} &middot; {CATEGORY_LABELS[t.category]} &middot; {formatDate(t.lastMessageAt)}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_STYLES[t.status]}`}>
                {t.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {openTicket && (
        <Modal title={openTicket.subject} onClose={() => setOpenTicketId(null)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {openTicket.vendorName} &middot; {CATEGORY_LABELS[openTicket.category]}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[openTicket.status]}`}>
                {openTicket.status}
              </span>
            </div>

            {openTicket.category === "SERVICE_AREA" && openTicket.requestedPincode && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Requested: pincode {openTicket.requestedPincode}, {openTicket.requestedRadiusKm}km radius
              </p>
            )}
            {openTicket.category === "CATEGORY_ACCESS" && openTicket.requestedCategoryIds.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Requested {openTicket.requestedCategoryIds.length} categor
                {openTicket.requestedCategoryIds.length === 1 ? "y" : "ies"}
              </p>
            )}

            <SupportTicketThread ticketId={openTicket.id} disabled={openTicket.status !== "OPEN"} />

            {openTicket.status === "OPEN" && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {canApprove && (
                  <button
                    type="button"
                    onClick={approve}
                    disabled={isActing}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer transition-colors"
                  >
                    {isActing ? "Approving..." : "Approve & Resolve"}
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <input
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                    placeholder="Closing note for the vendor"
                    className="flex-1 h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    onClick={resolve}
                    disabled={isActing}
                    className="h-10 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold disabled:opacity-60 cursor-pointer shrink-0"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
