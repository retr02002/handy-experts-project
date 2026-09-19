"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, type ServiceCallStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { notifyAllAdmins } from "@/actions/notification.actions";
import type { LiveCallItemDetail } from "@/actions/livecall.actions";
import { computeLeadPrice } from "@/lib/pricing";
import { haversineKm } from "@/lib/geo";
import { canStartTravel, formatScheduledFor, TRAVEL_WINDOW_MINUTES } from "@/lib/jobSchedule";
import { formatTicketNumber } from "@/lib/ticketNumber";
import { MASKED_CUSTOMER_LABEL } from "@/lib/constants";
import { isOrderOverdue } from "@/lib/overdue";
import { createStepTimer } from "@/lib/perfLog";
import {
  getLiveCallServiceIds,
  getPackageServiceCategoryMap,
  getTechnicianOfferedServiceIds,
} from "@/lib/technicianSkills";
import { getServiceReportAction, type ServiceReportSummary } from "@/actions/servicejob.actions";
import { getReviewForServiceCallAction, type ReviewItem } from "@/actions/review.actions";

// PENDING offers older than this are treated as expired whenever read —
// same lazy-expire-on-read idiom LiveCall.expiresAt already uses, no cron.
// An expired offer only stops the countdown ping; the underlying job stays
// UNASSIGNED and claimable from the technician's "available jobs" list.
const OFFER_TTL_MS = 90_000;

/** How far a nearby freelance technician can be from the job and still be offered it. */
const FREELANCE_SEARCH_RADIUS_KM = 15;

async function sweepExpiredOffers(): Promise<void> {
  await prisma.serviceCallOffer.updateMany({
    where: { status: "PENDING", createdAt: { lt: new Date(Date.now() - OFFER_TTL_MS) } },
    data: { status: "EXPIRED", respondedAt: new Date() },
  });
}

/**
 * On-duty technicians of this vendor who are BOTH currently inside one of
 * the vendor's own service-area circles (their live position, not a
 * self-declared one — a technician who has physically left the coverage
 * area is treated exactly like being off duty) AND whose assigned
 * category/service skillset covers at least one thing this job needs.
 * Both gates are hard here — this drives automated distribution, not a
 * vendor's manual override.
 */
export async function findEligibleTechnicians(
  vendorId: string,
  liveCallId: string
): Promise<{ id: string; userId: string }[]> {
  const [technicians, areas, serviceIds] = await Promise.all([
    prisma.technicianProfile.findMany({
      where: { vendorId, location: { isOnDuty: true } },
      select: { id: true, userId: true, location: { select: { latitude: true, longitude: true } } },
    }),
    prisma.vendorServiceArea.findMany({ where: { vendorId }, select: { latitude: true, longitude: true, radiusKm: true } }),
    getLiveCallServiceIds(liveCallId),
  ]);

  const inArea = technicians.filter(
    (t) =>
      t.location &&
      areas.some((a) => haversineKm(a.latitude, a.longitude, t.location!.latitude, t.location!.longitude) <= a.radiusKm)
  );

  const offeredMap = await getTechnicianOfferedServiceIds(inArea.map((t) => t.id));
  return inArea
    .filter((t) => {
      if (serviceIds.length === 0) return true; // job's services couldn't be identified — don't block on a data gap
      const offered = offeredMap.get(t.id);
      return !!offered && serviceIds.some((id) => offered.has(id));
    })
    .map((t) => ({ id: t.id, userId: t.userId }));
}

/**
 * Shared tail of "a vendor now owns this lead": create the UNASSIGNED
 * ServiceCall and ping every eligible on-duty technician. Used identically
 * whether the vendor bought the lead themselves (buyLiveCallAction), an
 * admin assigned it at order-creation time (createOneAdminLiveCall), or an
 * admin force-assigns an already-broadcasting call directly to a vendor
 * (adminAssignLiveCallToVendorAction) — the three previously duplicated this
 * whole block independently.
 */
export async function finalizeVendorAcceptance(params: {
  liveCallId: string;
  vendorId: string;
  customerId: string;
  address: string;
  city: string;
  total: number;
}): Promise<{ serviceCallId: string; offerCount: number }> {
  // Independent — findEligibleTechnicians only needs vendorId/liveCallId,
  // already known, it doesn't need the newly-created ServiceCall's id
  // (that's only needed for the offers/notifications created below).
  const [serviceCall, eligible] = await Promise.all([
    prisma.serviceCall.create({
      data: { liveCallId: params.liveCallId, vendorId: params.vendorId, customerId: params.customerId, status: "UNASSIGNED" },
    }),
    findEligibleTechnicians(params.vendorId, params.liveCallId),
  ]);
  if (eligible.length > 0) {
    await prisma.serviceCallOffer.createMany({
      data: eligible.map((t) => ({ liveCallId: params.liveCallId, vendorId: params.vendorId, technicianId: t.id })),
      skipDuplicates: true,
    });
    prisma.notification.createMany({
      data: eligible.map((t) => ({
        userId: t.userId,
        type: "JOB_OFFER" as const,
        title: "New job offer",
        message: `A job is available at ${params.address}, ${params.city} — ₹${params.total}.`,
        liveCallId: params.liveCallId,
        serviceCallId: serviceCall.id,
      })),
    }).catch(console.error);
  }

  return { serviceCallId: serviceCall.id, offerCount: eligible.length };
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

async function requireTechnicianProfile(): Promise<{ technicianId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { technicianId: null, error: "Not signed in as a technician" };
  }
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { technicianId: null, error: "Technician profile not found" };
  return { technicianId: profile.id, error: null };
}

/**
 * The one place job status transitions are defined. Everything that moves a
 * ServiceCall goes through this — previously any actor could set any status
 * from any status, which made a PIN gate impossible to enforce.
 */
const ALLOWED_TRANSITIONS: Record<ServiceCallStatus, ServiceCallStatus[]> = {
  UNASSIGNED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["EN_ROUTE", "UNASSIGNED", "CANCELLED"],
  // EN_ROUTE → IN_PROGRESS and IN_PROGRESS → COMPLETED are deliberately
  // absent: those need the customer's PIN and go through
  // startJobAction/completeJobAction in servicejob.actions.ts. Leaving them
  // here would let anyone skip the gate by calling this action directly.
  EN_ROUTE: ["UNASSIGNED", "CANCELLED"],
  IN_PROGRESS: ["CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

function canTransition(from: ServiceCallStatus, to: ServiceCallStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Job is still reassignable/declinable right up until work actually starts. */
const PRE_START_STATUSES: ServiceCallStatus[] = ["UNASSIGNED", "ASSIGNED", "EN_ROUTE"];

export interface PurchasedLiveCallDetail {
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
  createdByAdminName: string | null;
  upiRef: string | null;
  paymentScreenshotUrl: string | null;
  subtotal: number;
  tax: number;
  total: number;
  items: LiveCallItemDetail[];
}

/** Thrown inside the buy transaction to roll it back with a specific,
 *  caller-visible reason rather than a generic "transaction failed". */
class BuyLeadError extends Error {}

/**
 * Vendor buys a broadcasting live call — debits the wallet and converts the
 * lead to a ServiceCall atomically, then proceeds exactly as the old free
 * "accept" flow did: the ServiceCall is created immediately, whether or not
 * anyone is available to work it, and offers are just the ping layer (a
 * technician who comes on duty later still finds the job through
 * getMyAvailableJobsAction).
 *
 * Debit happens BEFORE the LiveCall claim, not after — if someone else beat
 * this vendor to the same lead, the whole transaction (wallet debit
 * included) rolls back, so a lost race never costs the vendor anything.
 */
export async function buyLiveCallAction(
  liveCallId: string
): Promise<ActionResponse<{ serviceCallId: string; offerCount: number; liveCall: PurchasedLiveCallDetail }>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    // Independent lookups — neither depends on the other's result.
    const [vendorProfile, liveCall] = await Promise.all([
      prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        select: { isActive: true, companyName: true, leadPricingType: true, leadPricingValue: true },
      }),
      prisma.liveCall.findUnique({ where: { id: liveCallId } }),
    ]);
    if (!vendorProfile?.isActive) {
      return { success: false, error: "Your account is deactivated and can't buy new leads." };
    }
    if (!liveCall) return { success: false, error: "Live call not found" };
    if (liveCall.status !== "BROADCASTING") {
      return { success: false, error: "This lead was already bought by another vendor or has expired." };
    }

    const leadPrice = computeLeadPrice(liveCall.total, vendorProfile.leadPricingType, vendorProfile.leadPricingValue);

    try {
      await prisma.$transaction(async (tx) => {
        const wallet = await tx.vendorWallet.upsert({
          where: { vendorId },
          create: { vendorId },
          update: {},
          select: { id: true },
        });

        const debited = await tx.vendorWallet.updateMany({
          where: { id: wallet.id, balance: { gte: leadPrice } },
          data: { balance: { decrement: leadPrice } },
        });
        if (debited.count === 0) {
          throw new BuyLeadError(`Not enough balance — this lead costs ₹${leadPrice}. Add money to your wallet.`);
        }

        // Conditional claim: only the caller who actually flips the row
        // wins, anyone racing them gets count === 0 — and since this is the
        // same transaction as the debit above, the wallet decrement rolls
        // back with it.
        const claimed = await tx.liveCall.updateMany({
          where: { id: liveCallId, status: "BROADCASTING" },
          data: { status: "CONVERTED", acceptedByVendorId: vendorId, acceptedAt: new Date() },
        });
        if (claimed.count === 0) {
          throw new BuyLeadError("This lead was already bought by another vendor or has expired.");
        }

        await tx.vendorWalletTransaction.create({
          data: { walletId: wallet.id, type: "DEBIT", status: "COMPLETED", amount: leadPrice, liveCallId },
        });
      });
    } catch (txErr) {
      if (txErr instanceof BuyLeadError) {
        return { success: false, error: txErr.message };
      }
      throw txErr;
    }

    // finalizeVendorAcceptance and this items lookup are independent — the
    // items only need liveCallId, already known — so they run concurrently
    // instead of the items query waiting on the whole acceptance flow.
    const [{ serviceCallId, offerCount }, liveCallItems] = await Promise.all([
      finalizeVendorAcceptance({
        liveCallId,
        vendorId,
        customerId: liveCall.customerId,
        address: liveCall.address,
        city: liveCall.city,
        total: liveCall.total,
      }),
      prisma.liveCallItem.findMany({ where: { liveCallId } }),
    ]);

    // No revalidatePath — LiveCallsPanel.tsx already self-refetches
    // (refetchCalls/refetchAwaiting) on BuyLeadModal's onBought, and this
    // has no effect on the vendor's poll-driven fetch anyway.
    // notifyAllAdmins already runs asynchronously internally, but we don't await it here anyway.
    notifyAllAdmins(
      "CALL_ACCEPTED",
      "Live call bought",
      `${vendorProfile.companyName} bought a lead (₹${leadPrice}) at ${liveCall.address}, ${liveCall.city}${
        offerCount > 0 ? ` and notified ${offerCount} technician(s).` : " — no technician on duty in range yet."
      }`,
      liveCallId,
      serviceCallId
    );

    return {
      success: true,
      data: {
        serviceCallId,
        offerCount,
        liveCall: {
          customerName: liveCall.customerName,
          customerPhone: liveCall.customerPhone,
          siteContactName: liveCall.siteContactName,
          siteContactPhone: liveCall.siteContactPhone,
          customerEmail: liveCall.customerEmail,
          address: liveCall.address,
          city: liveCall.city,
          state: liveCall.state,
          pincode: liveCall.pincode,
          paymentMode: liveCall.paymentMode,
          createdByAdminName: liveCall.createdByAdminName,
          upiRef: liveCall.upiRef,
          paymentScreenshotUrl: liveCall.paymentScreenshotUrl,
          subtotal: liveCall.subtotal,
          tax: liveCall.tax,
          total: liveCall.total,
          items: liveCallItems.map((i) => ({
            packageName: i.packageName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
    };
  } catch (err) {
    console.error("Buy live call error:", err);
    return { success: false, error: "Failed to buy this lead. Please try again." };
  }
}

export interface LiveCallOfferSummary {
  id: string;
  technicianId: string;
  technicianName: string;
  status: string;
  declineReason: string | null;
  createdAt: string;
  respondedAt: string | null;
}

/** For the vendor's "awaiting technician" card — who's been offered this job and how they responded. */
export async function getPendingOffersForLiveCallAction(
  liveCallId: string
): Promise<ActionResponse<LiveCallOfferSummary[]>> {
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
        declineReason: o.declineReason,
        createdAt: o.createdAt.toISOString(),
        respondedAt: o.respondedAt?.toISOString() ?? null,
      })),
    };
  } catch (err) {
    console.error("Get pending offers error:", err);
    return { success: false, error: "Failed to load offers" };
  }
}

export interface AwaitingJobSummary {
  serviceCallId: string;
  liveCallId: string;
  itemSummary: string;
  address: string;
  city: string;
  total: number;
  createdAt: string;
  pendingCount: number;
  declinedCount: number;
  expiredCount: number;
  isOverdue: boolean;
}

/** The vendor's accepted-but-unclaimed jobs — the "awaiting technician" list. */
export async function getMyAwaitingCallsForVendorAction(): Promise<ActionResponse<AwaitingJobSummary[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    await sweepExpiredOffers();
    const calls = await prisma.serviceCall.findMany({
      where: { vendorId, status: "UNASSIGNED" },
      include: { liveCall: { include: { items: true, offers: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      success: true,
      data: calls.map((c) => ({
        serviceCallId: c.id,
        liveCallId: c.liveCallId,
        itemSummary: c.liveCall.items.map((i) => i.packageName).join(", "),
        address: c.liveCall.address,
        city: c.liveCall.city,
        total: c.liveCall.total,
        createdAt: c.createdAt.toISOString(),
        pendingCount: c.liveCall.offers.filter((o) => o.status === "PENDING").length,
        declinedCount: c.liveCall.offers.filter((o) => o.status === "DECLINED").length,
        expiredCount: c.liveCall.offers.filter((o) => o.status === "EXPIRED").length,
        isOverdue: isOrderOverdue(c.liveCall.scheduledFor, c.liveCall.acceptedAt ?? c.createdAt),
      })),
    };
  } catch (err) {
    console.error("Get awaiting calls error:", err);
    return { success: false, error: "Failed to load awaiting calls" };
  }
}

/** Manual retry when nobody picked the job up — re-pings every currently eligible on-duty technician. */
export async function rebroadcastLiveCallOffersAction(
  liveCallId: string
): Promise<ActionResponse<{ offerCount: number }>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const liveCall = await prisma.liveCall.findFirst({
      where: { id: liveCallId, acceptedByVendorId: vendorId },
      include: { serviceCall: { select: { id: true, status: true } } },
    });
    if (!liveCall) return { success: false, error: "Live call not found" };
    const serviceCall = liveCall.serviceCall;
    if (!serviceCall || serviceCall.status !== "UNASSIGNED") {
      return { success: false, error: "This job already has a technician." };
    }

    const eligible = await findEligibleTechnicians(vendorId, liveCallId);
    if (eligible.length === 0) {
      return { success: false, error: "None of your on-duty technicians currently cover this location." };
    }

    // A previously DECLINED/EXPIRED offer is reset to PENDING rather than
    // duplicated — @@unique([liveCallId, technicianId]) means one row per pair.
    await Promise.all(
      eligible.map((t) =>
        prisma.serviceCallOffer.upsert({
          where: { liveCallId_technicianId: { liveCallId, technicianId: t.id } },
          create: { liveCallId, vendorId, technicianId: t.id },
          update: { status: "PENDING", createdAt: new Date(), respondedAt: null, declineReason: null },
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
        serviceCallId: serviceCall.id,
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
  liveCallId: string;
  /** Short, human-readable, chronological order reference (e.g. "HZ-100234") for on-site verification and vendor lookup. */
  ticketNumber: string;
  status: string;
  customerName: string;
  /** Null once piiMasked is true (technician viewing a job past completion). */
  customerPhone: string | null;
  siteContactName: string | null;
  siteContactPhone: string | null;
  customerEmail: string | null;
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  paymentMode: string;
  createdByAdminName: string | null;
  upiRef: string | null;
  paymentScreenshotUrl: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number;
  itemSummary: string;
  items: LiveCallItemDetail[];
  /** True only for a technician viewing their OWN completed job — customer
   *  contact/address and the price breakdown are stripped above; only the
   *  final total stays. Vendor and admin views never set this. */
  piiMasked: boolean;
  technicianId: string | null;
  technicianName: string | null;
  /** The technician's own escalation path when something's wrong on site. */
  vendorName: string | null;
  vendorPhone: string | null;
  vendorEmail: string | null;
  scheduledFor: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  pinAttempts: number;
  /** True when a vendor/admin has waived the proximity check for this job. */
  geofenceBypass: boolean;
  hasReport: boolean;
}

const serviceCallWithDetails = Prisma.validator<Prisma.ServiceCallDefaultArgs>()({
  include: {
    liveCall: { include: { items: true } },
    technician: { include: { user: { select: { name: true } } } },
    vendor: { select: { companyName: true, user: { select: { phone: true, email: true } } } },
    report: { select: { id: true } },
  },
});
const serviceCallInclude = serviceCallWithDetails.include;
type ServiceCallRow = Prisma.ServiceCallGetPayload<typeof serviceCallWithDetails>;

function mapServiceCallRow(r: ServiceCallRow): ServiceCallSummary {
  return {
    id: r.id,
    liveCallId: r.liveCallId,
    ticketNumber: formatTicketNumber(r.liveCall),
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
    latitude: r.liveCall.latitude,
    longitude: r.liveCall.longitude,
    paymentMode: r.liveCall.paymentMode,
    createdByAdminName: r.liveCall.createdByAdminName,
    upiRef: r.liveCall.upiRef,
    paymentScreenshotUrl: r.liveCall.paymentScreenshotUrl,
    subtotal: r.liveCall.subtotal,
    tax: r.liveCall.tax,
    total: r.liveCall.total,
    itemSummary: r.liveCall.items.map((i) => i.packageName).join(", "),
    items: r.liveCall.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
    technicianId: r.technicianId,
    technicianName: r.technician?.user.name ?? null,
    vendorName: r.vendor?.companyName ?? null,
    vendorPhone: r.vendor?.user?.phone ?? null,
    vendorEmail: r.vendor?.user?.email ?? null,
    scheduledFor: r.liveCall.scheduledFor?.toISOString() ?? null,
    assignedAt: r.assignedAt?.toISOString() ?? null,
    startedAt: r.startedAt?.toISOString() ?? null,
    completedAt: r.completedAt?.toISOString() ?? null,
    cancelledAt: r.cancelledAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    pinAttempts: r.pinAttempts,
    geofenceBypass: r.geofenceBypass,
    hasReport: r.report !== null,
    piiMasked: false,
  };
}

/**
 * Applied to every row in getMyServiceCallsForTechnicianAction, regardless
 * of status. The price breakdown (subtotal/tax/items) is stripped
 * unconditionally — a technician only ever sees the final total, before
 * starting, after starting, and after completing; there's no stage where
 * they need the GST split or per-line prices. itemSummary (job
 * description, no prices) stays visible so the job still reads sensibly.
 *
 * Customer PII is a separate concern with a different lifetime: the
 * technician keeps full contact/address detail for every ACTIVE job (they
 * still need it to do the work) and only loses it once the job is
 * COMPLETED, when there's no longer an ongoing reason to hold it. Vendor
 * contact fields deliberately stay — that's the technician's own
 * escalation path, not the customer's data.
 *
 * getMyServiceCallsForVendorAction and every admin path never call this.
 */
function maskServiceCallForTechnician(s: ServiceCallSummary): ServiceCallSummary {
  const completed = s.status === "COMPLETED";
  return {
    ...s,
    subtotal: null,
    tax: null,
    items: [],
    ...(completed && {
      customerName: MASKED_CUSTOMER_LABEL,
      customerPhone: null,
      customerEmail: null,
      siteContactName: null,
      siteContactPhone: null,
      address: null,
      pincode: null,
      latitude: null,
      longitude: null,
      upiRef: null,
      paymentScreenshotUrl: null,
      createdByAdminName: null,
    }),
    piiMasked: completed,
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
      take: 100,
    });
    return { success: true, data: rows.map(mapServiceCallRow) };
  } catch (err) {
    console.error("Get my service calls for vendor error:", err);
    return { success: false, error: "Failed to load service calls" };
  }
}

export async function getMyServiceCallsForTechnicianAction(): Promise<ActionResponse<ServiceCallSummary[]>> {
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  try {
    const rows = await prisma.serviceCall.findMany({
      where: { technicianId },
      include: serviceCallInclude,
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return {
      success: true,
      data: rows.map(mapServiceCallRow).map(maskServiceCallForTechnician),
    };
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
      include: serviceCallInclude,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return {
      success: true,
      data: rows.map((r) => ({ ...mapServiceCallRow(r), vendorName: r.vendor?.companyName ?? "Unknown Vendor" })),
    };
  } catch (err) {
    console.error("Get all service calls error:", err);
    return { success: false, error: "Failed to load service calls" };
  }
}

/** One vendor's order history, for the admin vendor detail page's Orders tab. */
export async function getServiceCallsForVendorAction(
  vendorId: string
): Promise<ActionResponse<AdminServiceCallSummary[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.serviceCall.findMany({
      where: { vendorId },
      include: serviceCallInclude,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return {
      success: true,
      data: rows.map((r) => ({ ...mapServiceCallRow(r), vendorName: r.vendor?.companyName ?? "Unknown Vendor" })),
    };
  } catch (err) {
    console.error("Get service calls for vendor error:", err);
    return { success: false, error: "Failed to load this vendor's orders" };
  }
}

export interface ServiceCallOfferHistoryItem {
  technicianId: string;
  technicianName: string;
  status: string;
  declineReason: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface ServiceCallFullDetail {
  summary: AdminServiceCallSummary;
  report: ServiceReportSummary | null;
  review: ReviewItem | null;
  /** Every offer ever made for this job, across every technician — including declines. */
  offerHistory: ServiceCallOfferHistoryItem[];
}

/**
 * Everything there is to know about one job, for the admin's full-oversight
 * detail page: the summary already shown elsewhere, the completion report,
 * the customer's review if one exists, and — surfaced for the first time
 * anywhere — every offer this job generated, including the decline reasons
 * that were captured but never shown to anyone until now.
 */
export async function getServiceCallFullDetailAction(
  serviceCallId: string
): Promise<ActionResponse<ServiceCallFullDetail>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const call = await prisma.serviceCall.findUnique({ where: { id: serviceCallId }, include: serviceCallInclude });
    if (!call) return { success: false, error: "Service call not found" };

    const [reportRes, reviewRes, offers] = await Promise.all([
      getServiceReportAction(serviceCallId),
      getReviewForServiceCallAction(serviceCallId),
      prisma.serviceCallOffer.findMany({
        where: { liveCallId: call.liveCallId },
        include: { technician: { select: { user: { select: { name: true } } } } },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        summary: { ...mapServiceCallRow(call), vendorName: call.vendor?.companyName ?? "Unknown Vendor" },
        report: reportRes.success ? reportRes.data ?? null : null,
        review: reviewRes.success ? reviewRes.data ?? null : null,
        offerHistory: offers.map((o) => ({
          technicianId: o.technicianId,
          technicianName: o.technician.user.name ?? "",
          status: o.status,
          declineReason: o.declineReason,
          createdAt: o.createdAt.toISOString(),
          respondedAt: o.respondedAt?.toISOString() ?? null,
        })),
      },
    };
  } catch (err) {
    console.error("Get service call full detail error:", err);
    return { success: false, error: "Failed to load this job's details" };
  }
}

const SERVICE_CALL_STATUSES = ["UNASSIGNED", "ASSIGNED", "EN_ROUTE", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type ServiceCallStatusValue = (typeof SERVICE_CALL_STATUSES)[number];

/**
 * Callable by either the owning vendor or the assigned technician, and only
 * for transitions the state machine allows. The two PIN-gated hops
 * (EN_ROUTE → IN_PROGRESS and IN_PROGRESS → COMPLETED) go through
 * startJobAction/completeJobAction instead — see servicejob.actions.ts.
 */
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
      include: {
        vendor: { select: { userId: true } },
        technician: { select: { userId: true } },
        liveCall: { select: { scheduledFor: true, customerId: true, paymentMode: true, paymentStatus: true, total: true } },
      },
    });
    if (!call) return { success: false, error: "Service call not found" };

    const isOwningVendor = call.vendor?.userId === session.user.id;
    const isAssignedTechnician = call.technician?.userId === session.user.id;
    const isAdmin = session.user.role === "SUPER_ADMIN";
    if (!isOwningVendor && !isAssignedTechnician && !isAdmin) {
      return { success: false, error: "You don't have permission to update this call" };
    }

    if (!canTransition(call.status, status)) {
      return { success: false, error: `Can't move a ${call.status.toLowerCase()} job to ${status.toLowerCase()}.` };
    }

    // Setting off is what switches the customer's screen into live tracking,
    // so it can't happen days before the slot. Enforced here rather than only
    // in the UI — the button being hidden is a courtesy, not a control.
    if (status === "EN_ROUTE" && !canStartTravel(call.liveCall.scheduledFor)) {
      const when = formatScheduledFor(call.liveCall.scheduledFor);
      return {
        success: false,
        error: `This job is scheduled for ${when}. You can set off from ${TRAVEL_WINDOW_MINUTES / 60} hours before.`,
      };
    }

    const timestampField =
      status === "IN_PROGRESS"
        ? { startedAt: new Date() }
        : status === "COMPLETED"
          ? { completedAt: new Date() }
          : status === "CANCELLED"
            ? { cancelledAt: new Date() }
            : {};

    // A paid online order that ends up cancelled after a vendor/technician
    // already accepted it (couldn't be fulfilled, technician had an issue,
    // etc.) refunds into the customer's wallet the same way a pre-accept
    // cancellation does — automatic, no admin step, credited atomically with
    // the status flip.
    const needsRefund = status === "CANCELLED" && call.liveCall.paymentMode === "ONLINE" && call.liveCall.paymentStatus === "PAID";

    if (needsRefund) {
      await prisma.$transaction(async (tx) => {
        await tx.serviceCall.update({ where: { id }, data: { status, ...timestampField } });
        await tx.liveCall.update({ where: { id: call.liveCallId }, data: { paymentStatus: "REFUNDED" } });
        const wallet = await tx.customerWallet.upsert({
          where: { userId: call.liveCall.customerId },
          create: { userId: call.liveCall.customerId },
          update: {},
          select: { id: true },
        });
        await tx.customerWallet.update({ where: { id: wallet.id }, data: { balance: { increment: call.liveCall.total } } });
        await tx.customerWalletTransaction.create({
          data: { walletId: wallet.id, type: "REFUND", amount: call.liveCall.total, liveCallId: call.liveCallId },
        });
      });
    } else {
      await prisma.serviceCall.update({ where: { id }, data: { status, ...timestampField } });
    }

    // No revalidatePath — TechnicianJobPanel/vendor+admin callers already
    // self-refetch via onChanged() after this resolves.
    return { success: true };
  } catch (err) {
    console.error("Update service call status error:", err);
    return { success: false, error: "Failed to update status" };
  }
}

export interface ReassignCandidate {
  technicianId: string;
  name: string;
  skillCategory: string;
  isOnDuty: boolean;
  isFreelance: boolean;
  distanceKm: number | null;
  /**
   * Display-only — does this technician's assigned skillset cover what the
   * job needs? Never filters the list: a vendor can still hand a job to any
   * of their own staff in an emergency, same reasoning as why the radius
   * circle is already ignored for own-staff here. Freelancers still get a
   * distance cutoff (below) since they aren't the vendor's own people.
   */
  matchesSkill: boolean;
}

/**
 * Who the vendor can hand this job to: their own roster (unfiltered by
 * geography or skill — manual override always wins for your own staff),
 * plus any on-duty freelance technician within FREELANCE_SEARCH_RADIUS_KM of
 * the job's live location (a freelancer isn't the vendor's staff, so picking
 * one sends an offer rather than assigning them outright — see
 * reassignServiceCallAction).
 */
export async function getReassignCandidatesAction(
  serviceCallId: string
): Promise<ActionResponse<ReassignCandidate[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (session.user.role !== "VENDOR" && !isAdmin) {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Same "look up by id, then ownership-check, vendorId comes from the
    // call itself" shape as reassignServiceCallAction, for the same reason.
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      include: { vendor: { select: { userId: true } }, liveCall: { select: { latitude: true, longitude: true } } },
    });
    if (!call) return { success: false, error: "Service call not found" };
    if (!isAdmin && call.vendor?.userId !== session.user.id) {
      return { success: false, error: "Service call not found" };
    }
    const vendorId = call.vendorId;
    const { latitude, longitude } = call.liveCall;

    const [ownStaff, freelancers, serviceIds] = await Promise.all([
      prisma.technicianProfile.findMany({
        where: { vendorId },
        select: {
          id: true,
          skillCategory: true,
          user: { select: { name: true } },
          location: { select: { isOnDuty: true, latitude: true, longitude: true } },
        },
      }),
      prisma.technicianProfile.findMany({
        where: { vendorId: null, location: { isOnDuty: true } },
        select: {
          id: true,
          skillCategory: true,
          user: { select: { name: true } },
          location: { select: { isOnDuty: true, latitude: true, longitude: true } },
        },
        take: 100,
      }),
      getLiveCallServiceIds(call.liveCallId),
    ]);

    const distanceFor = (loc: { latitude: number; longitude: number } | null) =>
      loc ? haversineKm(loc.latitude, loc.longitude, latitude, longitude) : null;

    const allCandidateIds = [...ownStaff, ...freelancers].map((t) => t.id);
    const offeredMap = await getTechnicianOfferedServiceIds(allCandidateIds);
    const matches = (technicianId: string) => {
      if (serviceIds.length === 0) return true;
      const offered = offeredMap.get(technicianId);
      return !!offered && serviceIds.some((id) => offered.has(id));
    };

    const candidates: ReassignCandidate[] = [
      ...ownStaff
        .filter((t) => t.id !== call.technicianId)
        .map((t) => ({
          technicianId: t.id,
          name: t.user.name ?? "",
          skillCategory: t.skillCategory,
          isOnDuty: t.location?.isOnDuty ?? false,
          isFreelance: false,
          distanceKm: distanceFor(t.location),
          matchesSkill: matches(t.id),
        })),
      ...freelancers
        .filter((t) => t.id !== call.technicianId)
        .map((t) => ({
          technicianId: t.id,
          name: t.user.name ?? "",
          skillCategory: t.skillCategory,
          isOnDuty: true,
          isFreelance: true,
          distanceKm: distanceFor(t.location),
          matchesSkill: matches(t.id),
        }))
        .filter((t) => t.distanceKm === null || t.distanceKm <= FREELANCE_SEARCH_RADIUS_KM),
    ];

    // On-duty first, then skill-matched, then nearest.
    candidates.sort((a, b) => {
      if (a.isOnDuty !== b.isOnDuty) return a.isOnDuty ? -1 : 1;
      if (a.matchesSkill !== b.matchesSkill) return a.matchesSkill ? -1 : 1;
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
    });

    return { success: true, data: candidates };
  } catch (err) {
    console.error("Get reassign candidates error:", err);
    return { success: false, error: "Failed to load technicians" };
  }
}

/**
 * Vendor hands the job to someone else. Only possible before work actually
 * starts — once a technician is IN_PROGRESS the job is theirs to finish or
 * cancel. Own staff are assigned directly; a freelancer is invited via an
 * offer and the job waits UNASSIGNED until they take it.
 */
export async function reassignServiceCallAction(
  serviceCallId: string,
  newTechnicianId: string
): Promise<ActionResponse<{ assigned: boolean }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (session.user.role !== "VENDOR" && !isAdmin) {
    return { success: false, error: "Not authorized" };
  }

  try {
    // Looked up by id alone, then ownership-checked — not filtered by the
    // caller's own vendorId — so the same code path serves both a vendor
    // acting on their own job and an admin acting on any job. vendorId used
    // throughout below is the job's own, not the caller's.
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      include: {
        vendor: { select: { userId: true } },
        technician: { select: { user: { select: { name: true } } } },
        liveCall: { select: { latitude: true, longitude: true, address: true, city: true, total: true } },
      },
    });
    if (!call) return { success: false, error: "Service call not found" };
    if (!isAdmin && call.vendor?.userId !== session.user.id) {
      return { success: false, error: "Service call not found" };
    }
    const vendorId = call.vendorId;
    if (!vendorId) {
      return { success: false, error: "Service call has no associated vendor" };
    }

    if (!PRE_START_STATUSES.includes(call.status)) {
      return { success: false, error: "This job has already started — it can't be reassigned now." };
    }
    if (newTechnicianId === call.technicianId) {
      return { success: false, error: "This call is already assigned to that technician" };
    }

    const technician = await prisma.technicianProfile.findUnique({
      where: { id: newTechnicianId },
      select: {
        userId: true,
        vendorId: true,
        user: { select: { name: true } },
        location: { select: { isOnDuty: true } },
      },
    });
    if (!technician) return { success: false, error: "Technician not found" };

    const isOwnStaff = technician.vendorId === vendorId;
    // The candidate list (getReassignCandidatesAction) only ever offers a
    // freelancer if they're genuinely unaffiliated (vendorId: null) and
    // on-duty — without this check here, any technician id not belonging
    // to this vendor (including another vendor's own staff, or an
    // off-duty technician) would silently be sent an unsolicited offer.
    if (!isOwnStaff && (technician.vendorId !== null || !technician.location?.isOnDuty)) {
      return { success: false, error: "This technician isn't available to be assigned right now." };
    }

    // Whoever had this job before — either still directly assigned, or
    // already released back into the pool by an earlier decline — is who
    // the handover trail should credit as the predecessor.
    const outgoingTechnicianName = call.technician?.user.name ?? call.previousTechnicianName ?? "Unassigned";
    const outgoingTechnicianId = call.technicianId ?? call.previousTechnicianId ?? null;

    const message = `A job is available at ${call.liveCall.address}, ${call.liveCall.city} — ₹${call.liveCall.total}.`;

    if (isOwnStaff) {
      // Assignment is final immediately — write the handover row now and
      // clear any pending snapshot from a prior decline in the same chain.
      await prisma.$transaction(async (tx) => {
        await tx.serviceCall.update({
          where: { id: serviceCallId },
          data: {
            technicianId: newTechnicianId,
            status: "ASSIGNED",
            assignedAt: new Date(),
            startedAt: null,
            completedAt: null,
            cancelledAt: null,
            pinAttempts: 0,
            previousTechnicianId: null,
            previousTechnicianName: null,
            previousHandoverReason: null,
          },
        });
        await tx.serviceCallHandover.create({
          data: {
            serviceCallId,
            fromTechnicianId: outgoingTechnicianId,
            fromTechnicianName: outgoingTechnicianName,
            toTechnicianId: newTechnicianId,
            toTechnicianName: technician.user.name ?? "",
            reason: "Reassigned by vendor",
          },
        });
        await tx.notification.create({
          data: {
            userId: technician.userId,
            type: "CALL_ASSIGNED",
            title: "New job assigned",
            message,
            liveCallId: call.liveCallId,
            serviceCallId,
          },
        });
      });
    } else {
      // Freelancer: release the job back into the pool and invite them —
      // assignment isn't final yet, so snapshot the predecessor context
      // instead of writing the handover row; claimServiceCallAction writes
      // it once (if) this technician actually accepts.
      await prisma.$transaction(async (tx) => {
        await tx.serviceCall.update({
          where: { id: serviceCallId },
          data: {
            technicianId: null,
            status: "UNASSIGNED",
            assignedAt: null,
            pinAttempts: 0,
            previousTechnicianId: outgoingTechnicianId,
            previousTechnicianName: outgoingTechnicianName,
            previousHandoverReason: "Reassigned by vendor",
          },
        });
        await tx.serviceCallOffer.upsert({
          where: { liveCallId_technicianId: { liveCallId: call.liveCallId, technicianId: newTechnicianId } },
          create: { liveCallId: call.liveCallId, vendorId, technicianId: newTechnicianId },
          update: { status: "PENDING", createdAt: new Date(), respondedAt: null, declineReason: null },
        });
        await tx.notification.create({
          data: {
            userId: technician.userId,
            type: "JOB_OFFER",
            title: "New job offer",
            message,
            liveCallId: call.liveCallId,
            serviceCallId,
          },
        });
      });
    }

    revalidatePath("/vendor/service-calls");
    revalidatePath("/technician/service-calls");
    revalidatePath("/admin/service-calls");
    return { success: true, data: { assigned: isOwnStaff } };
  } catch (err) {
    console.error("Reassign service call error:", err);
    return { success: false, error: "Failed to reassign this call" };
  }
}

export interface TechnicianJobOffer {
  serviceCallId: string;
  liveCallId: string;
  /** Null when this surfaced as an open job in the technician's area rather than a direct ping. */
  offerId: string | null;
  itemSummary: string;
  address: string;
  city: string;
  pincode: string;
  total: number;
  latitude: number;
  longitude: number;
  distanceKm: number | null;
  scheduledFor: string | null;
  createdAt: string;
  /** Countdown on a direct ping; null for an open job, which doesn't expire. */
  expiresInSeconds: number | null;
}

/**
 * Every job this technician could take right now: jobs they were pinged
 * about, plus any still-unclaimed job from their vendor that their own
 * service area covers. Computing the second set on read (rather than
 * writing offer rows when someone clocks in) is what makes "go on duty and
 * immediately see waiting work" fall out for free — no cron, no duty-toggle
 * side effects. Jobs they've already declined stay hidden.
 */
export async function getMyAvailableJobsAction(): Promise<ActionResponse<TechnicianJobOffer[]>> {
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  try {
    await sweepExpiredOffers();

    const me = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
      select: {
        vendorId: true,
        location: { select: { isOnDuty: true, latitude: true, longitude: true } },
      },
    });
    if (!me) return { success: false, error: "Technician profile not found" };
    // Off duty means no work is offered — matching what the vendor-side
    // eligibility check already assumes.
    if (!me.location?.isOnDuty) return { success: true, data: [] };

    // On duty and in-area are independent, both required. A vendor-managed
    // technician whose live position has drifted outside every one of their
    // vendor's own coverage circles gets treated exactly like off duty —
    // this is the actual eligibility boundary now, not a self-declared
    // circle a technician could set once and never revisit. Freelancers
    // (no vendor) have no circle to inherit and fall through to the
    // per-offer distance check below instead.
    const vendorAreas = me.vendorId
      ? await prisma.vendorServiceArea.findMany({
          where: { vendorId: me.vendorId },
          select: { latitude: true, longitude: true, radiusKm: true },
        })
      : [];
    if (
      me.vendorId &&
      !vendorAreas.some(
        (a) => haversineKm(a.latitude, a.longitude, me.location!.latitude, me.location!.longitude) <= a.radiusKm
      )
    ) {
      return { success: true, data: [] };
    }

    const myOffers = await prisma.serviceCallOffer.findMany({
      where: { technicianId },
      select: { id: true, liveCallId: true, status: true, createdAt: true },
    });
    const pendingByLiveCall = new Map(myOffers.filter((o) => o.status === "PENDING").map((o) => [o.liveCallId, o]));
    const declinedLiveCallIds = new Set(myOffers.filter((o) => o.status === "DECLINED").map((o) => o.liveCallId));

    const candidateWhere: Prisma.ServiceCallWhereInput = {
      status: "UNASSIGNED",
      OR: [
        ...(me.vendorId ? [{ vendorId: me.vendorId }] : []),
        { liveCall: { offers: { some: { technicianId, status: "PENDING" as const } } } },
      ],
    };

    const calls = await prisma.serviceCall.findMany({
      where: candidateWhere,
      include: { liveCall: { include: { items: true } } },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // Skill gate — "not every call should be his, only according to his
    // categories." One batched package→service resolution for every distinct
    // package across all candidate calls, plus one offered-set fetch for
    // this one technician (not per-call — there's only one technician here).
    const packageIds = calls.flatMap((c) =>
      c.liveCall.items.map((i) => i.packageId).filter((id): id is string => !!id)
    );
    const packageServiceMap = await getPackageServiceCategoryMap(packageIds);
    const offeredServiceIds = (await getTechnicianOfferedServiceIds([technicianId])).get(technicianId) ?? new Set<string>();

    const now = Date.now();
    const jobs = calls
      .filter((c) => !declinedLiveCallIds.has(c.liveCallId))
      .filter((c) => {
        const callServiceIds = c.liveCall.items
          .map((i) => (i.packageId ? packageServiceMap.get(i.packageId)?.serviceId : null))
          .filter((id): id is string => !!id);
        // A job whose items couldn't be identified doesn't get blocked on a
        // data gap; otherwise the technician must offer at least one of them.
        return callServiceIds.length === 0 || callServiceIds.some((id) => offeredServiceIds.has(id));
      })
      .filter((c) => {
        // Own-vendor jobs are already vendor-circle-scoped by the on-duty/
        // in-area gate above. Freelancer-offered jobs have no vendor circle
        // to inherit, so they keep the live-distance sanity cutoff that
        // already existed for freelancers before this rewrite.
        if (me.vendorId || !me.location) return true;
        const d = haversineKm(me.location.latitude, me.location.longitude, c.liveCall.latitude, c.liveCall.longitude);
        return d <= FREELANCE_SEARCH_RADIUS_KM;
      })
      .map((c) => {
        const offer = pendingByLiveCall.get(c.liveCallId);
        return {
          serviceCallId: c.id,
          liveCallId: c.liveCallId,
          offerId: offer?.id ?? null,
          itemSummary: c.liveCall.items.map((i) => i.packageName).join(", "),
          address: c.liveCall.address,
          city: c.liveCall.city,
          pincode: c.liveCall.pincode,
          total: c.liveCall.total,
          latitude: c.liveCall.latitude,
          longitude: c.liveCall.longitude,
          distanceKm: me.location
            ? haversineKm(me.location.latitude, me.location.longitude, c.liveCall.latitude, c.liveCall.longitude)
            : null,
          scheduledFor: c.liveCall.scheduledFor?.toISOString() ?? null,
          createdAt: c.createdAt.toISOString(),
          expiresInSeconds: offer
            ? Math.max(0, Math.round((OFFER_TTL_MS - (now - offer.createdAt.getTime())) / 1000))
            : null,
        };
      })
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

    return { success: true, data: jobs };
  } catch (err) {
    console.error("Get my available jobs error:", err);
    return { success: false, error: "Failed to load available jobs" };
  }
}

/**
 * Technician takes an unclaimed job. The conditional updateMany is the
 * correctness-critical piece — whoever flips technicianId off null first
 * wins, everyone racing them gets a clean "no longer available".
 */
export async function claimServiceCallAction(
  serviceCallId: string
): Promise<ActionResponse<{ serviceCallId: string }>> {
  const timer = createStepTimer(`claimServiceCallAction ${serviceCallId}`);
  const { technicianId, error } = await requireTechnicianProfile();
  timer.mark("auth");
  if (!technicianId) return { success: false, error: error! };

  try {
    // These two lookups don't depend on each other — run them together
    // instead of one round trip at a time.
    const [me, call] = await Promise.all([
      prisma.technicianProfile.findUnique({
        where: { id: technicianId },
        select: {
          vendorId: true,
          userId: true,
          user: { select: { name: true } },
          location: { select: { isOnDuty: true, latitude: true, longitude: true } },
        },
      }),
      prisma.serviceCall.findUnique({
        where: { id: serviceCallId },
        include: {
          liveCall: { select: { latitude: true, longitude: true, address: true, city: true, customerId: true } },
          vendor: { select: { userId: true } },
        },
      }),
    ]);
    timer.mark("technicianProfile + serviceCall lookup");
    if (!me) return { success: false, error: "Technician profile not found" };
    if (!me.location?.isOnDuty) return { success: false, error: "Go on duty before taking a job." };
    if (!call) return { success: false, error: "Job not found" };
    if (call.status !== "UNASSIGNED") return { success: false, error: "This job is no longer available." };

    const belongsToMyVendor = me.vendorId !== null && me.vendorId === call.vendorId;

    // Same independence — the pending-offer check and the in-area check
    // (only relevant for the vendor's own jobs) don't depend on each other.
    const [hasPendingOffer, areas] = await Promise.all([
      prisma.serviceCallOffer.findFirst({
        where: { liveCallId: call.liveCallId, technicianId, status: "PENDING" },
        select: { id: true },
      }),
      belongsToMyVendor
        ? prisma.vendorServiceArea.findMany({
            where: { vendorId: me.vendorId! },
            select: { latitude: true, longitude: true, radiusKm: true },
          })
        : Promise.resolve(null),
    ]);
    timer.mark("offer + service-area lookup");
    if (!hasPendingOffer && !belongsToMyVendor) {
      return { success: false, error: "This job isn't available to you." };
    }

    // Defense in depth for the vendor's own jobs: re-check the technician's
    // live position against their vendor's coverage circles, the same gate
    // getMyAvailableJobsAction already applies before this job even appears
    // in their list — a stale client list shouldn't let a claim through. A
    // directly offered job was already validated as in-range when the offer
    // was created, so it isn't re-checked here.
    if (belongsToMyVendor) {
      const inArea = (areas ?? []).some(
        (a) => haversineKm(a.latitude, a.longitude, me.location!.latitude, me.location!.longitude) <= a.radiusKm
      );
      if (!inArea) return { success: false, error: "You're currently outside your service area." };
    }

    const claimed = await prisma.serviceCall.updateMany({
      where: { id: serviceCallId, technicianId: null, status: "UNASSIGNED" },
      data: { technicianId, status: "ASSIGNED", assignedAt: new Date() },
    });
    timer.mark("claim updateMany");
    if (claimed.count === 0) return { success: false, error: "This job is no longer available." };

    await prisma.$transaction(async (tx) => {
      // Independent writes — grouped so they run concurrently instead of
      // one round trip at a time inside the transaction.
      const writes: Promise<unknown>[] = [
        tx.serviceCallOffer.updateMany({
          where: { liveCallId: call.liveCallId, technicianId, status: "PENDING" },
          data: { status: "ACCEPTED", respondedAt: new Date() },
        }),
        // Everyone else's ping for this job stops now.
        tx.serviceCallOffer.updateMany({
          where: { liveCallId: call.liveCallId, technicianId: { not: technicianId }, status: "PENDING" },
          data: { status: "EXPIRED", respondedAt: new Date() },
        }),
      ];
      // A predecessor snapshot (from an earlier decline or vendor
      // reassignment that released this job to the pool) becomes the real
      // handover record now that this claim has actually stuck.
      if (call.previousTechnicianId || call.previousTechnicianName) {
        writes.push(
          tx.serviceCallHandover.create({
            data: {
              serviceCallId,
              fromTechnicianId: call.previousTechnicianId,
              fromTechnicianName: call.previousTechnicianName ?? "Unassigned",
              toTechnicianId: technicianId,
              toTechnicianName: me.user.name ?? "",
              reason: call.previousHandoverReason,
            },
          }),
          tx.serviceCall.update({
            where: { id: serviceCallId },
            data: { previousTechnicianId: null, previousTechnicianName: null, previousHandoverReason: null },
          })
        );
      }
      await Promise.all(writes);
    });
    timer.mark("transaction (offers + handover)");

    // Fire-and-forget, same as notifyUser/notifyAllAdmins elsewhere in this
    // codebase — a notification insert failing must never roll back an
    // already-successful claim, which is exactly what awaiting these inside
    // the transaction above risked.
    if (call.vendor) {
      prisma.notification.create({
        data: {
          userId: call.vendor.userId,
          type: "CALL_ASSIGNED",
          title: "Technician accepted the job",
          message: `A technician accepted your call at ${call.liveCall.address}, ${call.liveCall.city}.`,
          liveCallId: call.liveCallId,
          serviceCallId,
        },
      }).catch(console.error);
    }
    prisma.notification.create({
      data: {
        userId: call.liveCall.customerId,
        type: "CALL_ASSIGNED",
        title: "A technician is on the job",
        message: "Your service request has been assigned — track it from your order page.",
        liveCallId: call.liveCallId,
        serviceCallId,
      },
    }).catch(console.error);

    // No revalidatePath — this action is invoked from client components
    // that already re-fetch their own data on resolution, and it has no
    // effect on the vendor's poll-driven fetch (a plain Server Action call
    // per poll tick, not a cached page render). Same reasoning as
    // startJobAction/completeJobAction in servicejob.actions.ts.
    return { success: true, data: { serviceCallId } };
  } catch (err) {
    console.error("Claim service call error:", err);
    return { success: false, error: "Failed to take this job. Please try again." };
  }
}

/**
 * Technician turns a job down, with a reason. Works both for a job they
 * were merely offered (it stays in the pool for someone else) and one
 * already assigned to them (it goes back into the pool and the vendor is
 * told). Not allowed once work has started.
 */
export async function declineJobAction(serviceCallId: string, reason: string): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  const trimmedReason = reason.trim();
  if (trimmedReason.length < 3) return { success: false, error: "Please give a reason for declining." };
  if (trimmedReason.length > 300) return { success: false, error: "That reason is too long." };

  try {
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      include: {
        vendor: { select: { userId: true } },
        technician: { select: { user: { select: { name: true } } } },
        liveCall: { select: { address: true, city: true } },
      },
    });
    if (!call) return { success: false, error: "Job not found" };

    const isMine = call.technicianId === technicianId;
    if (!isMine && call.status !== "UNASSIGNED") {
      return { success: false, error: "This job isn't yours to decline." };
    }
    if (!PRE_START_STATUSES.includes(call.status)) {
      return { success: false, error: "This job has already started and can't be declined." };
    }
    const vendorId = call.vendorId;
    if (!vendorId || !call.vendor) {
      return { success: false, error: "Cannot decline a job without a vendor." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.serviceCallOffer.upsert({
        where: { liveCallId_technicianId: { liveCallId: call.liveCallId, technicianId } },
        create: {
          liveCallId: call.liveCallId,
          vendorId,
          technicianId,
          status: "DECLINED",
          respondedAt: new Date(),
          declineReason: trimmedReason,
        },
        update: { status: "DECLINED", respondedAt: new Date(), declineReason: trimmedReason },
      });

      if (isMine) {
        // This is the far more common real-world "handover" trigger — the
        // interim snapshot here is what a later successful claim (by
        // whoever picks this job up next) turns into the actual
        // ServiceCallHandover row, in claimServiceCallAction.
        await tx.serviceCall.update({
          where: { id: serviceCallId },
          data: {
            technicianId: null,
            status: "UNASSIGNED",
            assignedAt: null,
            pinAttempts: 0,
            previousTechnicianId: technicianId,
            previousTechnicianName: call.technician?.user.name ?? "Unassigned",
            previousHandoverReason: trimmedReason,
          },
        });
        await tx.notification.create({
          data: {
            userId: call.vendor!.userId,
            type: "JOB_UNASSIGNED",
            title: "Technician dropped a job",
            message: `A technician declined the job at ${call.liveCall.address}, ${call.liveCall.city} — "${trimmedReason}". It's waiting for someone else.`,
            liveCallId: call.liveCallId,
            serviceCallId,
          },
        });
      }
    });

    // No revalidatePath — TechnicianJobPanel.handleDecline already
    // self-refetches via onChanged() after this resolves.
    return { success: true };
  } catch (err) {
    console.error("Decline job error:", err);
    return { success: false, error: "Failed to decline this job." };
  }
}

export interface HandoverContext {
  ticketNumber: string;
  previous: { technicianName: string; reason: string | null; createdAt: string } | null;
}

/**
 * Per-detail-view read, not folded into getMyServiceCallsForTechnicianAction's
 * bulk list — most jobs never have a handover row, so a join on every list
 * load isn't worth it for a field almost always empty. Returns previous:
 * null for an ordinary first-assignment job (no handover ever happened).
 */
export async function getMyHandoverContextAction(serviceCallId: string): Promise<ActionResponse<HandoverContext>> {
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  try {
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      select: { technicianId: true, liveCall: { select: { ticketSeq: true, orderCityCode: true, orderLocalityCode: true, orderSeq: true } } },
    });
    if (!call || call.technicianId !== technicianId) return { success: false, error: "Job not found" };

    const handover = await prisma.serviceCallHandover.findFirst({
      where: { serviceCallId, toTechnicianId: technicianId },
      orderBy: { createdAt: "desc" },
      select: { fromTechnicianName: true, reason: true, createdAt: true },
    });

    return {
      success: true,
      data: {
        ticketNumber: formatTicketNumber(call.liveCall),
        previous: handover
          ? { technicianName: handover.fromTechnicianName, reason: handover.reason, createdAt: handover.createdAt.toISOString() }
          : null,
      },
    };
  } catch (err) {
    console.error("Get my handover context error:", err);
    return { success: false, error: "Failed to load handover context" };
  }
}

/** Mirrors checkout — a revised job must be priced the same way the original was. */
const TAX_RATE = 0.18;

export interface JobItemInput {
  /** Null for a line the vendor typed in that isn't a catalogue package. */
  packageId: string | null;
  packageName: string;
  unitPrice: number;
  quantity: number;
}

/**
 * Lets a vendor correct what a job actually covers — the customer described
 * one thing over the phone and the technician found another, or a package
 * was booked that doesn't apply.
 *
 * Only before work starts, for the same reason reassignment is: once someone
 * is mid-job, changing what the job *is* rewrites history.
 *
 * The customer has already paid, so the original total is preserved on the
 * first edit rather than overwritten. Every surface that shows the price can
 * then show both, and nobody is silently charged a number they never agreed
 * to.
 */
export async function updateJobItemsAction(
  serviceCallId: string,
  items: JobItemInput[]
): Promise<ActionResponse<{ subtotal: number; tax: number; total: number; originalTotal: number }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const isAdmin = session.user.role === "SUPER_ADMIN";
  if (session.user.role !== "VENDOR" && !isAdmin) {
    return { success: false, error: "Not authorized" };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "A job needs at least one service on it" };
  }
  for (const item of items) {
    if (!item.packageName?.trim()) return { success: false, error: "Every line needs a name" };
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      return { success: false, error: "Prices can't be negative" };
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return { success: false, error: "Quantity must be at least 1" };
    }
  }

  try {
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      select: {
        status: true,
        liveCallId: true,
        vendor: { select: { userId: true } },
        liveCall: { select: { total: true, originalTotal: true } },
      },
    });
    if (!call) return { success: false, error: "Service call not found" };
    if (!isAdmin && call.vendor?.userId !== session.user.id) {
      return { success: false, error: "Service call not found" };
    }
    if (!PRE_START_STATUSES.includes(call.status)) {
      return { success: false, error: "This job has already started — its services can't be changed now." };
    }

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;
    // Set once and never overwritten, so a second edit still compares
    // against what the customer actually paid rather than the last revision.
    const originalTotal = call.liveCall.originalTotal ?? call.liveCall.total;

    await prisma.$transaction(async (tx) => {
      await tx.liveCallItem.deleteMany({ where: { liveCallId: call.liveCallId } });
      await tx.liveCallItem.createMany({
        data: items.map((i) => ({
          liveCallId: call.liveCallId,
          packageId: i.packageId,
          packageName: i.packageName.trim(),
          unitPrice: i.unitPrice,
          quantity: i.quantity,
        })),
      });
      await tx.liveCall.update({
        where: { id: call.liveCallId },
        data: { subtotal, tax, total, originalTotal },
      });
    });

    revalidatePath("/vendor/service-calls");
    revalidatePath("/customer/orders");
    return { success: true, data: { subtotal, tax, total, originalTotal } };
  } catch (err) {
    console.error("Update job items error:", err);
    return { success: false, error: "Failed to update this job's services" };
  }
}

export async function buyLiveCallAsFreelancerAction(
  liveCallId: string
): Promise<ActionResponse<{ serviceCallId: string; liveCall: PurchasedLiveCallDetail }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Not signed in as a technician" };
  }
  const userId = session.user.id;

  try {
    const technician = await prisma.technicianProfile.findUnique({
      where: { userId },
      select: { id: true, type: true, leadFeeType: true, leadFeeAmount: true },
    });
    if (!technician) {
      return { success: false, error: "Technician profile not found." };
    }
    if (technician.type !== "FREELANCE") {
      return { success: false, error: "Only freelance technicians can buy leads directly." };
    }

    const liveCall = await prisma.liveCall.findUnique({ where: { id: liveCallId } });
    if (!liveCall) return { success: false, error: "Live call not found" };
    if (liveCall.status !== "BROADCASTING") {
      return { success: false, error: "This lead was already bought or has expired." };
    }

    const leadPrice = computeLeadPrice(liveCall.total, technician.leadFeeType, technician.leadFeeAmount);

    let createdServiceCallId = "";

    try {
      await prisma.$transaction(async (tx) => {
        let wallet = await tx.technicianWallet.findUnique({ where: { technicianId: technician.id } });
        if (!wallet) {
          wallet = await tx.technicianWallet.create({ data: { technicianId: technician.id, balance: 0 } });
        }

        const debited = await tx.technicianWallet.updateMany({
          where: { id: wallet.id, balance: { gte: leadPrice } },
          data: { balance: { decrement: leadPrice } },
        });
        if (debited.count === 0) {
          throw new BuyLeadError(`Not enough balance — this lead costs ₹${leadPrice}. Add money to your wallet.`);
        }

        const claimed = await tx.liveCall.updateMany({
          where: { id: liveCallId, status: "BROADCASTING" },
          data: { status: "CONVERTED", acceptedByTechnicianId: technician.id, acceptedAt: new Date() },
        });
        if (claimed.count === 0) {
          throw new BuyLeadError("This lead was already bought by someone else or has expired.");
        }

        await tx.technicianWalletTransaction.create({
          data: { walletId: wallet.id, type: "DEBIT", status: "COMPLETED", amount: leadPrice, liveCallId },
        });

        const serviceCall = await tx.serviceCall.create({
          data: {
            customerId: liveCall.customerId,
            technicianId: technician.id,
            liveCallId,
            status: "IN_PROGRESS",
            assignedAt: new Date(),
          },
        });
        createdServiceCallId = serviceCall.id;
      });
    } catch (txErr) {
      if (txErr instanceof BuyLeadError) {
        return { success: false, error: txErr.message };
      }
      throw txErr;
    }

    revalidatePath("/technician/live-calls");
    revalidatePath("/technician/service-calls");
    revalidatePath("/technician/wallet");

    return {
      success: true,
      data: {
        serviceCallId: createdServiceCallId,
        liveCall: {
          customerName: liveCall.customerName,
          customerPhone: liveCall.customerPhone,
          siteContactName: liveCall.siteContactName,
          siteContactPhone: liveCall.siteContactPhone,
          customerEmail: liveCall.customerEmail,
          address: liveCall.address,
          city: liveCall.city,
          state: liveCall.state,
          pincode: liveCall.pincode,
          paymentMode: liveCall.paymentMode,
          createdByAdminName: liveCall.createdByAdminName,
          upiRef: liveCall.upiRef,
          paymentScreenshotUrl: liveCall.paymentScreenshotUrl,
          subtotal: liveCall.subtotal,
          tax: liveCall.tax,
          total: liveCall.total,
          items: (await prisma.liveCallItem.findMany({ where: { liveCallId } })).map((i) => ({
            packageName: i.packageName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
    };
  } catch (err) {
    console.error("Buy live call as freelancer error:", err);
    return { success: false, error: "Failed to buy live call" };
  }
}
