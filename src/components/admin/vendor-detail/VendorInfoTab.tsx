"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateVendorAction, setVendorActiveStatusAction, resetVendorPasswordAction, type AdminVendor } from "@/actions/admin.actions";
import { COMPANY_TYPES } from "@/lib/validations/onboarding.schema";
import { ClientIcon } from "@/components/ui/ClientIcon";

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

export function VendorInfoTab({
  vendor,
  isActive,
  onActiveChanged,
  onChanged,
}: {
  vendor: AdminVendor;
  isActive: boolean;
  onActiveChanged: (next: boolean) => void;
  onChanged: () => void;
}) {
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
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetForm, setResetForm] = useState({ password: "", confirmPassword: "", isRandom: false });

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
      onActiveChanged(next);
      toast.success(next ? "Vendor reactivated" : "Vendor deactivated");
      onChanged();
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetForm.isRandom) {
      if (!resetForm.password) {
        toast.error("Please enter a new password");
        return;
      }
      if (resetForm.password !== resetForm.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }
    
    setIsResetModalOpen(false);
    setIsResettingPassword(true);
    try {
      const res = await resetVendorPasswordAction(vendor.id, resetForm.isRandom ? undefined : resetForm.password);
      if (!res.success) {
        toast.error(res.error || "Failed to reset password");
        return;
      }
      if (!res.data) {
        toast.error("Failed to reset password: No data returned");
        return;
      }
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-bold">Password Reset Successful</p>
          <p className="text-sm">Temp Password: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{res.data.tempPassword}</span></p>
          <p className="text-xs opacity-80">{res.data.smsDelivered ? "SMS sent to vendor" : "SMS failed to send"}</p>
        </div>,
        { duration: 10000 }
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col gap-5 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
        <Field label="Contact Person" value={form.name} onChange={(v) => set("name", v)} editing={editing} />
        <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))} editing={editing} inputMode="numeric" />
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{vendor.email}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Can&apos;t be changed</p>
        </div>

        <Field label="Company Name" value={form.companyName} onChange={(v) => set("companyName", v)} editing={editing} />
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

        <Field label="GST Number (optional)" value={form.gstNumber} onChange={(v) => set("gstNumber", v.toUpperCase())} editing={editing} />
        <Field label="PAN Number (optional)" value={form.panNumber} onChange={(v) => set("panNumber", v.toUpperCase())} editing={editing} />
        <Field label="Aadhaar Number (optional)" value={form.aadhaarNumber} onChange={(v) => set("aadhaarNumber", v.replace(/\D/g, "").slice(0, 12))} editing={editing} inputMode="numeric" />

        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Address" value={form.address} onChange={(v) => set("address", v)} editing={editing} />
        </div>
        <Field label="City" value={form.city} onChange={(v) => set("city", v)} editing={editing} />
        <Field label="State" value={form.state} onChange={(v) => set("state", v)} editing={editing} />
        <Field label="Pincode" value={form.pincode} onChange={(v) => set("pincode", v.replace(/\D/g, "").slice(0, 6))} editing={editing} inputMode="numeric" />
      </div>
      {errors.companyName && <p className="text-xs text-red-500 -mt-2">{errors.companyName}</p>}

      <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
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
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 h-11 min-w-[160px] rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClientIcon icon="ph:pencil-simple-bold" className="w-4 h-4" /> Edit Details
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`flex-1 min-w-[160px] h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border ${
                isActive
                  ? "text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10"
                  : "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
              }`}
            >
              <ClientIcon icon={isActive ? "ph:prohibit-bold" : "ph:check-circle-bold"} className="w-4 h-4" />
              {isTogglingStatus ? "Updating..." : isActive ? "Deactivate Vendor" : "Reactivate Vendor"}
            </button>
            <button
              onClick={() => {
                setResetForm({ password: "", confirmPassword: "", isRandom: false });
                setShowPassword(false);
                setIsResetModalOpen(true);
              }}
              disabled={isResettingPassword}
              className="flex-1 min-w-[160px] h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/10"
            >
              <ClientIcon icon="ph:password-bold" className="w-4 h-4" />
              {isResettingPassword ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </div>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reset Password</h3>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={resetForm.isRandom} 
                onChange={(e) => setResetForm(prev => ({ ...prev, isRandom: e.target.checked, password: "", confirmPassword: "" }))} 
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-blue-500 focus:ring-blue-500/40 cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Generate a random password</span>
            </label>

            {!resetForm.isRandom && (
              <>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Password</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={resetForm.password}
                      onChange={(e) => setResetForm(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <ClientIcon icon={showPassword ? "ph:eye-slash-bold" : "ph:eye-bold"} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confirm Password</p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={resetForm.confirmPassword}
                      onChange={(e) => setResetForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 pr-10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPasswordSubmit}
                className="flex-1 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
