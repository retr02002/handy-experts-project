import React, { Suspense } from "react";
import { getMyNotificationsAction } from "@/actions/notification.actions";
import { NotificationsClient } from "./NotificationsClient";

export default function AdminNotificationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading notifications...</div>}>
      <NotificationsLoader />
    </Suspense>
  );
}

async function NotificationsLoader() {
  const res = await getMyNotificationsAction();
  if (!res.success || !res.data) {
    return <div className="p-8 text-center text-red-500 text-sm">Failed to load notifications</div>;
  }

  return <NotificationsClient initialItems={res.data} />;
}

