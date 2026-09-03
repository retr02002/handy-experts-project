"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { createTechnicianAction, type CreatedTechnicianCredentials } from "@/actions/technician.actions";
import { SKILL_CATEGORIES } from "@/lib/validations/onboarding.schema";
import { ClientIcon } from "@/components/ui/ClientIcon";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  skillCategory: "",
  experienceYears: "",
  servicePincode: "",
};

interface CreateTechnicianModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateTechnicianModal({ onClose, onCreated }: CreateTechnicianModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<CreatedTechnicianCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await createTechnicianAction({
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
      if (res.data) {
        setCredentials(res.data);
        onCreated();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(credentials.tempPassword);
    setCopied(true);
    toast.success("Password copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={credentials ? onClose : undefined}
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

        {credentials ? (
          <div className="flex flex-col gap-4 pt-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <ClientIcon icon="ph:check-bold" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technician added</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {credentials.smsDelivered
                  ? "We've also texted these details to them — this password is shown only once."
                  : "Couldn't text these details — share them manually. Shown only once."}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 flex flex-col gap-3 border border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Username</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">{credentials.username}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white break-all">{credentials.email}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Temporary Password</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 break-all">
                    {credentials.tempPassword}
                  </code>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="shrink-0 w-9 h-9 rounded-lg bg-[#00B4FF] text-white flex items-center justify-center hover:bg-[#0096fa] transition-colors cursor-pointer"
                  >
                    <ClientIcon icon={copied ? "ph:check-bold" : "ph:copy-bold"} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add technician</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                They&apos;ll be added under your company and can accept jobs you assign.
              </p>
            </div>

            <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} error={errors.name} placeholder="Technician's full name" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="technician@example.com" />
            <Field
              label="Phone Number"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))}
              error={errors.phone}
              placeholder="10-digit mobile number"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Skill</label>
                <select
                  value={form.skillCategory}
                  onChange={(e) => set("skillCategory", e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  <option value="" disabled>
                    Select skill
                  </option>
                  {SKILL_CATEGORIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.skillCategory && <p className="text-xs text-red-500 mt-1">{errors.skillCategory}</p>}
              </div>
              <Field
                label="Experience (yrs)"
                type="number"
                value={form.experienceYears}
                onChange={(v) => set("experienceYears", v)}
                error={errors.experienceYears}
                placeholder="e.g. 3"
              />
            </div>

            <Field
              label="Service Area Pincode"
              inputMode="numeric"
              value={form.servicePincode}
              onChange={(v) => set("servicePincode", v.replace(/\D/g, "").slice(0, 6))}
              error={errors.servicePincode}
              placeholder="6-digit pincode"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              {isSubmitting ? "Adding..." : "Add Technician"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
