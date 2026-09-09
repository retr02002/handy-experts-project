"use server";

import { randomInt } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { createLiveCallSchema, type CreateLiveCallInput } from "@/lib/validations/livecall.schema";
import { haversineKm } from "@/lib/geo";
import { LOCATION_NOT_SET, VENDOR_INACTIVE } from "@/lib/constants";
import { requireAdmin } from "@/lib/require-admin";
import { notifyAllAdmins } from "@/actions/notification.actions";

async function requireCustomerId(): Promise<{ userId: string | null; error: string | null }> {
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
async function forwardGeocodeAddress(data: CreateLiveCallInput): Promise<{ latitude: number; longitude: number } | null> {
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

async function resolveCoordinates(data: CreateLiveCallInput): Promise<{ latitude: number; longitude: number } | null> {
  if (data.latitude !== null && data.longitude !== null) {
    return { latitude: data.latitude, longitude: data.longitude };
  }
  return forwardGeocodeAddress(data);
}

const TAX_RATE = 0.18;
const EXPIRY_MINUTES = 15;

/**
 * Gives a customer their two permanent 4-digit PINs if they don't have them
 * yet — one to start a job, a different one to complete it.
 */
async function ensureServicePins(userId: string): Promise<void> {
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

    const subtotal = cartRows.reduce((sum, row) => sum + row.package.price * row.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    // Both PINs are fixed for life and generated on the first order — the
    // customer reads one out to start a job and the other to close it.
    await ensureServicePins(userId);

    const liveCall = await prisma.$transaction(async (tx) => {
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
          paymentMode: data.paymentMode,
          upiRef: data.upiRef,
          paymentScreenshotUrl: data.paymentScreenshotUrl ?? null,
          scheduledFor: data.scheduledFor,
          subtotal,
          tax,
          total,
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
    const rows = await prisma.liveCall.findMany({
      where: { customerId: userId },
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
  upiRef: string;
  /** Whoever accepted the job — the customer's escalation path. */
  vendorName: string | null;
  vendorPhone: string | null;
  vendorEmail: string | null;
  subtotal: number;
  tax: number;
  total: number;
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
        upiRef: r.upiRef,
        vendorName: r.serviceCall?.vendor.companyName ?? null,
        vendorPhone: r.serviceCall?.vendor.user.phone ?? null,
        vendorEmail: r.serviceCall?.vendor.user.email ?? null,
        subtotal: r.subtotal,
        tax: r.tax,
        total: r.total,
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
        startPin: r.customer.startPin,
        completionPin: r.customer.completionPin,
        assignedAt: r.serviceCall?.assignedAt?.toISOString() ?? null,
        startedAt: r.serviceCall?.startedAt?.toISOString() ?? null,
        completedAt: r.serviceCall?.completedAt?.toISOString() ?? null,
        cancelledAt: r.serviceCall?.cancelledAt?.toISOString() ?? null,
      },
    };
  } catch (err) {
    console.error("Get my order detail error:", err);
    return { success: false, error: "Failed to load order details" };
  }
}

async function requireVendorProfile(): Promise<
  { vendor: { id: string; latitude: number; longitude: number }; error: null } | { vendor: null; error: string }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { vendor: null, error: "Not signed in as a vendor" };
  }

  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, latitude: true, longitude: true, isActive: true },
  });
  if (!profile) return { vendor: null, error: "Vendor profile not found" };
  if (!profile.isActive) return { vendor: null, error: VENDOR_INACTIVE };
  if (profile.latitude === null || profile.longitude === null) {
    return { vendor: null, error: LOCATION_NOT_SET };
  }

  return { vendor: { id: profile.id, latitude: profile.latitude, longitude: profile.longitude }, error: null };
}

export interface LiveCallItemDetail {
  packageName: string;
  quantity: number;
  unitPrice: number;
}

export interface NearbyLiveCall {
  id: string;
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
  upiRef: string;
  paymentScreenshotUrl: string | null;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  expiresAt: string | null;
  distanceKm: number;
  items: LiveCallItemDetail[];
}

export async function getNearbyLiveCallsForVendorAction(): Promise<ActionResponse<NearbyLiveCall[]>> {
  const { vendor, error } = await requireVendorProfile();
  if (!vendor) return { success: false, error: error! };

  try {
    // Lazily expire stale broadcasts before reading — keeps this list (and
    // later, admin's all-calls view) accurate without needing a cron job.
    await prisma.liveCall.updateMany({
      where: { status: "BROADCASTING", expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });

    // Independent queries — this endpoint is polled every 10s, so running
    // them in parallel (and capping the call list) matters.
    //
    // Eligibility is gated by the vendor's own serviceable-area circles
    // rather than a flat radius from their business location — a vendor
    // with zero areas sees zero calls by design (they haven't set up
    // coverage yet). distanceKm below is still measured from the business
    // location purely for sort order, not for eligibility.
    const [calls, areas] = await Promise.all([
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
    ]);

    const nearby = calls
      .map((call) => ({
        id: call.id,
        customerName: call.customerName,
        customerPhone: call.customerPhone,
        siteContactName: call.siteContactName,
        siteContactPhone: call.siteContactPhone,
        customerEmail: call.customerEmail,
        address: call.address,
        city: call.city,
        state: call.state,
        pincode: call.pincode,
        latitude: call.latitude,
        longitude: call.longitude,
        paymentMode: call.paymentMode,
        upiRef: call.upiRef,
        paymentScreenshotUrl: call.paymentScreenshotUrl,
        subtotal: call.subtotal,
        tax: call.tax,
        total: call.total,
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
  upiRef: string;
  paymentScreenshotUrl: string | null;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  expiresAt: string | null;
  acceptedByVendorName: string | null;
  items: LiveCallItemDetail[];
}

/** Admin sees every live call, unfiltered by proximity or status. */
export async function getAllLiveCallsAction(): Promise<ActionResponse<AdminLiveCall[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    await prisma.liveCall.updateMany({
      where: { status: "BROADCASTING", expiresAt: { lt: new Date() } },
      data: { status: "EXPIRED" },
    });

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
        upiRef: c.upiRef,
        paymentScreenshotUrl: c.paymentScreenshotUrl,
        subtotal: c.subtotal,
        tax: c.tax,
        total: c.total,
        createdAt: c.createdAt.toISOString(),
        expiresAt: c.expiresAt?.toISOString() ?? null,
        acceptedByVendorName: c.acceptedByVendor?.companyName ?? null,
        items: c.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
      })),
    };
  } catch (err) {
    console.error("Get all live calls error:", err);
    return { success: false, error: "Failed to load live calls" };
  }
}
