"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth.actions";
import { OnboardingField } from "./OnboardingField";
import { ClientIcon } from "@/components/ui/ClientIcon";

// Vendor-only — technician credentials live in TechnicianCredentialsStep,
// which additionally handles username signup and OTP login.
type Role = "VENDOR";
type Mode = "signup" | "login";

const ROLE_COPY: Record<Role, { noun: string; icon: string }> = {
  VENDOR: { noun: "company", icon: "ph:buildings-fill" },
};

interface Props {
  role: Role;
  onBack?: () => void;
  onAuthenticated: () => Promise<unknown>;
}

export function RoleCredentialsStep({ role, onBack, onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { noun, icon } = ROLE_COPY[role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const res = await registerUser({ email, password });
        if (!res.success) {
          setError(res.error || "Something went wrong during registration.");
          return;
        }
      }

      const signInRes = await signIn("credentials", { redirect: false, identifier: email, password });
      if (signInRes?.error) {
        setError(mode === "signup" ? "Account created but auto sign-in failed — try logging in." : "Invalid email or password");
        return;
      }

      await onAuthenticated();
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md mb-3">
            <ClientIcon icon={icon} className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
            {mode === "signup" ? `Create your ${noun} account` : `Log in to your ${noun} account`}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            {mode === "signup"
              ? `We'll ask for a few more ${noun} details next.`
              : "Welcome back — enter your credentials to continue."}
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 mb-5">
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 h-10 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
              mode === "signup"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 h-10 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
              mode === "login"
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Log in
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <OnboardingField
            label="Email"
            icon="ph:envelope-simple"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <OnboardingField
            label="Password"
            icon="ph:lock"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={mode === "signup" ? 6 : undefined}
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-5 sm:px-8 lg:px-9 py-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-4 bg-white dark:bg-[#0A101D]">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          {isSubmitting ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </div>
    </form>
  );
}
