import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function CustomerReferralsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Referrals</h1>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClientIcon icon="ph:users" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Refer a Friend, Get Rewarded</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Share your unique referral link with friends. When they sign up and complete their first order, you both get 100 reward points!</p>
        
        <div className="flex items-center bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-w-md mx-auto">
          <input type="text" value="https://handyexperts.com/ref/CU8492" readOnly className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-600 dark:text-slate-300 outline-none" />
          <button className="bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition-colors">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
