"use server";

import { randomInt } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import {
  createLiveCallSchema,
  cancelOrderSchema,
  type CreateLiveCallInput,
  type CheckoutDetailsInput,
} from "@/lib/validations/livecall.schema";
import { haversineKm } from "@/lib/geo";
import { LOCATION_NOT_SET, VENDOR_INACTIVE, LIVE_CALL_EXPIRY_MINUTES } from "@/lib/constants";
import { requireAdmin } from "@/lib/require-admin";
import { notifyAllAdmins } from "@/actions/notification.actions";
import { getPackageServiceCategoryMap } from "@/lib/technicianSkills";
import { computeOrderTotal, computeLeadPrice } from "@/lib/pricing";
import { resolveCouponDiscount } from "@/lib/coupons";
import { getCityCode, getAreaCode } from "@/lib/locationCodes";
import { nextSequence } from "@/lib/sequenceCounter";

export async function requireCustomerId(): Promise<{ userId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { userId: null, error: "Not signed in" };
  if (session.user.role !== "CUSTOMER") {
    return { userId: null, error: "Only customer accounts can place orders" };
  }
  return { userId: session.user.id, error: null };
}

async function tryGeocodeQuery(query: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "User-Agent": "Handyzo/1.0 (hello@Handyzo.in)" } }
    );
    if (!res.ok) return null;
    const results = await res.json();
    const top = results?.[0];
    if (!top) return null;
    const latitude = parseFloat(top.lat);
    const longitude = parseFloat(top.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { latitude, longitude };
  } catch (error) {
    console.error("Forward geocode fallback failed:", error);
    return null;
  }
}

/**
 * Fallback for when the customer typed/edited their address manually instead
 * of using "use current location" — geocodes the typed address server-side
 * so nearby-vendor matching still has coordinates, rather than blocking
 * checkout outright. Reuses the same free Nominatim API as
 * reverseGeocodeAction (src/actions/location.actions.ts), just the /search
 * endpoint instead of /reverse.
 *
 * `address` is frequently already a full reverse-geocoded display name (see
 * DetailsStep's "use current location" handler), so appending city/state/
 * pincode to it again over-specifies the query and Nominatim returns nothing
 * — try the address alone first, then fall back to progressively broader,
 * city-level queries rather than a single all-or-nothing attempt.
 */
type AddressGeoInput = Pick<CheckoutDetailsInput, "address" | "city" | "state" | "pincode">;

async function forwardGeocodeAddress(data: AddressGeoInput): Promise<{ latitude: number; longitude: number } | null> {
  const candidates = [
    data.address,
    `${data.address}, ${data.pincode}`,
    `${data.city}, ${data.state}, ${data.pincode}`,
  ];
  for (const query of candidates) {
    const result = await tryGeocodeQuery(query);
    if (result) return result;
  }
  return null;
}

export async function resolveCoordinates(
  data: AddressGeoInput & Pick<CheckoutDetailsInput, "latitude" | "longitude">
): Promise<{ latitude: number; longitude: number } | null> {
  if (data.latitude !== null && data.longitude !== null) {
    return { latitude: data.latitude, longitude: data.longitude };
  }
  return forwardGeocodeAddress(data);
}

/**
 * Gives a customer their two permanent 4-digit PINs if they don't have them
 * yet — one to start a job, a different one to complete it.
 */
export async function ensureServicePins(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { startPin: true, completionPin: true },
  });
  if (user?.startPin && user.completionPin) return;

  const startPin = user?.startPin ?? String(randomInt(1000, 10000));
  let completionPin = user?.completionPin ?? String(randomInt(1000, 10000));
  while (completionPin === startPin) completionPin = String(randomInt(1000, 10000));

  await prisma.user.update({ where: { id: userId }, data: { startPin, completionPin } });
}

/**
 * Lazily expire abandoned online-checkout attempts (AWAITING_PAYMENT) — a
 * customer who never completes/returns from Razorpay's checkout leaves a row
 * that expires here, no cron job needed. Deliberately NOT applied to
 * BROADCASTING: a customer may already have paid for that order, and
 * auto-expiring a paid, unclaimed call turns it into a refund the business
 * eats for no reason — it stays broadcasting until either a vendor buys it
 * or the customer explicitly cancels via cancelMyOrderAction.
 *
 * Any wallet balance reserved against one of these rows (see
 * createRazorpayOrderAction) is refunded back before the row expires — the
 * customer never loses money to an abandoned checkout attempt.
 */
async function sweepExpiredAwaitingPayment(): Promise<void> {
  const expiring = await prisma.liveCall.findMany({
    where: { status: "AWAITING_PAYMENT", expiresAt: { lt: new Date() }, walletAmountApplied: { gt: 0 } },
    select: { id: true, customerId: true, walletAmountApplied: true },
  });

  for (const row of expiring) {
    await prisma.$transaction(async (tx) => {
      const claim = await tx.liveCall.updateMany({
        where: { id: row.id, status: "AWAITING_PAYMENT" },
        data: { status: "EXPIRED" },
      });
      if (claim.count === 0) return; // already handled by a concurrent sweep
      const wallet = await tx.customerWallet.upsert({
        where: { userId: row.customerId },
        create: { userId: row.customerId },
        update: {},
        select: { id: true },
      });
      await tx.customerWallet.update({ where: { id: wallet.id }, data: { balance: { increment: row.walletAmountApplied } } });
      await tx.customerWalletTransaction.create({
        data: { walletId: wallet.id, type: "REFUND", amount: row.walletAmountApplied, liveCallId: row.id },
      });
    });
  }

  // Everything else with no wallet reservation to refund sweeps in one batch.
  await prisma.liveCall.updateMany({
    where: { status: "AWAITING_PAYMENT", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });
}

export async function createLiveCallAction(input: CreateLiveCallInput): Promise<ActionResponse<{ liveCallId: string }>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  const validated = createLiveCallSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  const coords = await resolveCoordinates(data);
  if (!coords) {
    return {
      success: false,
      error: 'We couldn\'t pin your location from the address entered. Please tap "Use current location" or refine your address.',
    };
  }

  try {
    // Cart contents/prices are re-fetched here rather than trusted from the
    // client — the payload only carries customer/payment details.
    const cartRows = await prisma.cartItem.findMany({
      where: { userId, status: "ACTIVE" },
      include: { package: true },
    });

    if (cartRows.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    const rawSubtotal = cartRows.reduce((sum, row) => sum + row.package.price * row.quantity, 0);

    // Re-validated here regardless of whether DiscountCodeForm already
    // previewed it — never trust a client-claimed discount amount.
    let couponCode: string | null = null;
    let discountAmount = 0;
    if (data.couponCode) {
      const couponResult = await resolveCouponDiscount(
        data.couponCode,
        cartRows.map((row) => ({ packageId: row.packageId, unitPrice: row.package.price, quantity: row.quantity }))
      );
      if (!couponResult.ok) {
        return { success: false, error: couponResult.error };
      }
      couponCode = couponResult.data.couponCode;
      discountAmount = couponResult.data.discountAmount;
    }

    const { subtotal, tax, total } = computeOrderTotal(rawSubtotal - discountAmount);
    const expiresAt = new Date(Date.now() + LIVE_CALL_EXPIRY_MINUTES * 60 * 1000);

    // Both PINs are fixed for life and generated on the first order — the
    // customer reads one out to start a job and the other to close it.
    await ensureServicePins(userId);

    // Never trust the client's requested wallet amount — clamp to the real
    // balance and the real total. A COD order is finalized immediately (no
    // AWAITING_PAYMENT window), so the debit here is permanent right away —
    // unlike the online path, there's no abandon scenario to refund back.
    const existingWallet = await prisma.customerWallet.findUnique({ where: { userId }, select: { balance: true } });
    const walletApplied = Math.min(data.walletAmountRequested, existingWallet?.balance ?? 0, total);
    const remainder = total - walletApplied;
    const paymentMode = remainder === 0 ? "WALLET" : "COD";
    const paymentStatus = remainder === 0 ? "PAID" : "COD";

    const liveCall = await prisma.$transaction(async (tx) => {
      if (walletApplied > 0) {
        const debited = await tx.customerWallet.updateMany({
          where: { userId, balance: { gte: walletApplied } },
          data: { balance: { decrement: walletApplied } },
        });
        if (debited.count === 0) {
          throw new Error("WALLET_BALANCE_CHANGED");
        }
      }

      const orderCityCode = getCityCode(data.city);
      const orderLocalityCode = getAreaCode(data.locality, orderCityCode);
      const orderSeq = await nextSequence(`ORDER:${orderCityCode}`, tx);

      const created = await tx.liveCall.create({
        data: {
          customerId: userId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          siteContactName: data.siteContactName ?? null,
          siteContactPhone: data.siteContactPhone ?? null,
          customerEmail: data.customerEmail,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: coords.latitude,
          longitude: coords.longitude,
          locality: data.locality,
          orderCityCode,
          orderLocalityCode,
          orderSeq,
          // This action is the COD / wallet-only path — Pay Online goes
          // through createRazorpayOrderAction instead, which starts the
          // LiveCall in AWAITING_PAYMENT and only broadcasts it once payment
          // is verified. Neither COD nor a fully-wallet-covered order needs
          // that gate, so both broadcast immediately.
          paymentMode,
          paymentStatus,
          upiRef: null,
          paymentScreenshotUrl: null,
          scheduledFor: data.scheduledFor,
          subtotal,
          tax,
          total,
          walletAmountApplied: walletApplied,
          couponCode,
          discountAmount,
          expiresAt,
          items: {
            create: cartRows.map((row) => ({
              packageId: row.packageId,
              packageName: row.package.name,
              unitPrice: row.package.price,
              quantity: row.quantity,
            })),
          },
        },
      });

      if (walletApplied > 0) {
        const wallet = await tx.customerWallet.findUniqueOrThrow({ where: { userId }, select: { id: true } });
        await tx.customerWalletTransaction.create({
          data: { walletId: wallet.id, type: "REDEEM", amount: walletApplied, liveCallId: created.id },
        });
      }

      // Same transaction as the order creation — if anything above fails,
      // the cart must not be silently emptied.
      await tx.cartItem.deleteMany({ where: { userId, status: "ACTIVE" } });

      return created;
    });

    revalidatePath("/cart");
    // Best-effort — never let a notification failure fail the order itself.
    notifyAllAdmins(
      "NEW_LIVE_CALL",
      "New live call",
      `${data.customerName} placed an order in ${data.city} — ₹${total}.`,
      liveCall.id
    );
    return { success: true, data: { liveCallId: liveCall.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "WALLET_BALANCE_CHANGED") {
      return { success: false, error: "Your wallet balance changed — please review your order and try again." };
    }
    console.error("Create live call error:", err);
    return { success: false, error: "Failed to place your order. Please try again." };
  }
}

/**
 * A LiveCall's real state plus its optional ServiceCall collapsed into one
 * customer-facing status. "FINDING_PROFESSIONAL" covers both BROADCASTING
 * and vendor-ACCEPTED (a vendor has claimed it but no technician has
 * accepted their offer yet) — the customer doesn't need that distinction.
 */
export type OrderDisplayStatus =
  | "FINDING_PROFESSIONAL"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

function deriveOrderStatus(liveCallStatus: string, serviceCallStatus: string | undefined): OrderDisplayStatus {
  // A vendor has taken the job but nobody's claimed it yet — from the
  // customer's side that's still "we're finding you a professional"; the
  // vendor/technician split isn't their concern.
  if (serviceCallStatus === "UNASSIGNED") return "FINDING_PROFESSIONAL";
  if (serviceCallStatus) return serviceCallStatus as OrderDisplayStatus;
  if (liveCallStatus === "EXPIRED") return "EXPIRED";
  if (liveCallStatus === "CANCELLED") return "CANCELLED";
  return "FINDING_PROFESSIONAL";
}

export interface CustomerOrderSummary {
  id: string;
  itemSummary: string;
  itemCount: number;
  total: number;
  status: OrderDisplayStatus;
  scheduledFor: string | null;
  createdAt: string;
}

export async function getMyOrdersAction(): Promise<ActionResponse<CustomerOrderSummary[]>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  try {
    // AWAITING_PAYMENT rows are in-progress checkout attempts, not placed
    // orders — nothing was charged and no vendor was ever notified, so they
    // shouldn't appear in order history. They're invisible here the same way
    // they're invisible to vendor/admin matching, and they self-clean via
    // the expiry sweep if abandoned.
    const rows = await prisma.liveCall.findMany({
      where: { customerId: userId, status: { not: "AWAITING_PAYMENT" } },
      include: { items: true, serviceCall: { select: { status: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        itemSummary: r.items.map((i) => i.packageName).join(", "),
        itemCount: r.items.reduce((sum, i) => sum + i.quantity, 0),
        total: r.total,
        status: deriveOrderStatus(r.status, r.serviceCall?.status),
        scheduledFor: r.scheduledFor?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Get my orders error:", err);
    return { success: false, error: "Failed to load your orders" };
  }
}

export interface CustomerOrderDetail {
  id: string;
  /** Null until a vendor accepts and the job record exists. */
  serviceCallId: string | null;
  status: OrderDisplayStatus;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  paymentMode: string;
  createdByAdminName: string | null;
  upiRef: string | null;
  /** Null means "predates payment-status tracking" (an old order). */
  paymentStatus: string | null;
  /** Whoever accepted the job — the customer's escalation path. */
  vendorName: string | null;
  vendorPhone: string | null;
  vendorEmail: string | null;
  subtotal: number;
  tax: number;
  total: number;
  /**
   * What the customer originally paid, when the vendor has since revised the
   * job's services. Null when the job has never been edited.
   */
  originalTotal: number | null;
  items: LiveCallItemDetail[];
  scheduledFor: string | null;
  createdAt: string;
  acceptedAt: string | null;
  technicianId: string | null;
  technicianName: string | null;
  technicianPhone: string | null;
  /** Credentials for the Rapido-style "who's coming" card. */
  technicianSkill: string | null;
  technicianExperienceYears: number | null;
  technicianRatingAvg: number | null;
  technicianRatingCount: number;
  /** True once this customer has rated the job — the rate card hides after that. */
  hasReview: boolean;
  /** The customer's own fixed PINs — only ever returned to the customer. */
  startPin: string | null;
  completionPin: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  /** Set only for a customer-initiated cancel (see cancelMyOrderAction). */
  cancelReason: string | null;
  /** True only while the order is still unclaimed (BROADCASTING) — the
   *  window in which cancelMyOrderAction is allowed. Once a vendor accepts,
   *  cancellation goes through the ServiceCall's own status flow instead. */
  canCancel: boolean;
}

export async function getMyOrderDetailAction(liveCallId: string): Promise<ActionResponse<CustomerOrderDetail>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  try {
    const r = await prisma.liveCall.findFirst({
      where: { id: liveCallId, customerId: userId },
      include: {
        items: true,
        customer: { select: { startPin: true, completionPin: true } },
        serviceCall: {
          include: {
            technician: { include: { user: { select: { name: true, phone: true } } } },
            vendor: { select: { companyName: true, user: { select: { phone: true, email: true } } } },
            review: { select: { id: true } },
          },
        },
      },
    });
    if (!r) return { success: false, error: "Order not found" };

    return {
      success: true,
      data: {
        id: r.id,
        serviceCallId: r.serviceCall?.id ?? null,
        status: deriveOrderStatus(r.status, r.serviceCall?.status),
        address: r.address,
        city: r.city,
        state: r.state,
        pincode: r.pincode,
        latitude: r.latitude,
        longitude: r.longitude,
        paymentMode: r.paymentMode,
        createdByAdminName: r.createdByAdminName,
        upiRef: r.upiRef,
        paymentStatus: r.paymentStatus,
        vendorName: r.serviceCall?.vendor.companyName ?? null,
        vendorPhone: r.serviceCall?.vendor.user.phone ?? null,
        vendorEmail: r.serviceCall?.vendor.user.email ?? null,
        subtotal: r.subtotal,
        tax: r.tax,
        total: r.total,
        originalTotal: r.originalTotal,
        items: r.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
        scheduledFor: r.scheduledFor?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
        acceptedAt: r.acceptedAt?.toISOString() ?? null,
        technicianId: r.serviceCall?.technician?.id ?? null,
        technicianName: r.serviceCall?.technician?.user.name ?? null,
        technicianPhone: r.serviceCall?.technician?.user.phone ?? null,
        technicianSkill: r.serviceCall?.technician?.skillCategory ?? null,
        technicianExperienceYears: r.serviceCall?.technician?.experienceYears ?? null,
        technicianRatingAvg: r.serviceCall?.technician?.ratingAvg ?? null,
        technicianRatingCount: r.serviceCall?.technician?.ratingCount ?? 0,
        hasReview: !!r.serviceCall?.review,
        // An admin-created order's own per-order PIN (see LiveCall.startPin
        // in schema.prisma) takes priority over the customer account's
        // permanent PIN when set.
        startPin: r.startPin ?? r.customer.startPin,
        completionPin: r.completionPin ?? r.customer.completionPin,
        assignedAt: r.serviceCall?.assignedAt?.toISOString() ?? null,
        startedAt: r.serviceCall?.startedAt?.toISOString() ?? null,
        completedAt: r.serviceCall?.completedAt?.toISOString() ?? null,
        cancelledAt: r.serviceCall?.cancelledAt?.toISOString() ?? r.cancelledAt?.toISOString() ?? null,
        cancelReason: r.cancelReason,
        canCancel: r.status === "BROADCASTING",
      },
    };
  } catch (err) {
    console.error("Get my order detail error:", err);
    return { success: false, error: "Failed to load order details" };
  }
}

/**
 * Self-service cancel for a still-unclaimed order — the only window this is
 * allowed in, since once a vendor accepts, the job is a real commitment on
 * their end and cancellation goes through the ServiceCall status flow
 * instead. A cancelled online-paid order is flagged REFUND_PENDING for an
 * admin to process manually (refunds aren't automated yet); COD has nothing
 * to refund, so it's just marked CANCELLED.
 */
export async function cancelMyOrderAction(input: unknown): Promise<ActionResponse<{ liveCallId: string }>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  const validated = cancelOrderSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { liveCallId, reason } = validated.data;

  try {
    const liveCall = await prisma.liveCall.findFirst({
      where: { id: liveCallId, customerId: userId },
      select: { status: true, paymentMode: true, paymentStatus: true, customerName: true, city: true, total: true },
    });
    if (!liveCall) return { success: false, error: "Order not found" };
    if (liveCall.status !== "BROADCASTING") {
      return {
        success: false,
        error:
          liveCall.status === "CONVERTED"
            ? "A professional has already accepted this order — contact them or support to cancel."
            : "This order can no longer be cancelled.",
      };
    }

    const needsRefund = liveCall.paymentMode === "ONLINE" && liveCall.paymentStatus === "PAID";

    // Conditional claim: if a vendor accepts in the instant between the read
    // above and this write, count is 0 and the customer gets a clean error
    // instead of cancelling a job someone just took. The wallet credit for a
    // paid order rides in the same transaction as the claim — crediting our
    // own ledger doesn't need a real gateway call, so this is fully
    // automatic, no admin "process the refund" step.
    const claimed = await prisma.$transaction(async (tx) => {
      const claim = await tx.liveCall.updateMany({
        where: { id: liveCallId, customerId: userId, status: "BROADCASTING" },
        data: {
          status: "CANCELLED",
          cancelReason: reason,
          cancelledAt: new Date(),
          paymentStatus: needsRefund ? "REFUNDED" : liveCall.paymentStatus,
        },
      });
      if (claim.count === 0) return false;

      if (needsRefund) {
        const wallet = await tx.customerWallet.upsert({
          where: { userId },
          create: { userId },
          update: {},
          select: { id: true },
        });
        await tx.customerWallet.update({ where: { id: wallet.id }, data: { balance: { increment: liveCall.total } } });
        await tx.customerWalletTransaction.create({
          data: { walletId: wallet.id, type: "REFUND", amount: liveCall.total, liveCallId },
        });
      }
      return true;
    });
    if (!claimed) {
      return { success: false, error: "A professional just accepted this order — it can no longer be cancelled here." };
    }

    revalidatePath(`/customer/orders/${liveCallId}`);
    revalidatePath("/customer/orders");
    notifyAllAdmins(
      "CALL_CANCELLED",
      "Order cancelled by customer",
      `${liveCall.customerName} cancelled their ₹${liveCall.total} order in ${liveCall.city}: "${reason}"${
        needsRefund ? ` — ₹${liveCall.total} refunded to their wallet` : ""
      }.`,
      liveCallId
    );
    return { success: true, data: { liveCallId } };
  } catch (err) {
    console.error("Cancel order error:", err);
    return { success: false, error: "Failed to cancel your order. Please try again." };
  }
}

async function requireVendorProfile(): Promise<
  | {
      vendor: {
        id: string;
        latitude: number;
        longitude: number;
        leadPricingType: string;
        leadPricingValue: number;
      };
      error: null;
    }
  | { vendor: null; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { vendor: null, error: "Not signed in as a vendor" };
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, latitude: true, longitude: true, isActive: true, leadPricingType: true, leadPricingValue: true },
  });
  if (!profile) return { vendor: null, error: "Vendor profile not found" };
  if (!profile.isActive) return { vendor: null, error: VENDOR_INACTIVE };
  if (profile.latitude === null || profile.longitude === null) {
    return { vendor: null, error: LOCATION_NOT_SET };
  }

  return {
    vendor: {
      id: profile.id,
      latitude: profile.latitude,
      longitude: profile.longitude,
      leadPricingType: profile.leadPricingType,
      leadPricingValue: profile.leadPricingValue,
    },
    error: null,
  };
}

export interface LiveCallItemDetail {
  packageName: string;
  quantity: number;
  unitPrice: number;
}

/** First 2 digits shown, rest masked — e.g. "80XXXXXXXX". */
function maskPhone(phone: string): string {
  return phone.length >= 10 ? `${phone.slice(0, 2)}XXXXXXXX` : "XXXXXXXXXX";
}

function maskName(name: string): string {
  return name.trim().split(/\s+/)[0] || "Customer";
}

/**
 * Masked-by-default — a vendor only sees a customer's first name, a
 * partially-hidden phone, and no address/payment details until they buy the
 * lead (buyLiveCallAction). Every row this action returns is always
 * pre-purchase (a bought call immediately leaves BROADCASTING, see
 * buyLiveCallAction), so there is no "reveal" branch here — the one-time
 * full-detail payload comes back from buyLiveCallAction's own response
 * instead.
 */
export interface NearbyLiveCall {
  id: string;
  customerFirstName: string;
  customerPhoneMasked: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  total: number;
  /** What buying this specific lead costs this vendor right now. */
  leadPrice: number;
  createdAt: string;
  expiresAt: string | null;
  distanceKm: number;
  items: LiveCallItemDetail[];
}

export async function getNearbyLiveCallsForVendorAction(): Promise<ActionResponse<NearbyLiveCall[]>> {
  const { vendor, error } = await requireVendorProfile();
  if (!vendor) return { success: false, error: error! };

  try {
    await sweepExpiredAwaitingPayment();

    // Independent queries — this endpoint is polled every 10s, so running
    // them in parallel (and capping the call list) matters.
    //
    // Eligibility is gated by the vendor's own serviceable-area circles
    // rather than a flat radius from their business location — a vendor
    // with zero areas sees zero calls by design (they haven't set up
    // coverage yet). distanceKm below is still measured from the business
    // location purely for sort order, not for eligibility.
    const [calls, areas, categoryLinks] = await Promise.all([
      prisma.liveCall.findMany({
        where: { status: "BROADCASTING" },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.vendorServiceArea.findMany({
        where: { vendorId: vendor.id },
        select: { latitude: true, longitude: true, radiusKm: true },
      }),
      prisma.vendorCategory.findMany({ where: { vendorId: vendor.id }, select: { categoryId: true } }),
    ]);

    // Category gate: a vendor only sees calls whose items include at least
    // one category they're assigned — the fix for a plumbing-only vendor
    // being shown a haircut order. One batched package→category resolution
    // for every distinct package across all 100 candidate calls, not one
    // query per call.
    const allowedCategoryIds = new Set(categoryLinks.map((c) => c.categoryId));
    const packageIds = calls.flatMap((c) => c.items.map((i) => i.packageId).filter((id): id is string => !!id));
    const packageCategoryMap = await getPackageServiceCategoryMap(packageIds);

    const nearby = calls
      .filter((call) =>
        call.items.some((i) => {
          const categoryId = i.packageId ? packageCategoryMap.get(i.packageId)?.categoryId : null;
          return !!categoryId && allowedCategoryIds.has(categoryId);
        })
      )
      .map((call) => ({
        id: call.id,
        customerFirstName: maskName(call.customerName),
        customerPhoneMasked: maskPhone(call.customerPhone),
        city: call.city,
        pincode: call.pincode,
        latitude: call.latitude,
        longitude: call.longitude,
        total: call.total,
        leadPrice: computeLeadPrice(call.total, vendor.leadPricingType, vendor.leadPricingValue),
        createdAt: call.createdAt.toISOString(),
        expiresAt: call.expiresAt?.toISOString() ?? null,
        distanceKm: haversineKm(vendor.latitude, vendor.longitude, call.latitude, call.longitude),
        items: call.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
      }))
      .filter((call) => areas.some((a) => haversineKm(a.latitude, a.longitude, call.latitude, call.longitude) <= a.radiusKm))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return { success: true, data: nearby };
  } catch (err) {
    console.error("Get nearby live calls error:", err);
    return { success: false, error: "Failed to load live calls" };
  }
}

export interface AdminLiveCall {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  siteContactName: string | null;
  siteContactPhone: string | null;
  customerEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  paymentMode: string;
  createdByAdminName: string | null;
  upiRef: string | null;
  paymentStatus: string | null;
  paymentScreenshotUrl: string | null;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  expiresAt: string | null;
  acceptedByVendorName: string | null;
  cancelReason: string | null;
  cancelledAt: string | null;
  items: LiveCallItemDetail[];
}

/** Admin sees every live call, unfiltered by proximity or status. */
export async function getAllLiveCallsAction(): Promise<ActionResponse<AdminLiveCall[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    await sweepExpiredAwaitingPayment();

    const calls = await prisma.liveCall.findMany({
      include: { acceptedByVendor: { select: { companyName: true } }, items: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return {
      success: true,
      data: calls.map((c) => ({
        id: c.id,
        status: c.status,
        customerName: c.customerName,
        customerPhone: c.customerPhone,
        siteContactName: c.siteContactName,
        siteContactPhone: c.siteContactPhone,
        customerEmail: c.customerEmail,
        address: c.address,
        city: c.city,
        state: c.state,
        pincode: c.pincode,
        latitude: c.latitude,
        longitude: c.longitude,
        paymentMode: c.paymentMode,
        createdByAdminName: c.createdByAdminName,
        upiRef: c.upiRef,
        paymentStatus: c.paymentStatus,
        paymentScreenshotUrl: c.paymentScreenshotUrl,
        subtotal: c.subtotal,
        tax: c.tax,
        total: c.total,
        createdAt: c.createdAt.toISOString(),
        expiresAt: c.expiresAt?.toISOString() ?? null,
        acceptedByVendorName: c.acceptedByVendor?.companyName ?? null,
        cancelReason: c.cancelReason,
        cancelledAt: c.cancelledAt?.toISOString() ?? null,
        items: c.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
      })),
    };
  } catch (err) {
    console.error("Get all live calls error:", err);
    return { success: false, error: "Failed to load live calls" };
  }
}

