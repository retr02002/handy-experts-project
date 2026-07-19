import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { mockCustomerOrders } from "@/lib/mockData";

export default function CustomerOrdersPage() {
  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Orders</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
          <ClientIcon icon="ph:plus" className="w-4 h-4" />
          Book New Service
        </button>
      </div>
      
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mockCustomerOrders.map((order) => (
            <div key={order.id} className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0">
                    <ClientIcon icon="ph:wrench" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{order.service}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Order #{order.id} • {order.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full">
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">₹{order.amount.toFixed(2)}</div>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        order.status === 'scheduled' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <ClientIcon icon="ph:caret-right" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {order.technician && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                    {order.technician.charAt(0)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Assigned to <span className="font-medium text-slate-900 dark:text-white">{order.technician}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
