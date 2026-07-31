"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { updateProfileName, changePassword } from "@/actions/profile.actions";

const inputClass =
  "w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

interface Props {
  name: string;
  email: string;
  hasPassword: boolean;
  accentClass?: string;
}

export function AccountSettingsCard({ name: initialName, email, hasPassword, accentClass = "text-blue-500" }: Props) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setIsSavingName(true);
    try {
      const res = await updateProfileName({ name });
      if (!res.success) {
        setNameError(res.errors?.name?.[0] || res.error || "Failed to update name");
        toast.error(res.error || "Failed to update name");
        return;
      }
      await update();
      toast.success("Name updated");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    if (newPassword !== confirmPassword) {
      setPasswordErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changePassword({
        currentPassword: hasPassword ? currentPassword : undefined,
        newPassword,
      });
      if (!res.success) {
        if (res.errors) {
          setPasswordErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        }
        toast.error(res.error || "Failed to change password");
        return;
      }
      toast.success(hasPassword ? "Password updated" : "Password set");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-8">
      {/* Name + Email */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <ClientIcon icon="ph:user-circle-fill" className={`${accentClass} w-5 h-5`} />
          Account Details
        </h2>
        <form onSubmit={handleSaveName} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
              minLength={2}
            />
            {nameError && <p className="text-xs font-medium text-red-500">{nameError}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              Email Address
              <span className="text-[10px] font-normal text-slate-400 normal-case">(can't be changed)</span>
            </label>
            <input type="email" value={email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isSavingName || name.trim() === initialName.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ClientIcon icon="ph:floppy-disk" className="w-4 h-4" />
              {isSavingName ? "Saving..." : "Save Name"}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <ClientIcon icon="ph:lock-key-fill" className="text-slate-500 w-5 h-5" />
          Password
        </h2>

        {!showPasswordForm ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                <ClientIcon icon="ph:password" className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">
                  {hasPassword ? "Change Password" : "Set a Password"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {hasPassword
                    ? "We recommend updating your password regularly"
                    : "You signed up with Google — set a password to also sign in with email"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors w-full sm:w-auto cursor-pointer"
            >
              {hasPassword ? "Update Password" : "Set Password"}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleChangePassword}
            className="flex flex-col gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20"
          >
            {hasPassword && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClass}
                  required
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs font-medium text-red-500">{passwordErrors.currentPassword}</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  required
                  minLength={6}
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs font-medium text-red-500">{passwordErrors.newPassword}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                  minLength={6}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs font-medium text-red-500">{passwordErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-60 text-white dark:text-slate-900 text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {isSavingPassword ? "Saving..." : hasPassword ? "Update Password" : "Set Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordErrors({});
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="px-5 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
