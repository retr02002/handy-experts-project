"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { WizardModal } from "@/components/admin/services/WizardModal";
import { addServiceAreaAction } from "@/actions/technicianservicearea.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const inputClass =
  "w-full px-3.5 py-3 rounded-xl border-2 border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-bold tracking-wider text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 transition-all shadow-inner";

export function ServiceAreaFormModal({ isOpen, onClose, onCreated }: Props) {
  const [pincode, setPincode] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetAndClose = () => {
    setPincode("");
    setRadiusKm(5);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!/^\d{6}$/.test(pincode)) {
      setErrors({ pincode: "Enter a valid 6-digit pincode" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addServiceAreaAction({ pincode, radiusKm });
      if (!res.success) {
        toast.error(res.error);
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        return;
      }
      toast.success("Serviceable area added");
      onCreated();
      resetAndClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WizardModal
      isOpen={isOpen}
      title="Add Serviceable Area"
      stepLabels={["Area"]}
      currentStep={0}
      isLastStep
      isSubmitting={isSubmitting}
      submitLabel="Add Area"
      onClose={resetAndClose}
      onBack={() => {}}
      onNext={() => {}}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-5 w-full pb-2">
        {/* Helper Banner */}
        <div className="bg-amber-50/80 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center shrink-0">
            <ClientIcon icon="ph:info-duotone" className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="pt-0.5">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 mb-0.5">How service areas work</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300/80 leading-snug">
              Your vendor and Handyzo admins can see this coverage on the live-calls map — it helps them route the right jobs to you. You can add multiple areas.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ClientIcon icon="ph:map-pin-bold" className="w-4 h-4 text-slate-400" />
            Area Pincode
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              className={inputClass}
              value={pincode}
              placeholder="e.g. 110001"
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {pincode.length === 6 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ClientIcon icon="ph:check-circle-fill" className="w-4 h-4 text-emerald-500" />
              </div>
            )}
          </div>
          {errors.pincode ? (
            <span className="text-[11px] font-bold text-red-500 flex items-center gap-1 mt-1">
              <ClientIcon icon="ph:warning-circle-fill" className="w-3.5 h-3.5" />
              {errors.pincode}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-500 mt-1 ml-1">Must be a valid 6-digit postal code.</span>
          )}
        </div>

        <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />

          <div className="flex justify-between items-center relative z-10">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ClientIcon icon="ph:broadcast-bold" className="w-4 h-4 text-slate-400" />
              Coverage Radius
            </label>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-100 dark:border-amber-500/20">
              <span className="font-black text-base text-amber-600 dark:text-amber-400 leading-none">{radiusKm}</span>
              <span className="text-[11px] font-bold text-amber-600/70 dark:text-amber-400/70 leading-none">km</span>
            </div>
          </div>

          <div className="relative pt-2 pb-1 z-10">
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-600 dark:accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            <div className="flex justify-between mt-2 text-[11px] font-bold text-slate-400">
              <span className={radiusKm === 1 ? "text-amber-500" : ""}>1 km</span>
              <span className={radiusKm === 13 ? "text-amber-500" : ""}>13 km</span>
              <span className={radiusKm === 25 ? "text-amber-500" : ""}>25 km</span>
            </div>
          </div>
          {errors.radiusKm && (
            <span className="text-[11px] font-bold text-red-500 flex items-center gap-1 z-10">
              <ClientIcon icon="ph:warning-circle-fill" className="w-3.5 h-3.5" />
              {errors.radiusKm}
            </span>
          )}
        </div>
      </div>
    </WizardModal>
  );
}
