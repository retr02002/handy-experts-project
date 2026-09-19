"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { contactQuerySchema } from "@/lib/validations/contactquery.schema";

export type ContactQueryReasonValue = "GENERAL" | "SUPPORT" | "SALES" | "PARTNER";
export type ContactQueryStatusValue = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface AdminContactQuery {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  reason: ContactQueryReasonValue;
  message: string;
  status: ContactQueryStatusValue;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

function mapContactQuery(row: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  reason: ContactQueryReasonValue;
  message: string;
  status: ContactQueryStatusValue;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
}): AdminContactQuery {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    reason: row.reason,
    message: row.message,
    status: row.status,
    adminNote: row.adminNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
  };
}

// Same cooldown-plus-hourly-cap shape as checkRateLimit in otp.actions.ts —
// this is public and unauthenticated, so email is the only identifier
// available to throttle on.
const RESEND_COOLDOWN_SECONDS = 60;
const HOURLY_SEND_CAP = 5;

async function checkContactQueryRateLimit(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const latest = await prisma.contactQuery.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (latest) {
    const elapsedSeconds = (Date.now() - latest.createdAt.getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
      return { ok: false, error: `Please wait ${remaining}s before sending another message` };
    }
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.contactQuery.count({
    where: { email, createdAt: { gt: oneHourAgo } },
  });
  if (recentCount >= HOURLY_SEND_CAP) {
    return { ok: false, error: "Too many messages sent — please try again later" };
  }

  return { ok: true };
}

/** Public — no auth. Whatever a visitor types on /contact lands here as a NEW query. */
export async function submitContactQueryAction(input: unknown): Promise<ActionResponse<{ id: string }>> {
  const validated = contactQuerySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const rateCheck = await checkContactQueryRateLimit(validated.data.email);
    if (!rateCheck.ok) return { success: false, error: rateCheck.error };

    const query = await prisma.contactQuery.create({ data: validated.data });
    return { success: true, data: { id: query.id } };
  } catch (error) {
    console.error("Submit contact query error:", error);
    return { success: false, error: "Failed to send your message. Please try again." };
  }
}

export async function getAllContactQueriesForAdminAction(): Promise<ActionResponse<AdminContactQuery[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.contactQuery.findMany({ orderBy: { createdAt: "desc" } });
    return { success: true, data: rows.map(mapContactQuery) };
  } catch (error) {
    console.error("Get contact queries error:", error);
    return { success: false, error: "Failed to load contact queries" };
  }
}

/** Editing the submitted content itself (e.g. fixing a typo the visitor made) — not the status/note. */
export async function updateContactQueryAction(id: string, input: unknown): Promise<ActionResponse<AdminContactQuery>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const validated = contactQuerySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const updated = await prisma.contactQuery.update({ where: { id }, data: validated.data });
    revalidatePath("/admin/contact-queries");
    return { success: true, data: mapContactQuery(updated) };
  } catch (error) {
    console.error("Update contact query error:", error);
    return { success: false, error: "Failed to update this query" };
  }
}

const STATUS_VALUES: ContactQueryStatusValue[] = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export async function updateContactQueryStatusAction(
  id: string,
  status: ContactQueryStatusValue,
  adminNote?: string
): Promise<ActionResponse<AdminContactQuery>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  if (!STATUS_VALUES.includes(status)) {
    return { success: false, error: "Invalid status" };
  }

  try {
    const updated = await prisma.contactQuery.update({
      where: { id },
      data: {
        status,
        // Stamped when it lands in a "done" state, cleared if moved back out
        // of one — same idea as SupportTicket.resolvedAt.
        resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
        ...(adminNote !== undefined ? { adminNote } : {}),
      },
    });
    revalidatePath("/admin/contact-queries");
    return { success: true, data: mapContactQuery(updated) };
  } catch (error) {
    console.error("Update contact query status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteContactQueryAction(id: string): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    await prisma.contactQuery.delete({ where: { id } });
    revalidatePath("/admin/contact-queries");
    return { success: true };
  } catch (error) {
    console.error("Delete contact query error:", error);
    return { success: false, error: "Failed to delete this query" };
  }
}
