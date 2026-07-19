import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { mockCustomerOrders } from "@/lib/mockData";
import Link from "next/link";

export default function CustomerDashboardPage() {
  const activeOrders = mockCustomerOrders.filter(o => o.status !== "completed");
  const recentOrders = mockCustomerOrders.filter(o => o.status === "completed").slice(0, 3);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ClientIcon icon="ph:house-fill" className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, Alice!</h1>
          <p className="text-blue-100 mt-2 max-w-md">Your home maintenance is in good hands. Book a new service or manage your existing appointments.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="bg-white text-blue-700 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
              Book New Service
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Services</h2>
              <Link href="/customer/orders" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {activeOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  You have no active service requests.
                </div>
              ) : (
                activeOrders.map(order => (
                  <div key={order.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <ClientIcon icon="ph:wrench" className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{order.service}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{order.date}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 capitalize">
                      {order.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Links & Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Links</h2>
            <div className="space-y-3">
              <Link href="/customer/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <ClientIcon icon="ph:clock-counter-clockwise" className="w-5 h-5 text-slate-400" />
                  Order History
                </div>
                <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
              </Link>
              <Link href="/customer/bills" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <ClientIcon icon="ph:receipt" className="w-5 h-5 text-slate-400" />
                  Invoices & Bills
                </div>
                <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
              </Link>
              <Link href="/customer/rewards" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <ClientIcon icon="ph:gift" className="w-5 h-5 text-slate-400" />
                  My Rewards
                </div>
                <ClientIcon icon="ph:caret-right" className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
