"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { updateVendorAction, setVendorActiveStatusAction, type AdminVendor } from "@/actions/admin.actions";
import { COMPANY_TYPES } from "@/lib/validations/onboarding.schema";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface VendorDetailModalProps {
  vendor: AdminVendor;
  onClose: () => void;
  onChanged: () => void;
}

function Field({
  label,
  value,
  onChange,
  editing,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      {editing ? (
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
        />
      ) : (
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{value || "—"}</p>
      )}
    </div>
  );
}

export function VendorDetailModal({ vendor, onClose, onChanged }: VendorDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: vendor.contactName,
    phone: vendor.phone,
    companyName: vendor.companyName,
    companyType: vendor.companyType,
    gstNumber: vendor.gstNumber ?? "",
    panNumber: vendor.panNumber ?? "",
    aadhaarNumber: vendor.aadhaarNumber ?? "",
    address: vendor.address,
    city: vendor.city,
    state: vendor.state,
    pincode: vendor.pincode,
    incorporationDate: vendor.incorporationDate.slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isActive, setIsActive] = useState(vendor.isActive);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      const res = await updateVendorAction({
        id: vendor.id,
        ...form,
        companyType: form.companyType as (typeof COMPANY_TYPES)[number],
      });
      if (!res.success) {
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        toast.error(res.error || "Please fix the highlighted fields");
        return;
      }
      toast.success("Vendor updated");
      setEditing(false);
      onChanged();
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      const next = !isActive;
      const res = await setVendorActiveStatusAction(vendor.id, next);
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
        return;
      }
      setIsActive(next);
      toast.success(next ? "Vendor reactivated" : "Vendor deactivated");
      onChanged();
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
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

        <div className="flex items-center justify-between pr-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? "Edit vendor" : form.companyName}</h3>
          {!editing && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
              }`}
            >
              {isActive ? "Active" : "Deactivated"}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Person" value={form.name} onChange={(v) => set("name", v)} editing={editing} />
            <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))} editing={editing} inputMode="numeric" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2">{vendor.email} (can&apos;t be changed)</p>

          <Field label="Company Name" value={form.companyName} onChange={(v) => set("companyName", v)} editing={editing} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Type</p>
              {editing ? (
                <select
                  value={form.companyType}
                  onChange={(e) => set("companyType", e.target.value)}
                  className="w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  {COMPANY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{form.companyType}</p>
              )}
            </div>
            <Field label="Incorporation Date" type="date" value={form.incorporationDate} onChange={(v) => set("incorporationDate", v)} editing={editing} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="GST Number (optional)" value={form.gstNumber} onChange={(v) => set("gstNumber", v.toUpperCase())} editing={editing} />
            <Field label="PAN Number (optional)" value={form.panNumber} onChange={(v) => set("panNumber", v.toUpperCase())} editing={editing} />
          </div>
          <Field label="Aadhaar Number (optional)" value={form.aadhaarNumber} onChange={(v) => set("aadhaarNumber", v.replace(/\D/g, "").slice(0, 12))} editing={editing} inputMode="numeric" />
          <Field label="Address" value={form.address} onChange={(v) => set("address", v)} editing={editing} />
          <div className="grid grid-cols-3 gap-3">
            <Field label="City" value={form.city} onChange={(v) => set("city", v)} editing={editing} />
            <Field label="State" value={form.state} onChange={(v) => set("state", v)} editing={editing} />
            <Field label="Pincode" value={form.pincode} onChange={(v) => set("pincode", v.replace(/\D/g, "").slice(0, 6))} editing={editing} inputMode="numeric" />
          </div>
          {errors.companyName && <p className="text-xs text-red-500 -mt-2">{errors.companyName}</p>}

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <p><span className="font-bold">{vendor.technicianCount}</span> technicians</p>
            <p><span className="font-bold">{vendor.serviceCallCount}</span> service calls</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-5">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-60 text-white text-sm font-bold cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ClientIcon icon="ph:pencil-simple-bold" className="w-4 h-4" /> Edit Details
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus}
                className={`w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${
                  isActive
                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                    : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                }`}
              >
                <ClientIcon icon={isActive ? "ph:prohibit-bold" : "ph:check-circle-bold"} className="w-4 h-4" />
                {isTogglingStatus ? "Updating..." : isActive ? "Deactivate Vendor" : "Reactivate Vendor"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
