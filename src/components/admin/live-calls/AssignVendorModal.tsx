"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { ClientIcon } from "@/components/ui/ClientIcon";
import {
  getCategoryMatchedVendorsForLiveCallAction,
  adminAssignLiveCallToVendorAction,
  type CategoryMatchedVendorOption,
} from "@/actions/adminlivecall.actions";

interface Props {
  liveCallId: string;
  onClose: () => void;
  onAssigned: () => void;
}

export function AssignVendorModal({ liveCallId, onClose, onAssigned }: Props) {
  const [vendors, setVendors] = useState<CategoryMatchedVendorOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategoryMatchedVendorsForLiveCallAction(liveCallId).then((res) => {
      if (res.success && res.data) setVendors(res.data);
      setLoaded(true);
    });
  }, [liveCallId]);

  const handleAssign = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await adminAssignLiveCallToVendorAction(liveCallId, selectedId);
      if (!res.success) {
        toast.error(res.error || "Failed to assign this lead");
        return;
      }
      toast.success("Assigned to vendor");
      onAssigned();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Assign to Vendor" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {!loaded ? (
          <p className="text-sm text-slate-400 text-center py-6">Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No vendors found.</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {vendors.map((v) => (
              <button
                key={v.id}
                type="button"
                disabled={!v.isActive}
                onClick={() => setSelectedId(v.id)}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  selectedId === v.id
                    ? "border-[#00B4FF] ring-2 ring-[#00B4FF]/20 bg-blue-50/50 dark:bg-blue-500/5"
                    : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{v.companyName}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {v.isCategoryMatch && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      Category Match
                    </span>
                  )}
                  {!v.isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Inactive
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleAssign}
          disabled={!selectedId || isSubmitting}
          className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <ClientIcon icon="ph:arrow-bend-up-right-bold" className="w-4 h-4" />
          {isSubmitting ? "Assigning..." : "Assign"}
        </button>
      </div>
    </Modal>
  );
}
