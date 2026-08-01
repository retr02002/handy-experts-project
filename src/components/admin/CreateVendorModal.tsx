"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { createVendorAction, type CreatedVendorCredentials } from "@/actions/admin.actions";
import { COMPANY_TYPES } from "@/lib/validations/onboarding.schema";
import { ClientIcon } from "@/components/ui/ClientIcon";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  companyType: "",
  gstNumber: "",
  panNumber: "",
  aadhaarNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  incorporationDate: "",
};

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
        className="w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

interface CreateVendorModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateVendorModal({ onClose, onCreated }: CreateVendorModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<CreatedVendorCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await createVendorAction({
        ...form,
        companyType: form.companyType as (typeof COMPANY_TYPES)[number],
      });
      if (!res.success) {
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
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
        className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Vendor created</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Share these sign-in details with them — this password is shown only once.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 flex flex-col gap-3 border border-slate-200 dark:border-slate-800">
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add vendor</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a company account directly.</p>
            </div>

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider -mb-2">Contact Person</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} error={errors.name} placeholder="Contact person" />
              <Field
                label="Phone"
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))}
                error={errors.phone}
                placeholder="10-digit mobile"
              />
            </div>
            <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="vendor@example.com" />

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider -mb-2 mt-1">Company Details</p>
            <Field label="Company Name" value={form.companyName} onChange={(v) => set("companyName", v)} error={errors.companyName} placeholder="Registered company name" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Company Type</label>
                <select
                  value={form.companyType}
                  onChange={(e) => set("companyType", e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  <option value="" disabled>Select type</option>
                  {COMPANY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.companyType && <p className="text-xs text-red-500 mt-1">{errors.companyType}</p>}
              </div>
              <Field label="Incorporation Date" type="date" value={form.incorporationDate} onChange={(v) => set("incorporationDate", v)} error={errors.incorporationDate} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="GST Number" value={form.gstNumber} onChange={(v) => set("gstNumber", v.toUpperCase())} error={errors.gstNumber} placeholder="22AAAAA0000A1Z5" />
              <Field label="PAN Number" value={form.panNumber} onChange={(v) => set("panNumber", v.toUpperCase())} error={errors.panNumber} placeholder="ABCDE1234F" />
            </div>
            <Field
              label="Aadhaar Number"
              inputMode="numeric"
              value={form.aadhaarNumber}
              onChange={(v) => set("aadhaarNumber", v.replace(/\D/g, "").slice(0, 12))}
              error={errors.aadhaarNumber}
              placeholder="12-digit Aadhaar of contact person"
            />

            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider -mb-2 mt-1">Address</p>
            <Field label="Street Address" value={form.address} onChange={(v) => set("address", v)} error={errors.address} placeholder="Building, street, area" />
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" value={form.city} onChange={(v) => set("city", v)} error={errors.city} placeholder="City" />
              <Field label="State" value={form.state} onChange={(v) => set("state", v)} error={errors.state} placeholder="State" />
              <Field
                label="Pincode"
                inputMode="numeric"
                value={form.pincode}
                onChange={(v) => set("pincode", v.replace(/\D/g, "").slice(0, 6))}
                error={errors.pincode}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white text-sm font-bold transition-colors cursor-pointer mt-1"
            >
              {isSubmitting ? "Creating..." : "Create Vendor"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
