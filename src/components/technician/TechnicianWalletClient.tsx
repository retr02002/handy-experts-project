"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { createTechnicianWalletTopupOrderAction, verifyTechnicianWalletTopupAction, type TechnicianWalletSummary } from "@/actions/technicianWallet.actions";
import { openRazorpayCheckout, type RazorpaySuccessResponse } from "@/lib/loadRazorpayCheckout";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

const TRANSACTION_LABELS: Record<string, string> = {
  DEPOSIT: "Added money",
  DEBIT: "Accepted a call",
  REFUND: "Refund / Deduction",
};

function leadPriceLabel(type: string, value: number): string {
  return type === "PERCENTAGE" ? `${value}% of order value` : `₹${value} flat`;
}

export function TechnicianWalletClient({ initialWallet }: { initialWallet: TechnicianWalletSummary }) {
  const [wallet, setWallet] = useState(initialWallet);
  const [amount, setAmount] = useState<number | "">(500);
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const chosenAmount = customAmount.trim() ? Number(customAmount) : amount;

  const addMoney = async () => {
    if (!chosenAmount || chosenAmount < 100) {
      toast.error("Minimum top-up is ₹100");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await createTechnicianWalletTopupOrderAction(chosenAmount);
      if (!res.success || !res.data) {
        toast.error((res.success ? undefined : res.error) || "Couldn't start the top-up. Please try again.");
        setIsProcessing(false);
        return;
      }
      const { razorpayOrderId, amountPaise, currency, keyId } = res.data;

      await openRazorpayCheckout({
        key: keyId,
        amount: amountPaise,
        currency,
        order_id: razorpayOrderId,
        name: "Handyzo",
        description: "Wallet top-up",
        theme: { color: "#00B4FF" },
        handler: async (response: RazorpaySuccessResponse) => {
          const verifyRes = await verifyTechnicianWalletTopupAction({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (!verifyRes.success) {
            toast.error(verifyRes.error || "We couldn't confirm your payment. Please contact support.");
            setIsProcessing(false);
            return;
          }
          toast.success("Wallet topped up");
          setWallet((prev) => ({
            ...prev,
            balance: verifyRes.data?.balance ?? prev.balance,
            transactions: [
              {
                id: `local-${Date.now()}`,
                type: "DEPOSIT",
                status: "COMPLETED",
                amount: chosenAmount,
                liveCallId: null,
                adminName: null,
                adminNote: null,
                createdAt: new Date().toISOString(),
              },
              ...prev.transactions,
            ],
          }));
          setIsProcessing(false);
        },
        modal: { ondismiss: () => setIsProcessing(false) },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't open the payment gateway. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add money to accept live calls. Deposit only — funds can&apos;t be withdrawn.
        </p>
      </div>

      {/* Balance hero */}
      <div className="bg-gradient-to-br from-[#00B4FF] to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center justify-between mb-3">
          <span className="text-blue-100 font-medium text-sm">Wallet Balance</span>
          <ClientIcon icon="ph:wallet-fill" className="w-6 h-6 text-blue-100" />
        </div>
        <h2 className="relative z-10 text-4xl font-black">₹{wallet.balance.toFixed(0)}</h2>
        <p className="relative z-10 text-xs text-blue-100 mt-2">
          Your calls cost {leadPriceLabel(wallet.leadFeeType, wallet.leadFeeAmount)}
        </p>
      </div>

      {/* Add money */}
      <div className="bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 p-5 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Money</h3>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAmount(a);
                setCustomAmount("");
              }}
              className={`h-11 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                amount === a && !customAmount
                  ? "border-[#00B4FF] bg-[#00B4FF]/5 text-[#00B4FF]"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              ₹{a}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={100}
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Or enter a custom amount"
          className="w-full h-11 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40"
        />
        <button
          type="button"
          onClick={addMoney}
          disabled={isProcessing || !chosenAmount || chosenAmount < 100}
          className="h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          {isProcessing ? "Processing..." : `Add ₹${chosenAmount || 0}`}
          <ClientIcon icon="ph:lock-key-fill" className="w-4 h-4" />
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-[#0B1221] rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transactions</h3>
        </div>
        {wallet.transactions.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No transactions yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
            {wallet.transactions.map((t) => {
              const isCredit = t.type === "DEPOSIT";
              return (
                <div key={t.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500"
                          : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-500"
                      }`}
                    >
                      <ClientIcon icon={isCredit ? "ph:arrow-down-left" : "ph:arrow-up-right"} className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {t.adminName ? `Added by ${t.adminName}` : TRANSACTION_LABELS[t.type] ?? t.type}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {formatDateTime(t.createdAt)}
                        {t.adminNote && <> &middot; {t.adminNote}</>}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${isCredit ? "text-emerald-600 dark:text-emerald-500" : "text-rose-600 dark:text-rose-500"}`}>
                    {isCredit ? "+" : "-"}₹{t.amount.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
