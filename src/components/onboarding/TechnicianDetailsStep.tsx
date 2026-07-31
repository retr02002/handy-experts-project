"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { completeTechnicianOnboarding } from "@/actions/onboarding.actions";
import { SKILL_CATEGORIES } from "@/lib/validations/onboarding.schema";
import { OnboardingField } from "./OnboardingField";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface Props {
  initialName?: string;
  onBack?: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  skillCategory: "",
  experienceYears: "",
  aadhaarNumber: "",
  servicePincode: "",
};

export function TechnicianDetailsStep({ initialName = "", onBack, onSuccess }: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM, name: initialName });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await completeTechnicianOnboarding({
        ...form,
        skillCategory: form.skillCategory as (typeof SKILL_CATEGORIES)[number],
        experienceYears: Number(form.experienceYears),
      });
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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md mb-3">
            <ClientIcon icon="ph:wrench-fill" className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
            Set up your technician profile
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            This helps us match you with nearby jobs that fit your skills.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OnboardingField
              label="Full Name"
              icon="ph:user"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Your full name"
              error={errors.name}
              required
            />
            <OnboardingField
              label="Phone Number"
              icon="ph:phone"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              error={errors.phone}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OnboardingField
              as="select"
              label="Primary Skill"
              icon="ph:wrench"
              value={form.skillCategory}
              onChange={(e) => set("skillCategory", e.target.value)}
              options={SKILL_CATEGORIES}
              error={errors.skillCategory}
            />
            <OnboardingField
              label="Years of Experience"
              icon="ph:briefcase"
              type="number"
              min={0}
              max={60}
              value={form.experienceYears}
              onChange={(e) => set("experienceYears", e.target.value)}
              placeholder="e.g. 3"
              error={errors.experienceYears}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <OnboardingField
              label="Aadhaar Number"
              icon="ph:identification-card"
              inputMode="numeric"
              value={form.aadhaarNumber}
              onChange={(e) => set("aadhaarNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="12-digit Aadhaar number"
              error={errors.aadhaarNumber}
              required
            />
            <OnboardingField
              label="Service Area Pincode"
              icon="ph:map-pin"
              inputMode="numeric"
              value={form.servicePincode}
              onChange={(e) => set("servicePincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit pincode"
              error={errors.servicePincode}
              required
            />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <ClientIcon icon="ph:shield-check" className="w-3.5 h-3.5 shrink-0" />
            Your Aadhaar number is used only for identity verification and kept confidential.
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-5 sm:px-8 lg:px-9 py-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-4 bg-white dark:bg-[#0A101D]">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white rounded-xl py-3.5 sm:py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          {isSubmitting ? "Saving..." : "Complete Registration"}
        </button>
      </div>
    </form>
  );
}
