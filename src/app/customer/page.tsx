import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import Link from "next/link";

export default function CustomerDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
            Welcome back, Customer!
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">Here's an overview of your account.</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="group bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
              <ClientIcon icon="ph:shopping-cart-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Orders</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">2</h3>
            </div>
          </div>
        </div>
        
        <div className="group bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <ClientIcon icon="ph:receipt-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Unpaid Bills</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">$145.00</h3>
            </div>
          </div>
        </div>

        <div className="group bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <ClientIcon icon="ph:gift-fill" className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Reward Points</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">450</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/customer/orders" className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:shadow-lg transition-all text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-3 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full group-hover:-translate-y-1 transition-transform">
              <ClientIcon icon="ph:calendar-plus-fill" className="w-7 h-7" />
            </div>
            <span className="relative text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">New Order</span>
          </Link>
          
          <Link href="/customer/bills" className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900 hover:shadow-lg transition-all text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full group-hover:-translate-y-1 transition-transform">
              <ClientIcon icon="ph:receipt-fill" className="w-7 h-7" />
            </div>
            <span className="relative text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Pay Bill</span>
          </Link>
          
          <Link href="/customer/referrals" className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900 hover:shadow-lg transition-all text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-3 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full group-hover:-translate-y-1 transition-transform">
              <ClientIcon icon="ph:users-fill" className="w-7 h-7" />
            </div>
            <span className="relative text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Refer Friend</span>
          </Link>
          
          <Link href="/customer/reviews" className="group relative overflow-hidden flex flex-col items-center justify-center gap-3 p-5 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-900 hover:shadow-lg transition-all text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-3 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full group-hover:-translate-y-1 transition-transform">
              <ClientIcon icon="ph:star-fill" className="w-7 h-7" />
            </div>
            <span className="relative text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Leave Review</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
