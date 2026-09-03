"use client";

import React, { useEffect, useState } from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

interface Props {
  code: string;
  onChangeCode: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  cooldownSeconds: number;
  isSubmitting: boolean;
  isResending?: boolean;
  error?: string;
  destinationLabel: string;
  backLabel: string;
  onBack: () => void;
}

export function OtpCodeInput({
  code,
  onChangeCode,
  onSubmit,
  onResend,
  cooldownSeconds,
  isSubmitting,
  isResending,
  error,
  destinationLabel,
  backLabel,
  onBack,
}: Props) {
  const [remaining, setRemaining] = useState(cooldownSeconds);

  useEffect(() => {
    setRemaining(cooldownSeconds);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(timer);
  }, [remaining]);

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-center gap-5">
      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium text-center leading-relaxed px-2">
        {destinationLabel}
      </p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-0.5">6-digit code</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => onChangeCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full h-14 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 text-center text-xl tracking-[0.5em] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40 focus:border-[#00B4FF] transition-all"
          required
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || code.length !== 6}
        className="w-full h-12 bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-70 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
      >
        {isSubmitting ? "Verifying..." : "Verify & continue"}
      </button>

      <div className="flex items-center justify-between text-[13px] pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 py-2 font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ClientIcon icon="ph:arrow-left-bold" className="w-3.5 h-3.5" /> {backLabel}
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={remaining > 0 || isResending}
          className="py-2 font-bold text-[#00B4FF] hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
        >
          {remaining > 0 ? `Resend in ${remaining}s` : isResending ? "Sending..." : "Resend code"}
        </button>
      </div>
    </form>
  );
}
