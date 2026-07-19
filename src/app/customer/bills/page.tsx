import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function CustomerBillsPage() {
  const mockCustomerBills = [
    { id: "INV-8091", service: "Plumbing Inspection", date: "2023-11-20", amount: 150.00, status: "paid" },
    { id: "INV-8032", service: "AC Maintenance", date: "2023-10-15", amount: 85.00, status: "paid" },
  ];

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bills & Invoices</h1>
      </div>
      
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockCustomerBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{bill.id}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{bill.service}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{bill.date}</td>
                  <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">₹{bill.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                      {bill.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <ClientIcon icon="ph:download-simple" className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
