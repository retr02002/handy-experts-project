import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function VendorWalletPage() {
  const transactions = [
    { id: "TXN-001", type: "credit", amount: 150.00, date: "2023-11-20T10:30:00Z", description: "Payment for Service Call SRV-1002" },
    { id: "TXN-002", type: "withdrawal", amount: -500.00, date: "2023-11-18T14:15:00Z", description: "Bank Transfer Withdrawal" },
    { id: "TXN-003", type: "credit", amount: 210.00, date: "2023-11-15T09:45:00Z", description: "Payment for Service Call SRV-1009" },
    { id: "TXN-004", type: "credit", amount: 85.50, date: "2023-11-12T16:20:00Z", description: "Payment for Service Call SRV-1011" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your earnings, payouts, and transaction history.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-blue-500/20">
          <ClientIcon icon="ph:bank" className="w-4 h-4" />
          Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/20 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <span className="text-blue-100 font-medium">Available Balance</span>
            <ClientIcon icon="ph:wallet" className="w-6 h-6 text-blue-200" />
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold">₹1,245.50</h2>
            <p className="text-sm text-blue-200 mt-2 flex items-center gap-1">
              <ClientIcon icon="ph:arrow-up-right" className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-medium">+12.5%</span> from last month
            </p>
          </div>
        </div>

        {/* Pending Payouts Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Pending Payouts</span>
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:clock-counter-clockwise" className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₹320.00</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Clearing in 2-3 business days</p>
          </div>
        </div>

        {/* Total Earnings Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total Earnings</span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <ClientIcon icon="ph:chart-line-up" className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">₹14,850.00</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Lifetime revenue</p>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col mt-2">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors">
            View All
          </button>
        </div>
        <div className="flex flex-col">
          {transactions.map((txn, index) => (
            <div 
              key={txn.id} 
              className={`p-6 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                index !== transactions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800/50' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  txn.type === 'credit' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  <ClientIcon 
                    icon={txn.type === 'credit' ? 'ph:arrow-down-left' : 'ph:arrow-up-right'} 
                    className="w-6 h-6" 
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{txn.description}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{new Date(txn.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{txn.id}</span>
                  </div>
                </div>
              </div>
              <div className={`text-right font-bold ${
                txn.type === 'credit' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-900 dark:text-white'
              }`}>
                {txn.type === 'credit' ? '+' : ''}₹{Math.abs(txn.amount).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
