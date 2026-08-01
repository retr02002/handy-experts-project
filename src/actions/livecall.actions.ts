"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { createLiveCallSchema, type CreateLiveCallInput } from "@/lib/validations/livecall.schema";
import { haversineKm, DEFAULT_RADIUS_KM } from "@/lib/geo";
import { LOCATION_NOT_SET } from "@/lib/constants";
import { requireAdmin } from "@/lib/require-admin";

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

    const liveCall = await prisma.$transaction(async (tx) => {
      const created = await tx.liveCall.create({
        data: {
          customerId: userId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: coords.latitude,
          longitude: coords.longitude,
          paymentMode: data.paymentMode,
          upiRef: data.upiRef,
          paymentScreenshotUrl: data.paymentScreenshotUrl,
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
    return { success: true, data: { liveCallId: liveCall.id } };
  } catch (err) {
    console.error("Create live call error:", err);
    return { success: false, error: "Failed to place your order. Please try again." };
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
    select: { id: true, latitude: true, longitude: true },
  });
  if (!profile) return { vendor: null, error: "Vendor profile not found" };
  if (profile.latitude === null || profile.longitude === null) {
    return { vendor: null, error: LOCATION_NOT_SET };
  }

  return { vendor: { id: profile.id, latitude: profile.latitude, longitude: profile.longitude }, error: null };
}

export interface NearbyLiveCall {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  total: number;
  createdAt: string;
  distanceKm: number;
  items: { packageName: string; quantity: number; unitPrice: number }[];
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

    const calls = await prisma.liveCall.findMany({
      where: { status: "BROADCASTING" },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const nearby = calls
      .map((call) => ({
        id: call.id,
        customerName: call.customerName,
        customerPhone: call.customerPhone,
        address: call.address,
        city: call.city,
        pincode: call.pincode,
        latitude: call.latitude,
        longitude: call.longitude,
        total: call.total,
        createdAt: call.createdAt.toISOString(),
        distanceKm: haversineKm(vendor.latitude, vendor.longitude, call.latitude, call.longitude),
        items: call.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
      }))
      .filter((call) => call.distanceKm <= DEFAULT_RADIUS_KM)
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
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  total: number;
  createdAt: string;
  acceptedByVendorName: string | null;
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
      include: { acceptedByVendor: { select: { companyName: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return {
      success: true,
      data: calls.map((c) => ({
        id: c.id,
        status: c.status,
        customerName: c.customerName,
        city: c.city,
        pincode: c.pincode,
        latitude: c.latitude,
        longitude: c.longitude,
        total: c.total,
        createdAt: c.createdAt.toISOString(),
        acceptedByVendorName: c.acceptedByVendor?.companyName ?? null,
      })),
    };
  } catch (err) {
    console.error("Get all live calls error:", err);
    return { success: false, error: "Failed to load live calls" };
  }
}
