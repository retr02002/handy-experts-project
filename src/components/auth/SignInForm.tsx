"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { getUserRole } from "@/actions/auth.actions";
import { sendCustomerOtp } from "@/actions/otp.actions";
import { OtpCodeInput } from "./OtpCodeInput";

// Hardcoded rather than env-gated — see src/lib/apitxt.ts for why.
const WHATSAPP_ENABLED = true;

type Step = "start" | "code";
type Channel = "SMS" | "WHATSAPP";

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<Channel>("SMS");
  const [code, setCode] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(45);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const routeAfterSignIn = async () => {
    const userRole = await getUserRole();
    const targetPath = userRole === "PENDING" ? "/onboarding"
      : userRole === "TECHNICIAN" ? "/technician"
        : userRole === "VENDOR" ? "/vendor"
          : userRole === "SUPER_ADMIN" ? "/admin"
            : "/customer";
    router.push(targetPath);
  };

  const requestCode = async () => {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    setIsSending(true);
    try {
      const res = await sendCustomerOtp({ phone, channel });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setCooldownSeconds(res.data?.cooldownSeconds ?? 45);
      setCode("");
      setStep("code");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);
    try {
      const res = await signIn("otp-customer", { redirect: false, phone, code });
      if (res?.error) {
        setError(res.error);
        return;
      }
      await routeAfterSignIn();
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Sign in</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">Continue to your Handyzo account</p>
      </div>

      {step === "start" && (
        <>
          <button
            onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            type="button"
            className="w-full h-12 flex items-center justify-center gap-2 bg-transparent border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 text-[14px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-[0.98] transition-all mb-5 shadow-sm cursor-pointer"
          >
            <ClientIcon icon="logos:google-icon" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center mb-4">
              {error}
            </div>
          )}

          {WHATSAPP_ENABLED && (
            <div className="flex bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 mb-4">
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

          <div className="space-y-1.5 mb-5">
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5">Phone number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <ClientIcon icon="ph:phone" className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full h-12 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 text-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-all"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={isSending}
            onClick={requestCode}
            className={`w-full h-12 disabled:opacity-70 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm cursor-pointer ${
              channel === "WHATSAPP" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-[#00B4FF] hover:bg-[#0096fa]"
            }`}
          >
            <ClientIcon icon={channel === "WHATSAPP" ? "ph:whatsapp-logo-fill" : "ph:chat-circle-text-fill"} className="w-4 h-4" />
            {isSending ? "Sending..." : `Send code via ${channel === "WHATSAPP" ? "WhatsApp" : "SMS"}`}
          </button>
        </>
      )}

      {step === "code" && (
        <OtpCodeInput
          code={code}
          onChangeCode={setCode}
          onSubmit={handleVerify}
          onResend={requestCode}
          cooldownSeconds={cooldownSeconds}
          isSubmitting={isVerifying}
          isResending={isSending}
          error={error}
          destinationLabel={`Code sent via ${channel === "WHATSAPP" ? "WhatsApp" : "SMS"} to ${phone}`}
          backLabel="Change number"
          onBack={() => {
            setStep("start");
            setError("");
            setCode("");
          }}
        />
      )}
    </div>
  );
}
