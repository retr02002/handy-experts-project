import React from "react";

export default function VendorItemsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Items List</h1>
      </div>
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 dark:text-slate-400 font-medium">Inventory and items list will be implemented here.</p>
      </div>
    </div>
  );
}
