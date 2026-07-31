"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { servicePackageSchema, ServicePackageInput } from "@/lib/validations/service.schema";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";

export async function createPackage(input: ServicePackageInput): Promise<ActionResponse<{ id: string }>> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = servicePackageSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const pkg = await prisma.servicePackage.create({ data: validated.data });
    revalidatePath("/admin/services");
    return { success: true, data: { id: pkg.id } };
  } catch (error) {
    console.error("Create package error:", error);
    return { success: false, error: "Failed to create package" };
  }
}

export async function updatePackage(id: string, input: ServicePackageInput): Promise<ActionResponse> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = servicePackageSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    await prisma.servicePackage.update({ where: { id }, data: validated.data });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Update package error:", error);
    return { success: false, error: "Failed to update package" };
  }
}

export async function deletePackage(id: string): Promise<ActionResponse> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.servicePackage.delete({ where: { id } });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Delete package error:", error);
    return { success: false, error: "Failed to delete package" };
  }
}
