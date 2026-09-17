"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { serviceSchema, ServiceInput } from "@/lib/validations/service.schema";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";

/**
 * revalidatePath refreshes the RSC payload for these specific routes, but
 * getAllServices/getCategoriesWithServices (services-data.ts) are
 * unstable_cache-wrapped — that underlying cached query only invalidates via
 * these tags, same reasoning as category.actions.ts's
 * revalidateCategorySurfaces. getCategoriesWithServices embeds service data
 * too, so a service edit has to bust both tags, not just "services".
 */
function revalidateServiceSurfaces(slugs: string[]) {
  revalidateTag("services", { expire: 300 });
  revalidateTag("categories", { expire: 300 });
  revalidatePath("/admin/services");
  // Per-category service counts on the categories manager go stale otherwise.
  revalidatePath("/admin/categories");
  revalidatePath("/services");
  revalidatePath("/");
  for (const slug of slugs) revalidatePath(`/services/${slug}`);
}

/**
 * P2003 = foreign key constraint failure. Happens when an admin submits a
 * service against a categoryId that was deleted in another tab since the form
 * loaded — worth a specific message rather than a generic failure.
 */
function isMissingCategoryError(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2003";
}

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

    revalidateServiceSurfaces([service.slug]);
    return { success: true, data: { id: service.id } };
  } catch (error) {
    console.error("Create service error:", error);
    if (isMissingCategoryError(error)) {
      return { success: false, error: "That category no longer exists", errors: { categoryId: ["Selected category no longer exists"] } };
    }
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

    const slugs = current && current.slug !== rest.slug ? [rest.slug, current.slug] : [rest.slug];
    revalidateServiceSurfaces(slugs);
    return { success: true };
  } catch (error) {
    console.error("Update service error:", error);
    if (isMissingCategoryError(error)) {
      return { success: false, error: "That category no longer exists", errors: { categoryId: ["Selected category no longer exists"] } };
    }
    return { success: false, error: "Failed to update service" };
  }
}

export async function deleteService(id: string): Promise<ActionResponse> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const deleted = await prisma.service.delete({ where: { id } });
    revalidateServiceSurfaces([deleted.slug]);
    return { success: true };
  } catch (error) {
    console.error("Delete service error:", error);
    return { success: false, error: "Failed to delete service" };
  }
}
