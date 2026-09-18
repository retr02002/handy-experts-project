"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { adminResetTechnicianPasswordAction } from "@/actions/technician.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

export function AdminPasswordReset({ technicianId }: { technicianId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await adminResetTechnicianPasswordAction(technicianId, newPassword);
      if (!res.success) {
        toast.error(res.error || "Failed to reset password");
        return;
      }
      toast.success("Password reset successfully");
      setNewPassword("");
      setIsOpen(false);
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let p = "";
    for (let i = 0; i < 12; i++) {
      p += chars[Math.floor(Math.random() * chars.length)];
    }
    setNewPassword(p);
  };

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClientIcon icon="ph:key-bold" className="w-4 h-4 text-rose-500" />
            Password Management
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Passwords are encrypted and cannot be viewed. You can reset it here if needed.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {isOpen ? "Cancel" : "Reset Password"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full h-10 pl-3 pr-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleGenerate}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00B4FF] bg-[#00B4FF]/10 px-2 py-1 rounded-md hover:bg-[#00B4FF]/20 transition-colors cursor-pointer"
            >
              Generate
            </button>
          </div>
          <button
            onClick={handleReset}
            disabled={isSaving || newPassword.length < 6}
            className="h-10 w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            {isSaving ? "Saving..." : "Save New Password"}
          </button>
        </div>
      )}
    </div>
  );
}
