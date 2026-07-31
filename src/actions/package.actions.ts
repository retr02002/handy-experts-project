"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { servicePackageSchema, ServicePackageInput } from "@/lib/validations/service.schema";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";

function revalidateForService(slug: string) {
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  revalidatePath(`/services/${slug}`);
}

export async function createPackage(input: ServicePackageInput): Promise<ActionResponse<{ id: string }>> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = servicePackageSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const pkg = await prisma.servicePackage.create({
      data: validated.data,
      include: { service: { select: { slug: true } } },
    });
    revalidateForService(pkg.service.slug);
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
    const pkg = await prisma.servicePackage.update({
      where: { id },
      data: validated.data,
      include: { service: { select: { slug: true } } },
    });
    revalidateForService(pkg.service.slug);
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
    const pkg = await prisma.servicePackage.delete({
      where: { id },
      include: { service: { select: { slug: true } } },
    });
    revalidateForService(pkg.service.slug);
    return { success: true };
  } catch (error) {
    console.error("Delete package error:", error);
    return { success: false, error: "Failed to delete package" };
  }
}
