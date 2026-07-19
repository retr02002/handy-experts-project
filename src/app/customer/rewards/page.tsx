import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { mockCustomerRewards } from "@/lib/mockData";

export default function CustomerRewardsPage() {
  const progressPercentage = (mockCustomerRewards.points / mockCustomerRewards.nextTierPoints) * 100;

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rewards & Loyalty</h1>
      </div>
      
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ClientIcon icon="ph:crown-simple-fill" className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm mb-4">
              <ClientIcon icon="ph:star-fill" className="w-4 h-4 text-amber-200" />
              <span className="text-sm font-medium">{mockCustomerRewards.tier} Member</span>
            </div>
            <p className="text-slate-100 font-medium mb-1">Available Points</p>
            <h2 className="text-4xl md:text-5xl font-bold">{mockCustomerRewards.points.toLocaleString()}</h2>
          </div>
          
          <div className="w-full md:w-1/2 bg-black/20 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>{mockCustomerRewards.points} pts</span>
              <span>{mockCustomerRewards.nextTierPoints} pts for Platinum</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Available Rewards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {mockCustomerRewards.availableRewards.map(reward => (
          <div key={reward.id} className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center shrink-0">
                <ClientIcon icon="ph:gift" className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{reward.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{reward.cost} pts</p>
              </div>
            </div>
            <button 
              disabled={mockCustomerRewards.points < reward.cost}
              className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all
                ${mockCustomerRewards.points >= reward.cost 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
