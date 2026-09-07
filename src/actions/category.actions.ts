"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { categorySchema, CategoryInput } from "@/lib/validations/category.schema";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";

/**
 * A category name/icon is rendered on the homepage grid and slider, the
 * /services tabs, the footer, and inside every service detail page's
 * breadcrumb. Detail pages are prerendered via generateStaticParams, so the
 * route-level form is used there — one call covers every prerendered slug,
 * which a literal path list can't do without querying for them first.
 */
function revalidateCategorySurfaces(includeServicePages: boolean) {
  // getAllCategories/getCategoriesWithServices are unstable_cache-wrapped
  // (services-data.ts) — the revalidatePath calls below refresh the RSC
  // payload for these specific routes, but the underlying cached query
  // itself only invalidates via this tag, which is why it also needs to
  // fire here rather than relying on revalidatePath alone.
  // Next 16's revalidateTag requires a cache-life profile as the 2nd arg —
  // matches the { revalidate: 300 } used in the unstable_cache calls this
  // invalidates (services-data.ts's getAllCategories/getCategoriesWithServices).
  revalidateTag("categories", { expire: 300 });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  revalidatePath("/");
  revalidatePath("/services");
  if (includeServicePages) {
    revalidatePath("/services/[slug]", "page");
  }
}

export async function createCategory(input: CategoryInput): Promise<ActionResponse<{ id: string }>> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = categorySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const existing = await prisma.category.findUnique({ where: { slug: validated.data.slug } });
    if (existing) {
      return { success: false, error: "A category with this slug already exists", errors: { slug: ["Slug already in use"] } };
    }

    const category = await prisma.category.create({ data: validated.data });

    // A brand-new category has no services, so no detail page can reference it.
    revalidateCategorySurfaces(false);
    return { success: true, data: { id: category.id } };
  } catch (error) {
    console.error("Create category error:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResponse> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  const validated = categorySchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const existing = await prisma.category.findUnique({ where: { slug: validated.data.slug } });
    if (existing && existing.id !== id) {
      return { success: false, error: "A category with this slug already exists", errors: { slug: ["Slug already in use"] } };
    }

    await prisma.category.update({ where: { id }, data: validated.data });

    revalidateCategorySurfaces(true);
    return { success: true };
  } catch (error) {
    console.error("Update category error:", error);
    return { success: false, error: "Failed to update category" };
  }
}

/**
 * Refuses while services are still attached. Silently orphaning a catalog's
 * worth of services on a stray click is unrecoverable — the admin gets a count
 * and reassigns them from /admin/services first. The schema's onDelete:
 * SetNull remains as a backstop for any path that bypasses this action.
 */
export async function deleteCategory(id: string): Promise<ActionResponse> {
  if (!(await requireAdmin())) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const serviceCount = await prisma.service.count({ where: { categoryId: id } });
    if (serviceCount > 0) {
      return {
        success: false,
        error: `This category still has ${serviceCount} service${serviceCount === 1 ? "" : "s"}. Reassign them to another category first.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidateCategorySurfaces(false);
    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
