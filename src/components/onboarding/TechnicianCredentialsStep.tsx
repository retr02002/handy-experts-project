"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth.actions";
import { sendTechnicianOtp } from "@/actions/otp.actions";
import { OnboardingField } from "./OnboardingField";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import { ClientIcon } from "@/components/ui/ClientIcon";

// Hardcoded rather than env-gated — see src/lib/apitxt.ts for why.
const WHATSAPP_ENABLED = true;

type Mode = "signup" | "login" | "otp";
type OtpStep = "start" | "code";
type Channel = "SMS" | "WHATSAPP";

interface Props {
  onBack?: () => void;
  onAuthenticated: () => Promise<unknown>;
}

export function TechnicianCredentialsStep({ onBack, onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>("signup");
  const [otpStep, setOtpStep] = useState<OtpStep>("start");

  // signup/login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [identifier, setIdentifier] = useState("");

  // otp fields
  const [otpUsername, setOtpUsername] = useState("");
  const [channel, setChannel] = useState<Channel>("SMS");
  const [code, setCode] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(45);
  const [phoneHint, setPhoneHint] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setOtpStep("start");
    setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await registerUser({ email, password, username: signupUsername });
      if (!res.success) {
        setError(res.error || "Something went wrong during registration.");
        return;
      }
      const signInRes = await signIn("credentials", { redirect: false, identifier: email, password });
      if (signInRes?.error) {
        setError("Account created but auto sign-in failed — try logging in.");
        return;
      }
      await onAuthenticated();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const signInRes = await signIn("credentials", { redirect: false, identifier, password });
      if (signInRes?.error) {
        setError("Invalid credentials");
        return;
      }
      await onAuthenticated();
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestOtp = async () => {
    setError("");
    if (otpUsername.trim().length < 4) {
      setError("Enter your username");
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await sendTechnicianOtp({ username: otpUsername, channel });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setCooldownSeconds(res.data?.cooldownSeconds ?? 45);
      setPhoneHint(res.data?.phoneHint ?? "");
      setCode("");
      setOtpStep("code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await signIn("otp-technician", { redirect: false, username: otpUsername, code });
      if (res?.error) {
        setError(res.error);
        return;
      }
      await onAuthenticated();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
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
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md mb-3">
            <ClientIcon icon="ph:wrench-fill" className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
            {mode === "signup" ? "Create your technician account" : mode === "login" ? "Log in to your account" : "Log in with a code"}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
            {mode === "signup"
              ? "Choose a username — we'll ask for a few more details next."
              : mode === "login"
                ? "Use your email or username."
                : "We'll text a code to your registered number."}
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 mb-5">
          {(["signup", "login", "otp"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 h-10 rounded-lg text-[12px] font-bold transition-colors cursor-pointer ${
                mode === m
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {m === "signup" ? "Sign up" : m === "login" ? "Log in" : "OTP"}
            </button>
          ))}
        </div>

        {error && mode !== "otp" && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center mb-4">
            {error}
          </div>
        )}

        {mode === "signup" && (
          <form id="tech-form" onSubmit={handleSignup} className="flex flex-col gap-4">
            <OnboardingField
              label="Username"
              icon="ph:at"
              value={signupUsername}
              onChange={(e) => setSignupUsername(e.target.value.toLowerCase())}
              placeholder="letters, numbers, underscores"
              required
            />
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
              minLength={6}
            />
          </form>
        )}

        {mode === "login" && (
          <form id="tech-form" onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
            <OnboardingField
              label="Email or username"
              icon="ph:user"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com or username"
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
            />
          </form>
        )}

        {mode === "otp" && otpStep === "start" && (
          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            {WHATSAPP_ENABLED && (
              <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setChannel("SMS")}
                  className={`flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                    channel === "SMS"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <ClientIcon icon="ph:chat-circle-text-fill" className="w-4 h-4 shrink-0" />
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("WHATSAPP")}
                  className={`flex-1 h-10 flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                    channel === "WHATSAPP"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <ClientIcon icon="ph:whatsapp-logo-fill" className="w-4 h-4 shrink-0" />
                  WhatsApp
                </button>
              </div>
            )}
            <OnboardingField
              label="Username"
              icon="ph:at"
              value={otpUsername}
              onChange={(e) => setOtpUsername(e.target.value.toLowerCase())}
              placeholder="your username"
              required
            />
            <button
              type="button"
              disabled={isSendingOtp}
              onClick={requestOtp}
              className={`w-full h-12 disabled:opacity-70 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm cursor-pointer ${
                channel === "WHATSAPP" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#00B4FF] hover:bg-[#0096fa]"
              }`}
            >
              <ClientIcon icon={channel === "WHATSAPP" ? "ph:whatsapp-logo-fill" : "ph:chat-circle-text-fill"} className="w-4 h-4" />
              {isSendingOtp ? "Sending..." : `Send code via ${channel === "WHATSAPP" ? "WhatsApp" : "SMS"}`}
            </button>
          </div>
        )}

        {mode === "otp" && otpStep === "code" && (
          <OtpCodeInput
            code={code}
            onChangeCode={setCode}
            onSubmit={handleOtpVerify}
            onResend={requestOtp}
            cooldownSeconds={cooldownSeconds}
            isSubmitting={isSubmitting}
            isResending={isSendingOtp}
            error={error}
            destinationLabel={`Code sent via ${channel === "WHATSAPP" ? "WhatsApp" : "SMS"} to your registered number ${phoneHint}`}
            backLabel="Change username"
            onBack={() => {
              setOtpStep("start");
              setError("");
              setCode("");
            }}
          />
        )}
      </div>

      {(mode === "signup" || mode === "login") && (
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-5 sm:px-8 lg:px-9 py-4 pb-[max(env(safe-area-inset-bottom),16px)] sm:pb-4 bg-white dark:bg-[#0A101D]">
          <button
            type="submit"
            form="tech-form"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
          >
            {isSubmitting ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </div>
      )}
    </div>
  );
}
