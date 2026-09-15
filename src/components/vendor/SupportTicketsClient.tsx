"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Modal } from "@/components/shared/Modal";
import { SupportTicketThread } from "@/components/shared/SupportTicketThread";
import {
  raiseSupportTicketAction,
  type SupportTicketSummary,
} from "@/actions/supportticket.actions";
import type { CategoryWithServiceOptions } from "@/actions/category.actions";
import type { VendorCategorySummary, VendorServiceAreaSummary } from "@/actions/vendorservicearea.actions";
import type { SupportContactItem } from "@/actions/supportcontact.actions";

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

export function SupportTicketsClient({
  initialTickets,
  categories,
  myCategories,
  myAreas,
  supportContacts,
}: {
  initialTickets: SupportTicketSummary[];
  categories: CategoryWithServiceOptions[];
  myCategories: VendorCategorySummary[];
  myAreas: VendorServiceAreaSummary[];
  supportContacts: SupportContactItem[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [raiseOpen, setRaiseOpen] = useState(false);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);

  const openTicket = tickets.find((t) => t.id === openTicketId) ?? null;

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Request a service area, more categories, or ask us anything.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRaiseOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer transition-colors"
        >
          <ClientIcon icon="ph:plus-bold" className="w-4 h-4" /> Raise a ticket
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your categories</p>
          {myCategories.length === 0 ? (
            <p className="text-sm text-slate-400">None assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {myCategories.map((c) => (
                <span
                  key={c.categoryId}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
                >
                  {c.categoryName}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your service areas</p>
          {myAreas.length === 0 ? (
            <p className="text-sm text-slate-400">None added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {myAreas.map((a) => (
                <span
                  key={a.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                >
                  {a.pincode} · {a.radiusKm}km
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {supportContacts.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Prefer to reach us directly?
          </p>
          <div className="flex flex-wrap gap-2">
            {supportContacts.map((c) => (
              <a
                key={c.id}
                href={c.type === "PHONE" ? `tel:${c.value}` : `mailto:${c.value}`}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500/60 transition-colors"
              >
                <ClientIcon
                  icon={c.type === "PHONE" ? "ph:phone-fill" : "ph:envelope-simple-fill"}
                  className={`w-4 h-4 shrink-0 ${c.type === "PHONE" ? "text-emerald-500" : "text-blue-500"}`}
                />
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                    {c.label}
                  </span>
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white truncate">{c.value}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-12 text-center">
          <ClientIcon icon="ph:headset" className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No tickets yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {tickets.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpenTicketId(t.id)}
              className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{t.subject}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {CATEGORY_LABELS[t.category]} &middot; {formatDate(t.lastMessageAt)}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_STYLES[t.status]}`}>
                {t.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {raiseOpen && (
        <RaiseTicketModal
          categories={categories}
          onClose={() => setRaiseOpen(false)}
          onRaised={(ticket) => {
            setTickets((prev) => [ticket, ...prev]);
            setRaiseOpen(false);
            setOpenTicketId(ticket.id);
          }}
        />
      )}

      {openTicket && (
        <Modal title={openTicket.subject} onClose={() => setOpenTicketId(null)} bodyClassName="p-0">
          <div className="p-4">
            <SupportTicketThread ticketId={openTicket.id} disabled={openTicket.status !== "OPEN"} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function RaiseTicketModal({
  categories,
  onClose,
  onRaised,
}: {
  categories: CategoryWithServiceOptions[];
  onClose: () => void;
  onRaised: (ticket: SupportTicketSummary) => void;
}) {
  const [category, setCategory] = useState<"SERVICE_AREA" | "CATEGORY_ACCESS" | "GENERAL">("SERVICE_AREA");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pincode, setPincode] = useState("");
  const [radiusKm, setRadiusKm] = useState("5");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleCategory = (id: string) =>
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Fill in a subject and message");
      return;
    }
    if (category === "SERVICE_AREA" && !/^\d{6}$/.test(pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    if (category === "CATEGORY_ACCESS" && selectedCategoryIds.length === 0) {
      toast.error("Select at least one category");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await raiseSupportTicketAction({
        category,
        subject: subject.trim(),
        message: message.trim(),
        requestedPincode: category === "SERVICE_AREA" ? pincode : undefined,
        requestedRadiusKm: category === "SERVICE_AREA" ? Number(radiusKm) : undefined,
        requestedCategoryIds: category === "CATEGORY_ACCESS" ? selectedCategoryIds : undefined,
      });
      if (!res.success) {
        toast.error(res.error || "Couldn't raise your ticket");
        return;
      }
      if (!res.data) {
        toast.error("Couldn't raise your ticket");
        return;
      }
      toast.success("Ticket raised");
      onRaised({
        id: res.data.id,
        category,
        subject: subject.trim(),
        status: "OPEN",
        requestedPincode: category === "SERVICE_AREA" ? pincode : null,
        requestedRadiusKm: category === "SERVICE_AREA" ? Number(radiusKm) : null,
        requestedCategoryIds: category === "CATEGORY_ACCESS" ? selectedCategoryIds : [],
        vendorId: "",
        vendorName: "",
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        resolvedAt: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Raise a ticket"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {(["SERVICE_AREA", "CATEGORY_ACCESS", "GENERAL"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                category === c
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        <div>
          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary"
            className="w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {category === "SERVICE_AREA" && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Pincode</label>
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="6-digit pincode"
                className="w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div className="w-24">
              <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Radius</label>
              <input
                type="number"
                min={1}
                max={25}
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>
        )}

        {category === "CATEGORY_ACCESS" && (
          <div>
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCategory(c.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    selectedCategoryIds.includes(c.id)
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you need"
            maxLength={1000}
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>
      </div>
    </Modal>
  );
}
