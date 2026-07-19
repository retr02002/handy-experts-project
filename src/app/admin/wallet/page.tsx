import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function AdminWalletPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Wallet & Revenue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Overview of platform financials, payouts, and incoming payments.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <ClientIcon icon="ph:download-simple" className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: "₹125,000", icon: "ph:chart-line-up", trend: "+12.5%", positive: true },
          { label: "Platform Fees", value: "₹18,750", icon: "ph:money", trend: "+8.2%", positive: true },
          { label: "Pending Payouts", value: "₹4,200", icon: "ph:clock", trend: "-2.1%", positive: false },
          { label: "Active Vendors", value: "142", icon: "ph:buildings", trend: "+5", positive: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                <ClientIcon icon={stat.icon} className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.positive ? "text-emerald-500" : "text-rose-500"}`}>
                {stat.trend}
              </span>
              <span className="text-slate-400 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <div className="text-center">
             <ClientIcon icon="ph:chart-bar" className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
             <p className="text-slate-500 dark:text-slate-400 font-medium">Revenue Chart Area</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Transactions</h2>
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 flex-1">
            {[
              { vendor: "FixIt Plumbing", amount: "-₹1,250.00", date: "Today, 10:30 AM", type: "Payout", status: "Completed" },
              { vendor: "ElectroTech", amount: "-₹850.00", date: "Yesterday", type: "Payout", status: "Completed" },
              { vendor: "Customer Payment", amount: "+₹320.00", date: "Yesterday", type: "Deposit", status: "Completed" },
              { vendor: "CoolBreeze HVAC", amount: "-₹420.00", date: "Nov 22", type: "Payout", status: "Pending" },
            ].map((txn, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${txn.type === 'Deposit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                    <ClientIcon icon={txn.type === 'Deposit' ? "ph:arrow-down-left" : "ph:arrow-up-right"} className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{txn.vendor}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{txn.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${txn.type === 'Deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                    {txn.amount}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{txn.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
