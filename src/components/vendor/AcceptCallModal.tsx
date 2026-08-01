"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import { getMyTechniciansAction, type VendorTechnician } from "@/actions/technician.actions";
import { acceptAndAssignLiveCallAction } from "@/actions/servicecall.actions";
import type { NearbyLiveCall } from "@/actions/livecall.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface AcceptCallModalProps {
  call: NearbyLiveCall;
  onClose: () => void;
  onAccepted: () => void;
}

export function AcceptCallModal({ call, onClose, onAccepted }: AcceptCallModalProps) {
  const [technicians, setTechnicians] = useState<VendorTechnician[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getMyTechniciansAction().then((res) => {
      if (res.success && res.data) setTechnicians(res.data);
      setLoaded(true);
    });
  }, []);

  const itemSummary = call.items.map((i) => `${i.packageName}${i.quantity > 1 ? ` x${i.quantity}` : ""}`).join(", ");

  const handleAccept = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await acceptAndAssignLiveCallAction(call.id, selectedId);
      if (!res.success) {
        toast.error(res.error || "Failed to accept this call");
        return;
      }
      toast.success("Call accepted and assigned");
      onAccepted();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white pr-8">Accept &amp; assign</h3>
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 mt-3 mb-4 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{itemSummary}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {call.customerName} &middot; {call.city}, {call.pincode} &middot; ₹{call.total}
          </p>
        </div>

        {!loaded ? (
          <div className="py-6 text-center text-slate-400 text-sm">Loading technicians...</div>
        ) : technicians.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              You don&apos;t have any technicians yet. Add one before accepting calls.
            </p>
            <Link
              href="/vendor/technicians"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#00B4FF] hover:text-blue-600"
            >
              Go to Technicians <ClientIcon icon="ph:arrow-right-bold" className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">Assign to</p>
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-4">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setSelectedId(tech.id)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedId === tech.id
                      ? "border-[#00B4FF] ring-2 ring-[#00B4FF]/20 bg-blue-50/50 dark:bg-blue-500/5"
                      : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tech.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tech.skillCategory}</p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tech.isOnDuty
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {tech.isOnDuty ? "On Duty" : "Off Duty"}
                  </span>
                </button>
              ))}
            </div>

            {selectedId && technicians.find((t) => t.id === selectedId)?.isOnDuty === false && (
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-2.5 mb-3">
                <ClientIcon icon="ph:warning-circle-fill" className="w-4 h-4 shrink-0 mt-0.5" />
                <span>This technician is currently off duty and may not respond right away.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAccept}
              disabled={!selectedId || isSubmitting}
              className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? "Accepting..." : "Accept & Assign"}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
