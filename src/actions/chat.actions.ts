"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/actions/auth.actions";

const MAX_MESSAGE_LENGTH = 1000;

export interface ChatMessageItem {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  /** Whose side of the thread to render it on. */
  isMine: boolean;
  createdAt: string;
}

/**
 * One thread per job. Readable and writable by the customer and the
 * assigned technician; the owning vendor can read it too, since they're the
 * one fielding complaints when something goes wrong on site.
 */
async function authorizeThread(
  serviceCallId: string,
  userId: string
): Promise<
  { ok: true; canWrite: boolean; otherPartyUserId: string | null } | { ok: false; error: string }
> {
  const call = await prisma.serviceCall.findUnique({
    where: { id: serviceCallId },
    select: {
      customerId: true,
      vendor: { select: { userId: true } },
      technician: { select: { userId: true } },
    },
  });
  if (!call) return { ok: false, error: "Service call not found" };

  const isCustomer = call.customerId === userId;
  const isTechnician = call.technician?.userId === userId;
  const isVendor = call.vendor.userId === userId;
  if (!isCustomer && !isTechnician && !isVendor) {
    return { ok: false, error: "You don't have access to this conversation" };
  }

  const otherPartyUserId = isCustomer ? call.technician?.userId ?? null : isTechnician ? call.customerId : null;
  return { ok: true, canWrite: isCustomer || isTechnician, otherPartyUserId };
}

export async function getMessagesAction(serviceCallId: string): Promise<ActionResponse<ChatMessageItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const userId = session.user.id;

  try {
    const auth = await authorizeThread(serviceCallId, userId);
    if (!auth.ok) return { success: false, error: auth.error };

    const messages = await prisma.chatMessage.findMany({
      where: { serviceCallId },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 200,
    });

    return {
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        body: m.body,
        senderId: m.senderId,
        senderName: m.sender.name ?? "",
        isMine: m.senderId === userId,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Get messages error:", err);
    return { success: false, error: "Failed to load messages" };
  }
}

export async function sendMessageAction(serviceCallId: string, body: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const userId = session.user.id;

  const trimmed = body.trim();
  if (!trimmed) return { success: false, error: "Type a message first" };
  if (trimmed.length > MAX_MESSAGE_LENGTH) return { success: false, error: "That message is too long" };

  try {
    const auth = await authorizeThread(serviceCallId, userId);
    if (!auth.ok) return { success: false, error: auth.error };
    if (!auth.canWrite) {
      return { success: false, error: "Only the customer and the assigned technician can post here" };
    }

    await prisma.chatMessage.create({ data: { serviceCallId, senderId: userId, body: trimmed } });

    // Best-effort ping to the other side — a failure here must not lose the message.
    if (auth.otherPartyUserId) {
      await prisma.notification
        .create({
          data: {
            userId: auth.otherPartyUserId,
            type: "NEW_MESSAGE",
            title: "New message",
            message: trimmed.slice(0, 120),
            serviceCallId,
          },
        })
        .catch((err) => console.error("Chat notification failed:", err));
    }

    return { success: true };
  } catch (err) {
    console.error("Send message error:", err);
    return { success: false, error: "Failed to send message" };
  }
}

/** Marks everything the other party sent as read — drives the unread badge. */
export async function markMessagesReadAction(serviceCallId: string): Promise<ActionResponse<{ count: number }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const userId = session.user.id;

  try {
    const auth = await authorizeThread(serviceCallId, userId);
    if (!auth.ok) return { success: false, error: auth.error };

    const updated = await prisma.chatMessage.updateMany({
      where: { serviceCallId, senderId: { not: userId }, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true, data: { count: updated.count } };
  } catch (err) {
    console.error("Mark messages read error:", err);
    return { success: false, error: "Failed to update messages" };
  }
}

export async function getUnreadMessageCountAction(serviceCallId: string): Promise<ActionResponse<{ count: number }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const userId = session.user.id;

  try {
    const auth = await authorizeThread(serviceCallId, userId);
    if (!auth.ok) return { success: false, error: auth.error };

    const count = await prisma.chatMessage.count({
      where: { serviceCallId, senderId: { not: userId }, readAt: null },
    });
    return { success: true, data: { count } };
  } catch (err) {
    console.error("Get unread message count error:", err);
    return { success: false, error: "Failed to load unread count" };
  }
}
