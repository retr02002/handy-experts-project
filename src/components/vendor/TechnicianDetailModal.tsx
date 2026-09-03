"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  updateTechnicianAction,
  deleteTechnicianAction,
  resetTechnicianPasswordAction,
  type VendorTechnician,
} from "@/actions/technician.actions";
import { SKILL_CATEGORIES } from "@/lib/validations/onboarding.schema";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface TechnicianDetailModalProps {
  technician: VendorTechnician;
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

export function TechnicianDetailModal({ technician, onClose, onChanged }: TechnicianDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: technician.name,
    email: technician.email,
    phone: technician.phone,
    skillCategory: technician.skillCategory,
    experienceYears: String(technician.experienceYears),
    servicePincode: technician.servicePincode,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [resetPassword, setResetPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});
    try {
      const res = await updateTechnicianAction({
        id: technician.id,
        ...form,
        skillCategory: form.skillCategory as (typeof SKILL_CATEGORIES)[number],
        experienceYears: Number(form.experienceYears),
      });
      if (!res.success) {
        if (res.errors) setErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        toast.error(res.error || "Please fix the highlighted fields");
        return;
      }
      toast.success("Technician updated");
      setEditing(false);
      onChanged();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteTechnicianAction(technician.id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete technician");
        setConfirmingDelete(false);
        return;
      }
      toast.success("Technician deleted");
      onChanged();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      const res = await resetTechnicianPasswordAction(technician.id);
      if (!res.success) {
        toast.error(res.error || "Failed to reset password");
        return;
      }
      if (!res.data) {
        toast.error("Failed to reset password");
        return;
      }
      setResetPassword(res.data.tempPassword);
      toast[res.data.smsDelivered ? "success" : "error"](
        res.data.smsDelivered ? "New password also texted to the technician" : "Couldn't text the technician — please share this manually"
      );
    } finally {
      setIsResetting(false);
    }
  };

  const copyPassword = () => {
    if (!resetPassword) return;
    navigator.clipboard.writeText(resetPassword);
    setCopied(true);
    toast.success("Password copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-[#0F172A] rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
        </button>

        {resetPassword ? (
          <div className="flex flex-col gap-4 pt-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <ClientIcon icon="ph:key-fill" className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password reset</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Share this new password with {technician.name} — it&apos;s shown only once.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 break-all">
                  {resetPassword}
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
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between pr-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editing ? "Edit technician" : technician.name}</h3>
              {!editing && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    technician.isOnDuty
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {technician.isOnDuty ? "On Duty" : "Off Duty"}
                </span>
              )}
            </div>

            <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} editing={editing} />
            <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} editing={editing} />
            <Field
              label="Phone Number"
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))}
              editing={editing}
            />
            {errors.name && <p className="text-xs text-red-500 -mt-2">{errors.name}</p>}
            {errors.email && <p className="text-xs text-red-500 -mt-2">{errors.email}</p>}
            {errors.phone && <p className="text-xs text-red-500 -mt-2">{errors.phone}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Skill</p>
                {editing ? (
                  <select
                    value={form.skillCategory}
                    onChange={(e) => set("skillCategory", e.target.value)}
                    className="w-full h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  >
                    {SKILL_CATEGORIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{form.skillCategory}</p>
                )}
              </div>
              <Field
                label="Experience (yrs)"
                type="number"
                value={form.experienceYears}
                onChange={(v) => set("experienceYears", v)}
                editing={editing}
              />
            </div>

            <Field
              label="Service Area Pincode"
              inputMode="numeric"
              value={form.servicePincode}
              onChange={(v) => set("servicePincode", v.replace(/\D/g, "").slice(0, 6))}
              editing={editing}
            />

            {confirmingDelete ? (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Delete {technician.name}? This can&apos;t be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 h-10 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
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
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer disabled:opacity-60"
                    >
                      <ClientIcon icon="ph:key-bold" className="w-4 h-4" />
                      {isResetting ? "Resetting..." : "Reset Password"}
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(true)}
                      className="w-full h-11 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                    >
                      <ClientIcon icon="ph:trash-bold" className="w-4 h-4" /> Delete Technician
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
