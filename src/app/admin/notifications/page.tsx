import React from "react";
import { mockNotifications } from "@/lib/mockData";
import { ClientIcon } from "@/components/ui/ClientIcon";

export default function AdminNotificationsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform alerts and updates requiring your attention.</p>
        </div>
        <button className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
          Mark all as read
        </button>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {mockNotifications.map((notif) => (
            <div key={notif.id} className={`p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 ${notif.unread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
              <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${notif.unread ? 'bg-blue-500' : 'bg-transparent'}`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm ${notif.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{notif.message}</p>
                {notif.unread && (
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs font-medium px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      View Details
                    </button>
                    <button className="text-xs font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {mockNotifications.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <ClientIcon icon="ph:bell-slash" className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p>You&apos;re all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
