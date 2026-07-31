import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function CustomerNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Mark all as read
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-blue-900/50 p-4 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-1">
            <ClientIcon icon="ph:info" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Welcome to Handyzo!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">We are glad to have you. Explore your dashboard to create your first order.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Just now</p>
          </div>
          <div className="ml-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block"></span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 mt-1">
            <ClientIcon icon="ph:check-circle" className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-slate-700 dark:text-slate-200">Account verified</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your email address has been successfully verified.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
