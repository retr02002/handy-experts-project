"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  getMyNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  type NotificationItem,
} from "@/actions/notification.actions";
import { ClientIcon } from "@/components/ui/ClientIcon";

const TYPE_ICON: Record<string, { icon: string; bg: string; text: string }> = {
  NEW_LIVE_CALL: { icon: "ph:phone-call-fill", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-500" },
  CALL_ACCEPTED: { icon: "ph:check-circle-fill", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-500" },
  CALL_ASSIGNED: { icon: "ph:warning-circle-fill", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-500" },
  CALL_STATUS_UPDATE: { icon: "ph:arrows-clockwise-fill", bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-500" },
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await getMyNotificationsAction();
    if (res.success && res.data) setItems(res.data);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const unreadCount = items.filter((i) => !i.isRead).length;

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    await markAllNotificationsReadAction();
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (item.isRead) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
    await markNotificationReadAction(item.id);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform activity — <span className="font-bold text-blue-500">{unreadCount} unread</span>.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center text-slate-500 dark:text-slate-400">
          <ClientIcon icon="ph:bell-slash" className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p>You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => {
              const style = TYPE_ICON[item.type] ?? TYPE_ICON.CALL_STATUS_UPDATE;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-4 cursor-pointer ${
                    !item.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                  }`}
                >
                  <div className={`${style.bg} p-2.5 rounded-xl h-fit ${style.text} shrink-0`}>
                    <ClientIcon icon={style.icon} className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm ${!item.isRead ? "font-bold text-slate-900 dark:text-white" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                        {item.title}
                      </h3>
                      <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">{timeAgo(item.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.message}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
