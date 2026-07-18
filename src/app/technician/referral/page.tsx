import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function TechnicianReferralPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Referral Code</h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">Invite others and earn rewards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-sm flex flex-col justify-center items-center gap-3 md:gap-4 text-center">
          <ClientIcon icon="ph:gift" className="w-12 h-12 md:w-16 md:h-16 text-amber-200" />
          <h2 className="text-xl md:text-2xl font-bold">Earn $50 per referral!</h2>
          <p className="text-amber-100 text-xs md:text-sm max-w-sm">
            Share your unique referral code with other technicians. Once they complete their first service call, you both get a $50 bonus!
          </p>
          
          <div className="mt-2 md:mt-4 flex items-center bg-black/20 p-1.5 md:p-2 rounded-xl border border-white/20 w-full max-w-xs justify-between backdrop-blur-md">
            <span className="font-mono font-bold text-lg md:text-xl tracking-wider pl-3 md:pl-4">TECH-WIN50</span>
            <button className="p-1.5 md:p-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
              <ClientIcon icon="ph:copy" className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        <div className="w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white mb-3 md:mb-4">Your Referrals</h2>
          <div className="flex items-center justify-center py-8 md:py-12 text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <ClientIcon icon="ph:users" className="w-10 h-10 md:w-12 md:h-12 text-slate-300 dark:text-slate-700" />
              <p className="text-sm">No referrals yet. Start sharing!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
