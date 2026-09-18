"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import type { TechnicianWalletData } from "@/actions/technicianWallet.actions";
import { adminAddTechnicianFundsAction, adminDeductTechnicianFundsAction } from "@/actions/technicianWallet.actions";

export function AdminTechnicianWalletTab({ technicianId, wallet }: { technicianId: string; wallet?: TechnicianWalletData }) {
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const handleTransaction = async (type: "add" | "deduct") => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    setIsAdding(true);
    try {
      const action = type === "add" ? adminAddTechnicianFundsAction : adminDeductTechnicianFundsAction;
      const res = await action(technicianId, parsedAmount, note);
      if (res.success) {
        toast.success(`Funds ${type === "add" ? "added" : "deducted"} successfully`);
        setAmount("");
        setNote("");
      } else {
        toast.error(res.error || "Transaction failed");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  if (!wallet) {
    return (
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
        <ClientIcon icon="ph:wallet-bold" className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Wallet Data</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This technician does not have a wallet yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Balance & Actions Card */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
            <ClientIcon icon="ph:wallet-fill" className="w-7 h-7 text-[#00B4FF]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Balance</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">₹{wallet.balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="w-full md:w-[400px] flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (₹)"
              className="w-1/3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason / Note"
              className="w-2/3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleTransaction("add")}
              disabled={isAdding || !amount}
              className="flex-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              Add Funds
            </button>
            <button
              onClick={() => handleTransaction("deduct")}
              disabled={isAdding || !amount}
              className="flex-1 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold shadow-sm hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50 transition-all"
            >
              Deduct
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {wallet.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                wallet.transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.type === "DEPOSIT"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400"
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-bold whitespace-nowrap ${t.type === "DEPOSIT" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                      {t.type === "DEPOSIT" ? "+" : "-"}₹{t.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                            : t.status === "PENDING"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                      {t.liveCallId ? (
                        <span>Order #{t.liveCallId.slice(-6).toUpperCase()}</span>
                      ) : t.adminName ? (
                        <div className="flex flex-col">
                          <span>Admin: {t.adminName}</span>
                          {t.adminNote && <span className="text-[11px] opacity-75">{t.adminNote}</span>}
                        </div>
                      ) : (
                        <span>Razorpay Recharge</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
