"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { adminRechargeVendorWalletAction, setVendorLeadPricingAction, type WalletSummary } from "@/actions/wallet.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Wallet top-up",
  DEBIT: "Bought a call",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function VendorWalletTab({
  vendorId,
  companyName,
  wallet,
  onChanged,
}: {
  vendorId: string;
  companyName: string;
  wallet: WalletSummary;
  onChanged: () => void;
}) {
  const [balance, setBalance] = useState(wallet.balance);
  const [transactions, setTransactions] = useState(wallet.transactions);
  const [pricingType, setPricingType] = useState<"FLAT" | "PERCENTAGE">(wallet.leadPricingType === "PERCENTAGE" ? "PERCENTAGE" : "FLAT");
  const [pricingValue, setPricingValue] = useState(String(wallet.leadPricingValue));
  const [isSavingPricing, setIsSavingPricing] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeNote, setRechargeNote] = useState("");
  const [isRecharging, setIsRecharging] = useState(false);

  const handleRecharge = async () => {
    const amount = Number(rechargeAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setIsRecharging(true);
    try {
      const res = await adminRechargeVendorWalletAction(vendorId, amount, rechargeNote);
      if (!res.success) {
        toast.error(res.error || "Failed to recharge wallet");
        return;
      }
      toast.success(`₹${amount} added to ${companyName}'s wallet`);
      setBalance(res.data?.balance ?? balance + amount);
      setTransactions((prev) => [
        { id: `optimistic-${Date.now()}`, type: "DEPOSIT", status: "COMPLETED", amount, liveCallId: null, adminName: null, adminNote: rechargeNote || null, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setRechargeAmount("");
      setRechargeNote("");
      onChanged();
    } finally {
      setIsRecharging(false);
    }
  };

  const handleSavePricing = async () => {
    const value = Number(pricingValue);
    if (!Number.isFinite(value) || value < 0 || (pricingType === "PERCENTAGE" && value > 100)) {
      toast.error(pricingType === "PERCENTAGE" ? "Enter a percentage between 0 and 100" : "Enter a valid amount");
      return;
    }
    setIsSavingPricing(true);
    try {
      const res = await setVendorLeadPricingAction(vendorId, pricingType, value);
      if (!res.success) {
        toast.error(res.error || "Failed to update pricing");
        return;
      }
      toast.success("Call pricing updated");
      onChanged();
    } finally {
      setIsSavingPricing(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 w-full items-start">
      <div className="flex flex-col gap-4 min-w-0">
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Wallet Balance</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">₹{balance.toFixed(0)}</p>
          </div>
          <ClientIcon icon="ph:wallet-fill" className="w-8 h-8 text-slate-200 dark:text-slate-700" />
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col gap-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Call Pricing</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setPricingType("FLAT")}
                className={`px-3 h-10 text-xs font-bold cursor-pointer ${pricingType === "FLAT" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                Flat ₹
              </button>
              <button
                type="button"
                onClick={() => setPricingType("PERCENTAGE")}
                className={`px-3 h-10 text-xs font-bold cursor-pointer ${pricingType === "PERCENTAGE" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                %
              </button>
            </div>
            <input
              type="number"
              min={0}
              max={pricingType === "PERCENTAGE" ? 100 : undefined}
              value={pricingValue}
              onChange={(e) => setPricingValue(e.target.value)}
              className="flex-1 min-w-[80px] h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="button"
              onClick={handleSavePricing}
              disabled={isSavingPricing}
              className="h-10 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold disabled:opacity-60 cursor-pointer shrink-0"
            >
              {isSavingPricing ? "..." : "Save"}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            What this vendor pays to buy one live call — a flat rupee amount, or a % of that order&apos;s total.
          </p>
        </div>

        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recharge Wallet Manually</p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="number"
              min={1}
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              placeholder="Amount ₹"
              className="sm:w-28 h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 shrink-0"
            />
            <input
              value={rechargeNote}
              onChange={(e) => setRechargeNote(e.target.value)}
              placeholder="Note (optional) — e.g. cash received at office"
              className="flex-1 min-w-0 h-10 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <button
              type="button"
              onClick={handleRecharge}
              disabled={isRecharging || !rechargeAmount}
              className="h-10 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-60 cursor-pointer shrink-0"
            >
              {isRecharging ? "..." : "Add"}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Adds money to this vendor&apos;s wallet directly — no Razorpay involved.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-w-0">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Transactions</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[420px] overflow-y-auto custom-scrollbar">
            {transactions.map((t) => (
              <div key={t.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {t.adminName ? `Added by ${t.adminName}` : TYPE_LABELS[t.type] ?? t.type}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {formatDateTime(t.createdAt)}
                    {t.adminNote && ` · ${t.adminNote}`}
                  </p>
                </div>
                <p className={`text-sm font-bold shrink-0 ${t.type === "DEBIT" ? "text-red-500" : "text-emerald-600"}`}>
                  {t.type === "DEBIT" ? "−" : "+"}₹{t.amount.toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
