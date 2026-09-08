"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { updateProfileName, updateProfileEmail, changePassword } from "@/actions/profile.actions";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string | null;
    email: string | null;
    phone?: string | null;
    hasPassword: boolean;
    hasGoogleAccount: boolean;
  };
}

const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/30 focus:border-[#00B4FF] transition-all";

export function EditProfileModal({ isOpen, onClose, profile }: EditProfileModalProps) {
  const { update } = useSession();
  const [activeTab, setActiveTab] = useState<"general" | "password">("general");

  const [name, setName] = useState(profile.name || "");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  const [email, setEmail] = useState(profile.email || "");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState("");
  const emailIsEditable = !profile.hasGoogleAccount;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Reset state when opened or profile changes
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevProfile, setPrevProfile] = useState(profile);

  if (isOpen !== prevIsOpen || profile !== prevProfile) {
    setPrevIsOpen(isOpen);
    setPrevProfile(profile);
    if (isOpen) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setActiveTab("general");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordErrors({});
    }
  }

  const handleSaveName = async () => {
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
      toast.success("Name updated successfully!");
      onClose();
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveEmail = async () => {
    setEmailError("");
    setIsSavingEmail(true);
    try {
      const res = await updateProfileEmail({ email });
      if (!res.success) {
        setEmailError(res.errors?.email?.[0] || res.error || "Failed to update email");
        toast.error(res.error || "Failed to update email");
        return;
      }
      toast.success("Email updated successfully!");
    } finally {
      setIsSavingEmail(false);
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
        currentPassword: profile.hasPassword ? currentPassword : undefined,
        newPassword,
      });
      if (!res.success) {
        if (res.errors) {
          setPasswordErrors(Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, v?.[0] ?? ""])));
        }
        toast.error(res.error || "Failed to change password");
        return;
      }
      toast.success(profile.hasPassword ? "Password updated" : "Password set");
      onClose();
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:right-auto md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 z-[101] w-full md:w-[480px] bg-white dark:bg-[#0B1120] rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ClientIcon icon="ph:x-bold" className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors border-b-2 ${
                  activeTab === "general"
                    ? "border-[#00B4FF] text-[#00B4FF]"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                General Info
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors border-b-2 ${
                  activeTab === "password"
                    ? "border-[#00B4FF] text-[#00B4FF]"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Password
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {activeTab === "general" ? (
                <div className="p-4 space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={inputClass}
                        />
                        {nameError && <p className="text-[10px] font-medium text-red-500 mt-1">{nameError}</p>}
                      </div>
                      <button
                        onClick={handleSaveName}
                        disabled={isSavingName || name.trim() === (profile.name || "").trim()}
                        className="px-3 py-2 bg-[#00B4FF] hover:bg-[#0096d6] disabled:opacity-50 text-white rounded-xl font-semibold text-[11px] transition-colors flex items-center justify-center min-w-[60px]"
                      >
                        {isSavingName ? <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 animate-spin" /> : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      Email Address
                      {!emailIsEditable && <span className="text-[9px] font-normal text-slate-400 normal-case">(Managed by Google)</span>}
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!emailIsEditable}
                          className={`${inputClass} ${!emailIsEditable ? "opacity-60 cursor-not-allowed" : ""}`}
                        />
                        {emailError && <p className="text-[10px] font-medium text-red-500 mt-1">{emailError}</p>}
                      </div>
                      {emailIsEditable && (
                        <button
                          onClick={handleSaveEmail}
                          disabled={isSavingEmail || email.trim() === (profile.email || "").trim()}
                          className="px-3 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 text-white dark:text-slate-900 rounded-xl font-semibold text-[11px] transition-colors flex items-center justify-center min-w-[60px]"
                        >
                          {isSavingEmail ? <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 animate-spin" /> : "Save"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Phone Input (Readonly for now) */}
                  {profile.phone && (
                    <div className="space-y-1.5 opacity-70">
                      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Phone Number (Verified)</label>
                      <input
                        type="text"
                        value={profile.phone}
                        disabled
                        className={`${inputClass} cursor-not-allowed`}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="p-4 space-y-4">
                  {profile.hasPassword && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={inputClass}
                        required
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-[10px] font-medium text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputClass}
                      required
                      minLength={6}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-[10px] font-medium text-red-500 mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputClass}
                      required
                      minLength={6}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-[10px] font-medium text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="w-full mt-2 py-2.5 bg-[#00B4FF] hover:bg-[#0096d6] disabled:opacity-60 text-white font-bold text-[11px] rounded-xl transition-all shadow-[0_4px_14px_rgba(0,180,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,180,255,0.23)] flex items-center justify-center gap-2"
                  >
                    {isSavingPassword ? (
                      <ClientIcon icon="ph:spinner-gap-bold" className="w-4 h-4 animate-spin" />
                    ) : (
                      <ClientIcon icon="ph:lock-key-fill" className="w-4 h-4" />
                    )}
                    {isSavingPassword ? "Saving..." : profile.hasPassword ? "Update Password" : "Set Password"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
