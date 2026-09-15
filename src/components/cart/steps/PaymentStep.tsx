"use client";

import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { PAYMENT_METHOD_OPTIONS, type PaymentDetails, type PaymentMethod } from "../checkoutTypes";

interface Props {
  payment: PaymentDetails;
  onChange: (payment: PaymentDetails) => void;
  /** Order total before any wallet balance is applied. */
  orderTotal: number;
  /** What's actually due after the wallet toggle below. */
  amountDue: number;
  walletBalance: number;
  useWallet: boolean;
  onToggleWallet: (value: boolean) => void;
}

export function PaymentStep({ payment, onChange, orderTotal, amountDue, walletBalance, useWallet, onToggleWallet }: Props) {
  const walletApplied = orderTotal - amountDue;

  return (
    <div className="bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 sm:p-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">How would you like to pay?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Amount due: <span className="font-bold text-slate-900 dark:text-white">₹{amountDue}</span>
          {walletApplied > 0 && <span className="text-emerald-600 dark:text-emerald-400"> (₹{walletApplied} from wallet)</span>}
        </p>
      </div>

      {walletBalance > 0 && (
        <button
          type="button"
          onClick={() => onToggleWallet(!useWallet)}
          className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all cursor-pointer ${
            useWallet
              ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
              : "border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
          }`}
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              useWallet ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            }`}
          >
            <ClientIcon icon="ph:wallet-fill" className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Use wallet balance</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">₹{walletBalance} available &middot; optional</p>
          </div>
          <div
            className={`w-11 h-6 rounded-full shrink-0 relative transition-colors ${useWallet ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${useWallet ? "translate-x-[22px]" : "translate-x-0.5"}`}
            />
          </div>
        </button>
      )}

      {amountDue > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {PAYMENT_METHOD_OPTIONS.map((opt) => {
              const selected = payment.method === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ method: opt.value as PaymentMethod })}
                  className={`w-full text-left rounded-2xl border-2 p-4 flex items-center gap-4 transition-all cursor-pointer ${
                    selected
                      ? "border-[#00B4FF] bg-[#00B4FF]/5 dark:bg-[#00B4FF]/10"
                      : "border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                      selected ? "bg-[#00B4FF] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <ClientIcon icon={opt.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{opt.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selected ? "border-[#00B4FF] bg-[#00B4FF]" : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selected && <ClientIcon icon="ph:check-bold" className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 justify-center">
            <ClientIcon icon="ph:lock-key-fill" className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Payments are processed securely via Razorpay</span>
          </div>
        </>
      )}

      {amountDue === 0 && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/30">
          <ClientIcon icon="ph:check-circle-fill" className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Fully covered by your wallet balance — nothing more to pay.
          </p>
        </div>
      )}
    </div>
  );
}
