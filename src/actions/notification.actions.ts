"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  serviceCallId: string | null;
}

export async function getMyNotificationsAction(): Promise<ActionResponse<NotificationItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    const rows = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        message: r.message,
        isRead: r.isRead,
        createdAt: r.createdAt.toISOString(),
        serviceCallId: r.serviceCallId,
      })),
    };
  } catch (err) {
    console.error("Get my notifications error:", err);
    return { success: false, error: "Failed to load notifications" };
  }
}

export async function getUnreadNotificationCountAction(): Promise<ActionResponse<number>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    const count = await prisma.notification.count({ where: { userId: session.user.id, isRead: false } });
    return { success: true, data: count };
  } catch (err) {
    console.error("Get unread notification count error:", err);
    return { success: false, error: "Failed to load notification count" };
  }
}

export async function markNotificationReadAction(id: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: { isRead: true } });
    revalidatePath("/technician/notifications");
    return { success: true };
  } catch (err) {
    console.error("Mark notification read error:", err);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    await prisma.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
    revalidatePath("/technician/notifications");
    return { success: true };
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    return { success: false, error: "Failed to update notifications" };
  }
}
