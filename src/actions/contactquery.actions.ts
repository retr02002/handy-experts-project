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

/** Public — no auth. Whatever a visitor types on /contact lands here as a NEW query. */
export async function submitContactQueryAction(input: unknown): Promise<ActionResponse<{ id: string }>> {
  const validated = contactQuerySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
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
