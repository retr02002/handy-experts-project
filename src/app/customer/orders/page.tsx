import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function CustomerOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Orders</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
          <ClientIcon icon="ph:plus" className="w-4 h-4" />
          New Order
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClientIcon icon="ph:shopping-cart" className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No active orders</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">You don&apos;t have any orders at the moment. Create a new order to get started.</p>
      </div>
    </div>
  );
}
