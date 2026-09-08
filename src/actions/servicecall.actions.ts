"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { notifyAllAdmins } from "@/actions/notification.actions";
import type { LiveCallItemDetail } from "@/actions/livecall.actions";
import { haversineKm } from "@/lib/geo";

// PENDING offers older than this are treated as expired whenever read —
// same lazy-expire-on-read idiom LiveCall.expiresAt already uses, no cron.
const OFFER_TTL_MS = 90_000;

async function sweepExpiredOffers(): Promise<void> {
  await prisma.serviceCallOffer.updateMany({
    where: { status: "PENDING", createdAt: { lt: new Date(Date.now() - OFFER_TTL_MS) } },
    data: { status: "EXPIRED", respondedAt: new Date() },
  });
}

/** On-duty technicians of this vendor whose own service-area coverage reaches this point. */
async function findEligibleTechnicians(
  vendorId: string,
  latitude: number,
  longitude: number
): Promise<{ id: string; userId: string }[]> {
  const technicians = await prisma.technicianProfile.findMany({
    where: { vendorId, location: { isOnDuty: true } },
    select: { id: true, userId: true, serviceAreas: { select: { latitude: true, longitude: true, radiusKm: true } } },
  });
  return technicians
    .filter((t) => t.serviceAreas.some((a) => haversineKm(a.latitude, a.longitude, latitude, longitude) <= a.radiusKm))
    .map((t) => ({ id: t.id, userId: t.userId }));
}

async function requireVendorId(): Promise<{ vendorId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { vendorId: null, error: "Not signed in as a vendor" };
  }
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { vendorId: null, error: "Vendor profile not found" };
  return { vendorId: profile.id, error: null };
}

/**
 * Vendor accepts a broadcasting live call. Unlike the old direct-assign
 * flow, this doesn't pick a technician — it computes every eligible
 * on-duty technician (decision: eligibility check happens BEFORE claiming,
 * so a vendor with nobody in range never locks a call away from other
 * vendors for nothing), claims the LiveCall via the same conditional-
 * `updateMany`-on-status guard the old flow used, then broadcasts one
 * PENDING ServiceCallOffer + JOB_OFFER notification per eligible
 * technician. The ServiceCall itself is only created once a technician
 * actually accepts their offer (see acceptJobOfferAction).
 */
export async function acceptLiveCallAction(liveCallId: string): Promise<ActionResponse<{ offerCount: number }>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { isActive: true, companyName: true },
    });
    if (!vendorProfile?.isActive) {
      return { success: false, error: "Your account is deactivated and can't accept new calls." };
    }

    const liveCall = await prisma.liveCall.findUnique({ where: { id: liveCallId } });
    if (!liveCall) return { success: false, error: "Live call not found" };
    if (liveCall.status !== "BROADCASTING") {
      return { success: false, error: "This call was already accepted by another vendor or has expired." };
    }

    const eligible = await findEligibleTechnicians(vendorId, liveCall.latitude, liveCall.longitude);
    if (eligible.length === 0) {
      return { success: false, error: "None of your on-duty technicians currently cover this location." };
    }

    const claimed = await prisma.liveCall.updateMany({
      where: { id: liveCallId, status: "BROADCASTING" },
      data: { status: "ACCEPTED", acceptedByVendorId: vendorId, acceptedAt: new Date() },
    });
    if (claimed.count === 0) {
      return { success: false, error: "This call was already accepted by another vendor or has expired." };
    }

    await prisma.serviceCallOffer.createMany({
      data: eligible.map((t) => ({ liveCallId, vendorId, technicianId: t.id })),
    });
    await prisma.notification.createMany({
      data: eligible.map((t) => ({
        userId: t.userId,
        type: "JOB_OFFER" as const,
        title: "New job offer",
        message: `A job is available at ${liveCall.address}, ${liveCall.city} — ₹${liveCall.total}.`,
        liveCallId,
      })),
    });

    revalidatePath("/vendor/live-calls");
    notifyAllAdmins(
      "CALL_ACCEPTED",
      "Live call claimed",
      `${vendorProfile.companyName} claimed a call at ${liveCall.address}, ${liveCall.city} and notified ${eligible.length} technician(s).`,
      liveCallId
    );
    return { success: true, data: { offerCount: eligible.length } };
  } catch (err) {
    console.error("Accept live call error:", err);
    return { success: false, error: "Failed to accept this call. Please try again." };
  }
}

export interface LiveCallOfferSummary {
  id: string;
  technicianId: string;
  technicianName: string;
  status: string;
  createdAt: string;
  respondedAt: string | null;
}

/** For the vendor's "awaiting technician" card — who's been offered this call and how they responded. */
export async function getPendingOffersForLiveCallAction(liveCallId: string): Promise<ActionResponse<LiveCallOfferSummary[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    await sweepExpiredOffers();
    const offers = await prisma.serviceCallOffer.findMany({
      where: { liveCallId, vendorId },
      include: { technician: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: "asc" },
    });
    return {
      success: true,
      data: offers.map((o) => ({
        id: o.id,
        technicianId: o.technicianId,
        technicianName: o.technician.user.name ?? "",
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        respondedAt: o.respondedAt?.toISOString() ?? null,
      })),
    };
  } catch (err) {
    console.error("Get pending offers error:", err);
    return { success: false, error: "Failed to load offers" };
  }
}

export interface AwaitingLiveCallSummary {
  id: string;
  itemSummary: string;
  address: string;
  city: string;
  total: number;
  acceptedAt: string | null;
  pendingCount: number;
  declinedCount: number;
  expiredCount: number;
}

/** Vendor's claimed-but-not-yet-technician-accepted calls — the "awaiting technician" list. */
export async function getMyAwaitingCallsForVendorAction(): Promise<ActionResponse<AwaitingLiveCallSummary[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    await sweepExpiredOffers();
    const calls = await prisma.liveCall.findMany({
      where: { status: "ACCEPTED", acceptedByVendorId: vendorId, serviceCall: null },
      include: { items: true, offers: true },
      orderBy: { acceptedAt: "desc" },
    });
    return {
      success: true,
      data: calls.map((c) => ({
        id: c.id,
        itemSummary: c.items.map((i) => i.packageName).join(", "),
        address: c.address,
        city: c.city,
        total: c.total,
        acceptedAt: c.acceptedAt?.toISOString() ?? null,
        pendingCount: c.offers.filter((o) => o.status === "PENDING").length,
        declinedCount: c.offers.filter((o) => o.status === "DECLINED").length,
        expiredCount: c.offers.filter((o) => o.status === "EXPIRED").length,
      })),
    };
  } catch (err) {
    console.error("Get awaiting calls error:", err);
    return { success: false, error: "Failed to load awaiting calls" };
  }
}

/** Manual retry when nobody accepted in time — re-runs eligibility and resets each eligible technician's offer to PENDING. */
export async function rebroadcastLiveCallOffersAction(liveCallId: string): Promise<ActionResponse<{ offerCount: number }>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const liveCall = await prisma.liveCall.findFirst({
      where: { id: liveCallId, acceptedByVendorId: vendorId, status: "ACCEPTED" },
    });
    if (!liveCall) return { success: false, error: "Live call not found" };

    const eligible = await findEligibleTechnicians(vendorId, liveCall.latitude, liveCall.longitude);
    if (eligible.length === 0) {
      return { success: false, error: "None of your on-duty technicians currently cover this location." };
    }

    await Promise.all(
      eligible.map((t) =>
        prisma.serviceCallOffer.upsert({
          where: { liveCallId_technicianId: { liveCallId, technicianId: t.id } },
          create: { liveCallId, vendorId, technicianId: t.id },
          update: { status: "PENDING", createdAt: new Date(), respondedAt: null },
        })
      )
    );
    await prisma.notification.createMany({
      data: eligible.map((t) => ({
        userId: t.userId,
        type: "JOB_OFFER" as const,
        title: "New job offer",
        message: `A job is available at ${liveCall.address}, ${liveCall.city} — ₹${liveCall.total}.`,
        liveCallId,
      })),
    });

    revalidatePath("/vendor/live-calls");
    return { success: true, data: { offerCount: eligible.length } };
  } catch (err) {
    console.error("Rebroadcast live call offers error:", err);
    return { success: false, error: "Failed to notify technicians. Please try again." };
  }
}

export interface ServiceCallSummary {
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
  paymentMode: string;
  upiRef: string;
  paymentScreenshotUrl: string | null;
  subtotal: number;
  tax: number;
  total: number;
  itemSummary: string;
  items: LiveCallItemDetail[];
  technicianId: string;
  technicianName: string;
  assignedAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

const serviceCallWithDetails = Prisma.validator<Prisma.ServiceCallDefaultArgs>()({
  include: {
    liveCall: { include: { items: true } },
    technician: { include: { user: { select: { name: true } } } },
  },
});
const serviceCallInclude = serviceCallWithDetails.include;
type ServiceCallRow = Prisma.ServiceCallGetPayload<typeof serviceCallWithDetails>;

function mapServiceCallRow(r: ServiceCallRow): ServiceCallSummary {
  return {
    id: r.id,
    status: r.status,
    customerName: r.liveCall.customerName,
    customerPhone: r.liveCall.customerPhone,
    siteContactName: r.liveCall.siteContactName,
    siteContactPhone: r.liveCall.siteContactPhone,
    address: r.liveCall.address,
    customerEmail: r.liveCall.customerEmail,
    city: r.liveCall.city,
    state: r.liveCall.state,
    pincode: r.liveCall.pincode,
    paymentMode: r.liveCall.paymentMode,
    upiRef: r.liveCall.upiRef,
    paymentScreenshotUrl: r.liveCall.paymentScreenshotUrl,
    subtotal: r.liveCall.subtotal,
    tax: r.liveCall.tax,
    total: r.liveCall.total,
    itemSummary: r.liveCall.items.map((i) => i.packageName).join(", "),
    items: r.liveCall.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
    technicianId: r.technicianId,
    technicianName: r.technician.user.name ?? "",
    assignedAt: r.assignedAt.toISOString(),
    startedAt: r.startedAt?.toISOString() ?? null,
    completedAt: r.completedAt?.toISOString() ?? null,
  };
}

export async function getMyServiceCallsForVendorAction(): Promise<ActionResponse<ServiceCallSummary[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const rows = await prisma.serviceCall.findMany({
      where: { vendorId },
      include: serviceCallInclude,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: rows.map(mapServiceCallRow) };
  } catch (err) {
    console.error("Get my service calls for vendor error:", err);
    return { success: false, error: "Failed to load service calls" };
  }
}

export async function getMyServiceCallsForTechnicianAction(): Promise<ActionResponse<ServiceCallSummary[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Not signed in as a technician" };
  }
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { success: false, error: "Technician profile not found" };

  try {
    const rows = await prisma.serviceCall.findMany({
      where: { technicianId: profile.id },
      include: serviceCallInclude,
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: rows.map(mapServiceCallRow) };
  } catch (err) {
    console.error("Get my service calls for technician error:", err);
    return { success: false, error: "Failed to load service calls" };
  }
}

export interface AdminServiceCallSummary extends ServiceCallSummary {
  vendorName: string;
}

/** Admin sees every service call across every vendor. */
export async function getAllServiceCallsAction(): Promise<ActionResponse<AdminServiceCallSummary[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.serviceCall.findMany({
      include: { ...serviceCallInclude, vendor: { select: { companyName: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return {
      success: true,
      data: rows.map((r) => ({ ...mapServiceCallRow(r), vendorName: r.vendor.companyName })),
    };
  } catch (err) {
    console.error("Get all service calls error:", err);
    return { success: false, error: "Failed to load service calls" };
  }
}

const SERVICE_CALL_STATUSES = ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type ServiceCallStatusValue = (typeof SERVICE_CALL_STATUSES)[number];

/** Callable by either the owning vendor or the assigned technician. */
export async function updateServiceCallStatusAction(
  id: string,
  status: ServiceCallStatusValue
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  if (!SERVICE_CALL_STATUSES.includes(status)) return { success: false, error: "Invalid status" };

  try {
    const call = await prisma.serviceCall.findUnique({
      where: { id },
      include: { vendor: { select: { userId: true } }, technician: { select: { userId: true } } },
    });
    if (!call) return { success: false, error: "Service call not found" };

    const isOwningVendor = call.vendor.userId === session.user.id;
    const isAssignedTechnician = call.technician.userId === session.user.id;
    if (!isOwningVendor && !isAssignedTechnician) {
      return { success: false, error: "You don't have permission to update this call" };
    }

    const timestampField =
      status === "IN_PROGRESS"
        ? { startedAt: new Date() }
        : status === "COMPLETED"
          ? { completedAt: new Date() }
          : status === "CANCELLED"
            ? { cancelledAt: new Date() }
            : {};

    await prisma.serviceCall.update({ where: { id }, data: { status, ...timestampField } });
    revalidatePath("/vendor/service-calls");
    revalidatePath("/technician/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Update service call status error:", err);
    return { success: false, error: "Failed to update status" };
  }
}

/** Vendor reassigns a service call to a different one of their own technicians — resets progress so the new technician starts fresh. */
export async function reassignServiceCallAction(serviceCallId: string, newTechnicianId: string): Promise<ActionResponse> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const call = await prisma.serviceCall.findFirst({ where: { id: serviceCallId, vendorId } });
    if (!call) return { success: false, error: "Service call not found" };

    const newTechnician = await prisma.technicianProfile.findFirst({
      where: { id: newTechnicianId, vendorId },
      select: { userId: true },
    });
    if (!newTechnician) return { success: false, error: "Technician not found" };

    if (newTechnicianId === call.technicianId) {
      return { success: false, error: "This call is already assigned to that technician" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.serviceCall.update({
        where: { id: serviceCallId },
        data: { technicianId: newTechnicianId, status: "ASSIGNED", startedAt: null, completedAt: null, cancelledAt: null },
      });
      await tx.notification.create({
        data: {
          userId: newTechnician.userId,
          type: "CALL_ASSIGNED",
          title: "New job assigned",
          message: "A vendor has assigned you a job — check your Service Calls page for details.",
          serviceCallId,
        },
      });
    });

    revalidatePath("/vendor/service-calls");
    revalidatePath("/technician/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Reassign service call error:", err);
    return { success: false, error: "Failed to reassign this call" };
  }
}

async function requireTechnicianProfile(): Promise<{ technicianId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { technicianId: null, error: "Not signed in as a technician" };
  }
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { technicianId: null, error: "Technician profile not found" };
  return { technicianId: profile.id, error: null };
}

export interface TechnicianJobOffer {
  id: string;
  liveCallId: string;
  itemSummary: string;
  address: string;
  city: string;
  pincode: string;
  total: number;
  distanceKm: number | null;
  createdAt: string;
  expiresInSeconds: number;
}

/**
 * The technician's single oldest pending offer, ride-hailing style — one
 * job at a time, first-come-first-served against every other technician
 * this same call was broadcast to.
 */
export async function getMyPendingOfferAction(): Promise<ActionResponse<TechnicianJobOffer | null>> {
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  try {
    await sweepExpiredOffers();
    const offer = await prisma.serviceCallOffer.findFirst({
      where: { technicianId, status: "PENDING" },
      include: { liveCall: { include: { items: true } } },
      orderBy: { createdAt: "asc" },
    });
    if (!offer) return { success: true, data: null };

    const location = await prisma.technicianLocation.findUnique({
      where: { technicianId },
      select: { latitude: true, longitude: true },
    });

    const ageMs = Date.now() - offer.createdAt.getTime();
    return {
      success: true,
      data: {
        id: offer.id,
        liveCallId: offer.liveCallId,
        itemSummary: offer.liveCall.items.map((i) => i.packageName).join(", "),
        address: offer.liveCall.address,
        city: offer.liveCall.city,
        pincode: offer.liveCall.pincode,
        total: offer.liveCall.total,
        distanceKm: location
          ? haversineKm(location.latitude, location.longitude, offer.liveCall.latitude, offer.liveCall.longitude)
          : null,
        createdAt: offer.createdAt.toISOString(),
        expiresInSeconds: Math.max(0, Math.round((OFFER_TTL_MS - ageMs) / 1000)),
      },
    };
  } catch (err) {
    console.error("Get my pending offer error:", err);
    return { success: false, error: "Failed to load job offer" };
  }
}

/**
 * Atomically claims a PENDING offer (same conditional-`updateMany`-on-
 * status race guard used everywhere else in this file), then creates the
 * real ServiceCall and bulk-expires every sibling offer for the same
 * LiveCall — whoever accepts first wins, the rest silently stop being
 * offered.
 */
export async function acceptJobOfferAction(offerId: string): Promise<ActionResponse<{ serviceCallId: string }>> {
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  try {
    const claimed = await prisma.serviceCallOffer.updateMany({
      where: { id: offerId, technicianId, status: "PENDING" },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    });
    if (claimed.count === 0) {
      return { success: false, error: "This job is no longer available." };
    }

    const offer = await prisma.serviceCallOffer.findUnique({
      where: { id: offerId },
      include: { liveCall: true, vendor: { select: { userId: true } } },
    });
    if (!offer) return { success: false, error: "Offer not found" };

    const serviceCall = await prisma.$transaction(async (tx) => {
      await tx.liveCall.update({ where: { id: offer.liveCallId }, data: { status: "CONVERTED" } });
      const created = await tx.serviceCall.create({
        data: {
          liveCallId: offer.liveCallId,
          vendorId: offer.vendorId,
          technicianId,
          customerId: offer.liveCall.customerId,
          status: "ASSIGNED",
        },
      });
      await tx.serviceCallOffer.updateMany({
        where: { liveCallId: offer.liveCallId, id: { not: offerId } },
        data: { status: "EXPIRED", respondedAt: new Date() },
      });
      await tx.notification.create({
        data: {
          userId: offer.vendor.userId,
          type: "CALL_ASSIGNED",
          title: "Technician accepted the job",
          message: `A technician accepted your call at ${offer.liveCall.address}, ${offer.liveCall.city}.`,
          liveCallId: offer.liveCallId,
          serviceCallId: created.id,
        },
      });
      return created;
    });

    revalidatePath("/technician");
    revalidatePath("/technician/service-calls");
    revalidatePath("/vendor/live-calls");
    revalidatePath("/vendor/service-calls");
    return { success: true, data: { serviceCallId: serviceCall.id } };
  } catch (err) {
    console.error("Accept job offer error:", err);
    return { success: false, error: "Failed to accept this job. Please try again." };
  }
}

/** No race risk — only flips the technician's own row, so a plain updateMany (not a transaction) is enough. */
export async function rejectJobOfferAction(offerId: string): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  try {
    await prisma.serviceCallOffer.updateMany({
      where: { id: offerId, technicianId, status: "PENDING" },
      data: { status: "DECLINED", respondedAt: new Date() },
    });
    revalidatePath("/technician");
    return { success: true };
  } catch (err) {
    console.error("Reject job offer error:", err);
    return { success: false, error: "Failed to decline this job." };
  }
}
