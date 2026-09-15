"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { sendTextMessage } from "@/lib/apitxt";
import { notifyAdminsByWhatsApp, notifyUser } from "@/actions/notification.actions";
import { forwardGeocodePincode } from "@/lib/geocode";
import type { SupportTicketCategory, SupportTicketStatus, Prisma } from "@prisma/client";

const MAX_MESSAGE_LENGTH = 1000;

async function requireVendor(): Promise<{ vendorId: string | null; userId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { vendorId: null, userId: null, error: "Not signed in as a vendor" };
  }
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { vendorId: null, userId: null, error: "Vendor profile not found" };
  return { vendorId: profile.id, userId: session.user.id, error: null };
}

/**
 * A ticket is visible to the vendor who raised it or to any admin — same
 * two-sided-thread shape as job chat (ChatMessage/authorizeThread), just
 * without a job to scope to.
 */
async function authorizeTicket(
  ticketId: string,
  userId: string
): Promise<{ ok: true; vendorUserId: string; vendorId: string } | { ok: false; error: string }> {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { vendorId: true, vendor: { select: { userId: true } } },
  });
  if (!ticket) return { ok: false, error: "Ticket not found" };

  const session = await getServerSession(authOptions);
  const isOwner = ticket.vendor.userId === userId;
  const isAdmin = session?.user?.role === "SUPER_ADMIN";
  if (!isOwner && !isAdmin) return { ok: false, error: "You don't have access to this ticket" };

  return { ok: true, vendorUserId: ticket.vendor.userId, vendorId: ticket.vendorId };
}

export interface SupportTicketSummary {
  id: string;
  category: SupportTicketCategory;
  subject: string;
  status: SupportTicketStatus;
  requestedPincode: string | null;
  requestedRadiusKm: number | null;
  requestedCategoryIds: string[];
  vendorId: string;
  vendorName: string;
  lastMessageAt: string;
  createdAt: string;
  resolvedAt: string | null;
}

function mapTicket(t: {
  id: string;
  category: SupportTicketCategory;
  subject: string;
  status: SupportTicketStatus;
  requestedPincode: string | null;
  requestedRadiusKm: number | null;
  requestedCategoryIds: string[];
  vendorId: string;
  vendor: { companyName: string };
  updatedAt: Date;
  createdAt: Date;
  resolvedAt: Date | null;
}): SupportTicketSummary {
  return {
    id: t.id,
    category: t.category,
    subject: t.subject,
    status: t.status,
    requestedPincode: t.requestedPincode,
    requestedRadiusKm: t.requestedRadiusKm,
    requestedCategoryIds: t.requestedCategoryIds,
    vendorId: t.vendorId,
    vendorName: t.vendor.companyName,
    lastMessageAt: t.updatedAt.toISOString(),
    createdAt: t.createdAt.toISOString(),
    resolvedAt: t.resolvedAt?.toISOString() ?? null,
  };
}

const ticketWithVendor = { vendor: { select: { companyName: true } } } satisfies Prisma.SupportTicketInclude;

export interface RaiseTicketInput {
  category: SupportTicketCategory;
  subject: string;
  message: string;
  requestedPincode?: string;
  requestedRadiusKm?: number;
  requestedCategoryIds?: string[];
}

/**
 * A vendor's request to the platform — most concretely "give me this
 * service area" or "give me access to this category," now that both are
 * admin-managed. The opening message is written here too, so the ticket
 * always has at least one message in its thread the moment it exists.
 */
export async function raiseSupportTicketAction(input: RaiseTicketInput): Promise<ActionResponse<{ id: string }>> {
  const { vendorId, userId, error } = await requireVendor();
  if (!vendorId || !userId) return { success: false, error: error! };

  const subject = input.subject.trim().slice(0, 200);
  const message = input.message.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!subject) return { success: false, error: "Give your ticket a short subject" };
  if (!message) return { success: false, error: "Say what you need" };

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { companyName: true, user: { select: { phone: true } } },
    });

    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.supportTicket.create({
        data: {
          vendorId,
          category: input.category,
          subject,
          requestedPincode: input.requestedPincode?.trim() || null,
          requestedRadiusKm: input.requestedRadiusKm ?? null,
          requestedCategoryIds: input.requestedCategoryIds ?? [],
        },
      });
      await tx.supportTicketMessage.create({ data: { ticketId: created.id, senderId: userId, body: message } });
      return created;
    });

    // Best-effort, both directions — never let a notification failure fail
    // the ticket itself. In-app always fires; WhatsApp is the headline-event
    // channel (created/resolved), not every message.
    notifyAdminsByWhatsApp(
      `New support ticket from ${vendor?.companyName ?? "a vendor"}: "${subject}". Reply from the admin panel.`
    );
    if (vendor?.user.phone) {
      sendTextMessage({
        phone: vendor.user.phone,
        channel: "WHATSAPP",
        message: `Your ticket "${subject}" has been received — we'll get back to you soon.`,
      });
    }

    revalidatePath("/vendor/support");
    revalidatePath("/admin/support");
    return { success: true, data: { id: ticket.id } };
  } catch (err) {
    console.error("Raise support ticket error:", err);
    return { success: false, error: "Failed to raise your ticket" };
  }
}

/** The signed-in vendor's own tickets. */
export async function getMyTicketsAction(): Promise<ActionResponse<SupportTicketSummary[]>> {
  const { vendorId, error } = await requireVendor();
  if (!vendorId) return { success: false, error: error! };

  try {
    const rows = await prisma.supportTicket.findMany({
      where: { vendorId },
      include: ticketWithVendor,
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    return { success: true, data: rows.map(mapTicket) };
  } catch (err) {
    console.error("Get my tickets error:", err);
    return { success: false, error: "Failed to load your tickets" };
  }
}

/** Every ticket, for the admin inbox. */
export async function getAllTicketsForAdminAction(): Promise<ActionResponse<SupportTicketSummary[]>> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.supportTicket.findMany({
      include: ticketWithVendor,
      orderBy: { updatedAt: "desc" },
      take: 200,
    });
    return { success: true, data: rows.map(mapTicket) };
  } catch (err) {
    console.error("Get all tickets error:", err);
    return { success: false, error: "Failed to load tickets" };
  }
}

export interface TicketMessageItem {
  id: string;
  body: string;
  isMine: boolean;
  senderName: string;
  senderIsAdmin: boolean;
  createdAt: string;
}

export async function getTicketMessagesAction(ticketId: string): Promise<ActionResponse<TicketMessageItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  const auth = await authorizeTicket(ticketId, session.user.id);
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const messages = await prisma.supportTicketMessage.findMany({
      where: { ticketId },
      include: { sender: { select: { name: true, role: true } } },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
    return {
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        body: m.body,
        isMine: m.senderId === session.user.id,
        senderName: m.sender.name ?? (m.sender.role === "SUPER_ADMIN" ? "Support" : "You"),
        senderIsAdmin: m.sender.role === "SUPER_ADMIN",
        createdAt: m.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Get ticket messages error:", err);
    return { success: false, error: "Failed to load messages" };
  }
}

export async function sendTicketMessageAction(ticketId: string, body: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const trimmed = body.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return { success: false, error: "Message can't be empty" };

  const auth = await authorizeTicket(ticketId, session.user.id);
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const isAdminSender = session.user.role === "SUPER_ADMIN";
    await prisma.$transaction(async (tx) => {
      await tx.supportTicketMessage.create({ data: { ticketId, senderId: session.user.id, body: trimmed } });
      await tx.supportTicket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } });
    });

    // Every reply gets an in-app ping to whoever didn't send it — an admin
    // reply notifies the vendor, a vendor reply notifies... every admin
    // would be noisy for a single ticket, so only the vendor side is
    // targeted here; admins see new activity via the ticket list itself.
    if (isAdminSender) {
      notifyUser(auth.vendorUserId, "SUPPORT_TICKET_MESSAGE", "Reply on your support ticket", trimmed);
    }

    revalidatePath("/vendor/support");
    revalidatePath("/admin/support");
    return { success: true };
  } catch (err) {
    console.error("Send ticket message error:", err);
    return { success: false, error: "Failed to send your message" };
  }
}

/**
 * Admin approves a SERVICE_AREA or CATEGORY_ACCESS ticket — creates the real
 * VendorServiceArea/VendorCategory row(s) directly from what the vendor
 * requested, posts a confirming message into the thread, resolves the
 * ticket, and WhatsApps the vendor. One action instead of "go edit the
 * vendor's coverage separately and remember to close the ticket."
 */
export async function approveTicketAction(ticketId: string): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { vendor: { select: { companyName: true, user: { select: { id: true, phone: true } } } } },
    });
    if (!ticket) return { success: false, error: "Ticket not found" };
    if (ticket.status !== "OPEN") return { success: false, error: "This ticket is already closed" };

    let confirmationNote = "";

    if (ticket.category === "SERVICE_AREA") {
      if (!ticket.requestedPincode || !ticket.requestedRadiusKm) {
        return { success: false, error: "This ticket didn't include a pincode/radius to approve" };
      }
      const existing = await prisma.vendorServiceArea.findUnique({
        where: { vendorId_pincode: { vendorId: ticket.vendorId, pincode: ticket.requestedPincode } },
      });
      if (existing) {
        await prisma.vendorServiceArea.update({ where: { id: existing.id }, data: { radiusKm: ticket.requestedRadiusKm } });
      } else {
        const coords = await forwardGeocodePincode(ticket.requestedPincode);
        if (!coords) return { success: false, error: "Couldn't locate that pincode — add it manually from Manage Coverage instead" };
        await prisma.vendorServiceArea.create({
          data: {
            vendorId: ticket.vendorId,
            pincode: ticket.requestedPincode,
            latitude: coords.latitude,
            longitude: coords.longitude,
            radiusKm: ticket.requestedRadiusKm,
          },
        });
      }
      confirmationNote = `Approved — added ${ticket.requestedPincode} (${ticket.requestedRadiusKm}km) to your serviceable areas.`;
    } else if (ticket.category === "CATEGORY_ACCESS") {
      if (ticket.requestedCategoryIds.length === 0) {
        return { success: false, error: "This ticket didn't include any categories to approve" };
      }
      await prisma.vendorCategory.createMany({
        data: ticket.requestedCategoryIds.map((categoryId) => ({ vendorId: ticket.vendorId, categoryId })),
        skipDuplicates: true,
      });
      confirmationNote = "Approved — the requested categories have been added to your account.";
    } else {
      confirmationNote = "Approved.";
    }

    const session = await getServerSession(authOptions);
    await prisma.$transaction(async (tx) => {
      await tx.supportTicketMessage.create({ data: { ticketId, senderId: session!.user.id, body: confirmationNote } });
      await tx.supportTicket.update({ where: { id: ticketId }, data: { status: "RESOLVED", resolvedAt: new Date() } });
    });

    notifyUser(ticket.vendor.user.id, "SUPPORT_TICKET_RESOLVED", "Your ticket was approved", confirmationNote);
    if (ticket.vendor.user.phone) {
      sendTextMessage({ phone: ticket.vendor.user.phone, channel: "WHATSAPP", message: confirmationNote });
    }

    revalidatePath("/vendor/support");
    revalidatePath("/admin/support");
    revalidatePath("/vendor/live-calls");
    return { success: true };
  } catch (err) {
    console.error("Approve ticket error:", err);
    return { success: false, error: "Failed to approve this ticket" };
  }
}

/** Closes a ticket without an approval action — for GENERAL tickets or a declined request. */
export async function resolveTicketAction(ticketId: string, responseMessage: string): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };
  const trimmed = responseMessage.trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!trimmed) return { success: false, error: "Add a closing note for the vendor" };

  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      select: { status: true, vendorId: true, vendor: { select: { user: { select: { phone: true, id: true } } } } },
    });
    if (!ticket) return { success: false, error: "Ticket not found" };
    if (ticket.status !== "OPEN") return { success: false, error: "This ticket is already closed" };

    const session = await getServerSession(authOptions);
    await prisma.$transaction(async (tx) => {
      await tx.supportTicketMessage.create({ data: { ticketId, senderId: session!.user.id, body: trimmed } });
      await tx.supportTicket.update({ where: { id: ticketId }, data: { status: "RESOLVED", resolvedAt: new Date() } });
    });

    notifyUser(ticket.vendor.user.id, "SUPPORT_TICKET_RESOLVED", "Your ticket was resolved", trimmed);
    if (ticket.vendor.user.phone) {
      sendTextMessage({ phone: ticket.vendor.user.phone, channel: "WHATSAPP", message: trimmed });
    }

    revalidatePath("/vendor/support");
    revalidatePath("/admin/support");
    return { success: true };
  } catch (err) {
    console.error("Resolve ticket error:", err);
    return { success: false, error: "Failed to resolve this ticket" };
  }
}
