import { prisma } from "@/lib/prisma";
import { getPackageServiceCategoryMap } from "@/lib/technicianSkills";

export interface CouponCartItem {
  packageId: string;
  unitPrice: number;
  quantity: number;
}

export interface CouponResolution {
  couponCode: string;
  discountAmount: number;
}

/**
 * Looks up a coupon code, checks it's active and within its schedule, and
 * computes the discount against only the cart items it's actually scoped to
 * — a "10% off AC services" code must not discount an unrelated haircut
 * sitting in the same cart. Never trusts a client-computed discount: both
 * DiscountCodeForm's preview call and createLiveCallAction/
 * createRazorpayOrderAction's order-creation re-validation share this exact
 * function, so the charged amount can never diverge from what was shown.
 */
export async function resolveCouponDiscount(
  code: string,
  cartItems: CouponCartItem[]
): Promise<{ ok: true; data: CouponResolution } | { ok: false; error: string }> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) return { ok: false, error: "Enter a coupon code" };

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
    include: { scopes: true },
  });
  if (!coupon || !coupon.isActive) {
    return { ok: false, error: "Invalid or expired coupon code" };
  }

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { ok: false, error: "This coupon isn't active yet" };
  }
  if (coupon.endsAt && now > coupon.endsAt) {
    return { ok: false, error: "This coupon has expired" };
  }

  let eligibleSubtotal: number;

  if (coupon.scopeType === "ALL") {
    eligibleSubtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  } else {
    const categoryIds = new Set(coupon.scopes.map((s) => s.categoryId).filter((id): id is string => !!id));
    const serviceIds = new Set(coupon.scopes.map((s) => s.serviceId).filter((id): id is string => !!id));
    const packageIds = new Set(coupon.scopes.map((s) => s.packageId).filter((id): id is string => !!id));

    const packageCategoryMap = await getPackageServiceCategoryMap(cartItems.map((i) => i.packageId));

    eligibleSubtotal = cartItems.reduce((sum, item) => {
      const resolved = packageCategoryMap.get(item.packageId);
      const isEligible =
        packageIds.has(item.packageId) ||
        (!!resolved?.serviceId && serviceIds.has(resolved.serviceId)) ||
        (!!resolved?.categoryId && categoryIds.has(resolved.categoryId));
      return isEligible ? sum + item.unitPrice * item.quantity : sum;
    }, 0);

    if (eligibleSubtotal === 0) {
      return { ok: false, error: "This coupon doesn't apply to anything in your cart" };
    }
  }

  const rawDiscount = coupon.discountType === "PERCENTAGE" ? eligibleSubtotal * (coupon.discountValue / 100) : coupon.discountValue;
  const discountAmount = Math.round(Math.min(rawDiscount, eligibleSubtotal));

  return { ok: true, data: { couponCode: coupon.code, discountAmount } };
}
