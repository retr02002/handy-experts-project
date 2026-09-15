"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { couponSchema } from "@/lib/validations/coupon.schema";
import { resolveCouponDiscount, type CouponCartItem, type CouponResolution } from "@/lib/coupons";

export interface AdminCouponScope {
  categoryId: string | null;
  categoryName: string | null;
  serviceId: string | null;
  serviceName: string | null;
  packageId: string | null;
  packageName: string | null;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  scopeType: string;
  scopes: AdminCouponScope[];
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export async function getAllCouponsForAdminAction(): Promise<ActionResponse<AdminCoupon[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.coupon.findMany({
      include: {
        scopes: {
          include: {
            category: { select: { name: true } },
            service: { select: { title: true } },
            package: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: rows.map((c) => ({
        id: c.id,
        code: c.code,
        description: c.description,
        discountType: c.discountType,
        discountValue: c.discountValue,
        scopeType: c.scopeType,
        scopes: c.scopes.map((s) => ({
          categoryId: s.categoryId,
          categoryName: s.category?.name ?? null,
          serviceId: s.serviceId,
          serviceName: s.service?.title ?? null,
          packageId: s.packageId,
          packageName: s.package?.name ?? null,
        })),
        startsAt: c.startsAt?.toISOString() ?? null,
        endsAt: c.endsAt?.toISOString() ?? null,
        isActive: c.isActive,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Get all coupons error:", err);
    return { success: false, error: "Failed to load coupons" };
  }
}

function scopesToCreateData(scopes: { categoryId?: string; serviceId?: string; packageId?: string }[]) {
  return scopes.map((s) => ({
    categoryId: s.categoryId ?? null,
    serviceId: s.serviceId ?? null,
    packageId: s.packageId ?? null,
  }));
}

export async function createCouponAction(input: unknown): Promise<ActionResponse<{ id: string }>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const validated = couponSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  try {
    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return { success: false, error: "A coupon with this code already exists", errors: { code: ["Code already in use"] } };
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        scopeType: data.scopeType,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        isActive: data.isActive,
        scopes: data.scopeType === "SPECIFIC" ? { create: scopesToCreateData(data.scopes) } : undefined,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, data: { id: coupon.id } };
  } catch (err) {
    console.error("Create coupon error:", err);
    return { success: false, error: "Failed to create coupon" };
  }
}

export async function updateCouponAction(id: string, input: unknown): Promise<ActionResponse<null>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const validated = couponSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  try {
    const existing = await prisma.coupon.findFirst({ where: { code: data.code, NOT: { id } } });
    if (existing) {
      return { success: false, error: "A coupon with this code already exists", errors: { code: ["Code already in use"] } };
    }

    await prisma.$transaction(async (tx) => {
      await tx.couponScope.deleteMany({ where: { couponId: id } });
      await tx.coupon.update({
        where: { id },
        data: {
          code: data.code,
          description: data.description || null,
          discountType: data.discountType,
          discountValue: data.discountValue,
          scopeType: data.scopeType,
          startsAt: data.startsAt ? new Date(data.startsAt) : null,
          endsAt: data.endsAt ? new Date(data.endsAt) : null,
          isActive: data.isActive,
          scopes: data.scopeType === "SPECIFIC" ? { create: scopesToCreateData(data.scopes) } : undefined,
        },
      });
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    console.error("Update coupon error:", err);
    return { success: false, error: "Failed to update coupon" };
  }
}

export async function setCouponActiveAction(id: string, isActive: boolean): Promise<ActionResponse<null>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    await prisma.coupon.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    console.error("Set coupon active error:", err);
    return { success: false, error: "Failed to update coupon" };
  }
}

export async function deleteCouponAction(id: string): Promise<ActionResponse<null>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    await prisma.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err) {
    console.error("Delete coupon error:", err);
    return { success: false, error: "Failed to delete coupon" };
  }
}

/** Customer-facing preview — DiscountCodeForm calls this to show the
 *  discount before checkout; createLiveCallAction/createRazorpayOrderAction
 *  re-run resolveCouponDiscount themselves rather than trusting this
 *  response, so the charged amount can never diverge from what's previewed
 *  here. */
export async function validateCouponAction(code: string, cartItems: CouponCartItem[]): Promise<ActionResponse<CouponResolution>> {
  try {
    const result = await resolveCouponDiscount(code, cartItems);
    if (!result.ok) return { success: false, error: result.error };
    return { success: true, data: result.data };
  } catch (err) {
    console.error("Validate coupon error:", err);
    return { success: false, error: "Couldn't validate this coupon. Please try again." };
  }
}
