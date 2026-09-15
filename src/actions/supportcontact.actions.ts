"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { supportContactSchema, type SupportContactInput } from "@/lib/validations/supportcontact.schema";
import type { SupportContactType } from "@prisma/client";

function revalidateSupportContactSurfaces() {
  revalidatePath("/vendor/support");
  revalidatePath("/admin/support");
  revalidatePath("/admin/support/contacts");
}

export interface SupportContactItem {
  id: string;
  type: SupportContactType;
  label: string;
  value: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * The platform's admin-configured contact list — a lighter-weight
 * alternative to raising a SupportTicket for a vendor who'd rather just
 * call or email. Scoped to "any signed-in user" rather than vendor-only:
 * only /vendor/support reads this today, but nothing here is vendor-
 * specific, so a technician/customer surface can reuse this same action
 * later without new plumbing.
 */
export async function getSupportContactsAction(): Promise<ActionResponse<SupportContactItem[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    const rows = await prisma.supportContact.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return { success: true, data: rows };
  } catch (err) {
    console.error("Get support contacts error:", err);
    return { success: false, error: "Failed to load support contacts" };
  }
}

/** Every contact including inactive ones, for the admin management screen. */
export async function getAllSupportContactsForAdminAction(): Promise<ActionResponse<SupportContactItem[]>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const rows = await prisma.supportContact.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return { success: true, data: rows };
  } catch (err) {
    console.error("Get all support contacts error:", err);
    return { success: false, error: "Failed to load support contacts" };
  }
}

export async function createSupportContactAction(input: SupportContactInput): Promise<ActionResponse<{ id: string }>> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const validated = supportContactSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const contact = await prisma.supportContact.create({ data: validated.data });
    revalidateSupportContactSurfaces();
    return { success: true, data: { id: contact.id } };
  } catch (err) {
    console.error("Create support contact error:", err);
    return { success: false, error: "Failed to add this contact" };
  }
}

export async function updateSupportContactAction(id: string, input: SupportContactInput): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  const validated = supportContactSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    await prisma.supportContact.update({ where: { id }, data: validated.data });
    revalidateSupportContactSurfaces();
    return { success: true };
  } catch (err) {
    console.error("Update support contact error:", err);
    return { success: false, error: "Failed to update this contact" };
  }
}

/** Flips isActive without touching anything else — the quick show/hide toggle in the admin list. */
export async function setSupportContactActiveAction(id: string, isActive: boolean): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  try {
    await prisma.supportContact.update({ where: { id }, data: { isActive } });
    revalidateSupportContactSurfaces();
    return { success: true };
  } catch (err) {
    console.error("Set support contact active error:", err);
    return { success: false, error: "Failed to update this contact" };
  }
}

export async function deleteSupportContactAction(id: string): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Unauthorized" };

  try {
    await prisma.supportContact.delete({ where: { id } });
    revalidateSupportContactSurfaces();
    return { success: true };
  } catch (err) {
    console.error("Delete support contact error:", err);
    return { success: false, error: "Failed to delete this contact" };
  }
}
