"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { completeCustomerOnboarding } from "@/actions/onboarding.actions";
import { OnboardingField } from "./OnboardingField";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface Props {
  initialName?: string;
  // Already-verified phone (e.g. from OTP sign-in) — when set, the phone
  // field is hidden entirely instead of re-collecting (and risking
  // silently overwriting) a number that's already confirmed.
  initialPhone?: string;
  onBack?: () => void;
  onSuccess: () => void;
}

export function CustomerDetailsStep({ initialName = "", initialPhone = "", onBack, onSuccess }: Props) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const phoneAlreadyVerified = Boolean(initialPhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await completeCustomerOnboarding({ name, phone: phoneAlreadyVerified ? initialPhone : phone });
      if (!res.success) {
        if (res.errors) {
          setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        }
        toast.error(res.error || "Please fix the highlighted fields");
        return;
      }
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 lg:px-9 pt-5 sm:pt-8 lg:pt-9 pb-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mb-4 -ml-1 transition-colors cursor-pointer"
          >
            <ClientIcon icon="ph:arrow-left-bold" className="w-3.5 h-3.5" /> Back
          </button>
        )}

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00B4FF] to-blue-600 flex items-center justify-center text-white shadow-md mb-3">
            <ClientIcon icon="ph:house-line-fill" className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
            Just a couple of details
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            We use this to confirm your bookings and keep you updated.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <OnboardingField
            label="Full Name"
            icon="ph:user"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            error={errors.name}
            required
          />
          {!phoneAlreadyVerified && (
            <OnboardingField
              label="Phone Number"
              icon="ph:phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              error={errors.phone}
              required
            />
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-5 sm:px-8 lg:px-9 py-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-4 bg-white dark:bg-[#0A101D]">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          {isSubmitting ? "Saving..." : "Continue to Dashboard"}
        </button>
      </div>
    </form>
  );
}
