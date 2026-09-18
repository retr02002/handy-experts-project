"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { updateAdminFreelanceTechnicianLeadFeeAction } from "@/actions/technician.actions";

export function FreelanceLeadFeeManager({
  technicianId,
  initialType,
  initialAmount,
}: {
  technicianId: string;
  initialType: "FIXED" | "PERCENTAGE";
  initialAmount: number;
}) {
  const [feeType, setFeeType] = useState<"FIXED" | "PERCENTAGE">(initialType);
  const [feeAmount, setFeeAmount] = useState<string>(initialAmount.toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const parsedAmount = parseFloat(feeAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Please enter a valid positive number for the amount.");
      return;
    }
    if (feeType === "PERCENTAGE" && parsedAmount > 100) {
      toast.error("Percentage cannot exceed 100.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateAdminFreelanceTechnicianLeadFeeAction(technicianId, feeType, parsedAmount);
      if (res.success) {
        toast.success("Call fee settings updated.");
      } else {
        toast.error(res.error || "Failed to update call fee.");
      }
    } catch (e) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ClientIcon icon="ph:currency-inr-bold" className="w-4 h-4 text-[#00B4FF]" />
          Call Fee Configuration
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Set how this freelancer is charged when accepting Live Calls.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={feeType}
          onChange={(e) => setFeeType(e.target.value as "FIXED" | "PERCENTAGE")}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="FIXED">Fixed Amount (₹)</option>
          <option value="PERCENTAGE">Percentage (%)</option>
        </select>
        
        <input
          type="number"
          min="0"
          step="0.01"
          value={feeAmount}
          onChange={(e) => setFeeAmount(e.target.value)}
          placeholder={feeType === "FIXED" ? "e.g. 50" : "e.g. 10"}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1120] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-400"
        />

        <button
          onClick={handleSave}
          disabled={isSaving || (feeType === initialType && parseFloat(feeAmount) === initialAmount)}
          className="shrink-0 px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
