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
  CALL_ASSIGNED: { icon: "ph:warning-circle-fill", bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-500" },
  NEW_LIVE_CALL: { icon: "ph:phone-call-fill", bg: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-500" },
  CALL_ACCEPTED: { icon: "ph:check-circle-fill", bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-500" },
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

export default function TechnicianNotificationsPage() {
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
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            You have <span className="font-bold text-amber-500">{unreadCount} unread</span> messages.
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-500 transition-colors bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-full shadow-sm w-fit disabled:opacity-50 cursor-pointer"
        >
          <ClientIcon icon="ph:check-circle" className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      {!loaded ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl">
          <ClientIcon icon="ph:bell-slash" className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const style = TYPE_ICON[item.type] ?? TYPE_ICON.CALL_STATUS_UPDATE;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`text-left bg-white dark:bg-[#0F172A] border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 cursor-pointer ${
                  item.isRead
                    ? "border-slate-100 dark:border-slate-800/50 opacity-75 hover:opacity-100"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className={`${style.bg} p-3 rounded-2xl h-fit ${style.text} shrink-0 self-start relative`}>
                  <ClientIcon icon={style.icon} className="w-6 h-6" />
                  {!item.isRead && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0F172A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3 mb-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.message}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
