import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function CustomerRewardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rewards</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClientIcon icon="ph:gift" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">450 Reward Points</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Earn more points by referring friends or completing orders to unlock discounts.</p>
        <button className="bg-amber-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
          Redeem Points
        </button>
      </div>
    </div>
  );
}
