"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { updateProfilePhone } from "@/actions/profile.actions";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all";

export function TechnicianPhoneCard({ initialPhone }: { initialPhone: string | null }) {
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [savedPhone, setSavedPhone] = useState(initialPhone ?? "");
  const [isEditing, setIsEditing] = useState(!initialPhone);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const res = await updateProfilePhone({ phone });
      if (!res.success) {
        setError(res.errors?.phone?.[0] || res.error || "Failed to update phone number");
        toast.error(res.error || "Failed to update phone number");
        return;
      }
      setSavedPhone(phone);
      setIsEditing(false);
      toast.success("Phone number updated — you can now log in with username + OTP");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <ClientIcon icon="ph:device-mobile-fill" className="text-amber-500 w-5 h-5" />
        Phone Number
      </h2>
      <p className="text-xs text-slate-400 mb-5">
        Used for username + OTP login — set this yourself so you can log in without a password.
      </p>

      {!isEditing ? (
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">+91 {savedPhone}</p>
          <button
            onClick={() => {
              setPhone(savedPhone);
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            Change
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-start gap-3">
          <div className="flex-1 w-full space-y-1.5">
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit mobile number"
              className={inputClass}
              required
            />
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="submit"
              disabled={isSaving || phone.trim() === savedPhone.trim() || phone.length !== 10}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            {savedPhone && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
