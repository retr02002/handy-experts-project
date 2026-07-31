"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serviceSchema, ServiceInput } from "@/lib/validations/service.schema";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";

export async function createService(input: ServiceInput): Promise<ActionResponse<{ id: string }>> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = serviceSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  const { benefits, howItWorks, faqs, ...rest } = validated.data;

  try {
    const existing = await prisma.service.findUnique({ where: { slug: rest.slug } });
    if (existing) {
      return { success: false, error: "A service with this slug already exists", errors: { slug: ["Slug already in use"] } };
    }

    const service = await prisma.service.create({
      data: { ...rest, benefits, howItWorks, faqs },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath(`/services/${service.slug}`);
    return { success: true, data: { id: service.id } };
  } catch (error) {
    console.error("Create service error:", error);
    return { success: false, error: "Failed to create service" };
  }
}

export async function updateService(id: string, input: ServiceInput): Promise<ActionResponse> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = serviceSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  const { benefits, howItWorks, faqs, ...rest } = validated.data;

  try {
    const current = await prisma.service.findUnique({ where: { id }, select: { slug: true } });

    const existing = await prisma.service.findUnique({ where: { slug: rest.slug } });
    if (existing && existing.id !== id) {
      return { success: false, error: "A service with this slug already exists", errors: { slug: ["Slug already in use"] } };
    }

    await prisma.service.update({
      where: { id },
      data: { ...rest, benefits, howItWorks, faqs },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath(`/services/${rest.slug}`);
    if (current && current.slug !== rest.slug) {
      revalidatePath(`/services/${current.slug}`);
    }
    return { success: true };
  } catch (error) {
    console.error("Update service error:", error);
    return { success: false, error: "Failed to update service" };
  }
}

export async function deleteService(id: string): Promise<ActionResponse> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deleted = await prisma.service.delete({ where: { id } });
    revalidatePath("/admin/services");
    revalidatePath("/services");
    revalidatePath("/");
    revalidatePath(`/services/${deleted.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Delete service error:", error);
    return { success: false, error: "Failed to delete service" };
  }
}
