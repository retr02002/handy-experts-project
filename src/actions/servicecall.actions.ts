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
import { haversineKm } from "@/lib/geo";
import { canStartTravel, formatScheduledFor, TRAVEL_WINDOW_MINUTES } from "@/lib/jobSchedule";

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

/**
 * Vendor accepts a broadcasting live call.
 *
 * The ServiceCall is created here, immediately, whether or not anyone is
 * available to work it — an accepted job always exists as a real record, it
 * just sits UNASSIGNED until a technician claims it. Offers are only the
 * ping layer now: they notify whoever is on duty and in range right now,
 * and a technician who comes on duty later still finds the job through
 * getMyAvailableJobsAction.
 */
export async function acceptLiveCallAction(
  liveCallId: string
): Promise<ActionResponse<{ serviceCallId: string; offerCount: number }>> {
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

    // Conditional claim: only the caller who actually flips the row wins,
    // anyone racing them gets count === 0 and a clean "already taken".
    const claimed = await prisma.liveCall.updateMany({
      where: { id: liveCallId, status: "BROADCASTING" },
      data: { status: "CONVERTED", acceptedByVendorId: vendorId, acceptedAt: new Date() },
    });
    if (claimed.count === 0) {
      return { success: false, error: "This call was already accepted by another vendor or has expired." };
    }

    const serviceCall = await prisma.serviceCall.create({
      data: { liveCallId, vendorId, customerId: liveCall.customerId, status: "UNASSIGNED" },
    });

    const eligible = await findEligibleTechnicians(vendorId, liveCall.latitude, liveCall.longitude);
    if (eligible.length > 0) {
      await prisma.serviceCallOffer.createMany({
        data: eligible.map((t) => ({ liveCallId, vendorId, technicianId: t.id })),
        skipDuplicates: true,
      });
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
    }

    revalidatePath("/vendor/live-calls");
    revalidatePath("/vendor/service-calls");
    notifyAllAdmins(
      "CALL_ACCEPTED",
      "Live call accepted",
      `${vendorProfile.companyName} accepted a call at ${liveCall.address}, ${liveCall.city}${
        eligible.length > 0 ? ` and notified ${eligible.length} technician(s).` : " — no technician on duty in range yet."
      }`,
      liveCallId,
      serviceCall.id
    );
    return { success: true, data: { serviceCallId: serviceCall.id, offerCount: eligible.length } };
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

    const eligible = await findEligibleTechnicians(vendorId, liveCall.latitude, liveCall.longitude);
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
  itemSummary: string;
  items: LiveCallItemDetail[];
  technicianId: string | null;
  technicianName: string | null;
  /** The technician's own escalation path when something's wrong on site. */
  vendorName: string;
  vendorPhone: string | null;
  vendorEmail: string | null;
  scheduledFor: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  pinAttempts: number;
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
    upiRef: r.liveCall.upiRef,
    paymentScreenshotUrl: r.liveCall.paymentScreenshotUrl,
    subtotal: r.liveCall.subtotal,
    tax: r.liveCall.tax,
    total: r.liveCall.total,
    itemSummary: r.liveCall.items.map((i) => i.packageName).join(", "),
    items: r.liveCall.items.map((i) => ({ packageName: i.packageName, quantity: i.quantity, unitPrice: i.unitPrice })),
    technicianId: r.technicianId,
    technicianName: r.technician?.user.name ?? null,
    vendorName: r.vendor.companyName,
    vendorPhone: r.vendor.user.phone,
    vendorEmail: r.vendor.user.email,
    scheduledFor: r.liveCall.scheduledFor?.toISOString() ?? null,
    assignedAt: r.assignedAt?.toISOString() ?? null,
    startedAt: r.startedAt?.toISOString() ?? null,
    completedAt: r.completedAt?.toISOString() ?? null,
    cancelledAt: r.cancelledAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    pinAttempts: r.pinAttempts,
    hasReport: r.report !== null,
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
      include: serviceCallInclude,
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
        liveCall: { select: { scheduledFor: true } },
      },
    });
    if (!call) return { success: false, error: "Service call not found" };

    const isOwningVendor = call.vendor.userId === session.user.id;
    const isAssignedTechnician = call.technician?.userId === session.user.id;
    if (!isOwningVendor && !isAssignedTechnician) {
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

    await prisma.serviceCall.update({ where: { id }, data: { status, ...timestampField } });
    revalidatePath("/vendor/service-calls");
    revalidatePath("/technician/service-calls");
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
}

/**
 * Who the vendor can hand this job to: their own roster, plus any on-duty
 * freelance technician whose service area covers the job (a freelancer
 * isn't the vendor's staff, so picking one sends an offer rather than
 * assigning them outright — see reassignServiceCallAction).
 */
export async function getReassignCandidatesAction(
  serviceCallId: string
): Promise<ActionResponse<ReassignCandidate[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const call = await prisma.serviceCall.findFirst({
      where: { id: serviceCallId, vendorId },
      include: { liveCall: { select: { latitude: true, longitude: true } } },
    });
    if (!call) return { success: false, error: "Service call not found" };
    const { latitude, longitude } = call.liveCall;

    const [ownStaff, freelancers] = await Promise.all([
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
          serviceAreas: { select: { latitude: true, longitude: true, radiusKm: true } },
        },
        take: 100,
      }),
    ]);

    const distanceFor = (loc: { latitude: number; longitude: number } | null) =>
      loc ? haversineKm(loc.latitude, loc.longitude, latitude, longitude) : null;

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
        })),
      ...freelancers
        .filter(
          (t) =>
            t.id !== call.technicianId &&
            t.serviceAreas.some((a) => haversineKm(a.latitude, a.longitude, latitude, longitude) <= a.radiusKm)
        )
        .map((t) => ({
          technicianId: t.id,
          name: t.user.name ?? "",
          skillCategory: t.skillCategory,
          isOnDuty: true,
          isFreelance: true,
          distanceKm: distanceFor(t.location),
        }))
        .filter((t) => t.distanceKm === null || t.distanceKm <= FREELANCE_SEARCH_RADIUS_KM),
    ];

    // On-duty first, then nearest.
    candidates.sort((a, b) => {
      if (a.isOnDuty !== b.isOnDuty) return a.isOnDuty ? -1 : 1;
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
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const call = await prisma.serviceCall.findFirst({
      where: { id: serviceCallId, vendorId },
      include: { liveCall: { select: { latitude: true, longitude: true, address: true, city: true, total: true } } },
    });
    if (!call) return { success: false, error: "Service call not found" };

    if (!PRE_START_STATUSES.includes(call.status)) {
      return { success: false, error: "This job has already started — it can't be reassigned now." };
    }
    if (newTechnicianId === call.technicianId) {
      return { success: false, error: "This call is already assigned to that technician" };
    }

    const technician = await prisma.technicianProfile.findUnique({
      where: { id: newTechnicianId },
      select: { userId: true, vendorId: true },
    });
    if (!technician) return { success: false, error: "Technician not found" };

    const isOwnStaff = technician.vendorId === vendorId;
    const message = `A job is available at ${call.liveCall.address}, ${call.liveCall.city} — ₹${call.liveCall.total}.`;

    if (isOwnStaff) {
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
      // Freelancer: release the job back into the pool and invite them.
      await prisma.$transaction(async (tx) => {
        await tx.serviceCall.update({
          where: { id: serviceCallId },
          data: { technicianId: null, status: "UNASSIGNED", assignedAt: null, pinAttempts: 0 },
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
        serviceAreas: { select: { latitude: true, longitude: true, radiusKm: true } },
      },
    });
    if (!me) return { success: false, error: "Technician profile not found" };
    // Off duty means no work is offered — matching what the vendor-side
    // eligibility check already assumes.
    if (!me.location?.isOnDuty) return { success: true, data: [] };

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

    const now = Date.now();
    const jobs = calls
      .filter((c) => !declinedLiveCallIds.has(c.liveCallId))
      .filter((c) =>
        me.serviceAreas.some(
          (a) => haversineKm(a.latitude, a.longitude, c.liveCall.latitude, c.liveCall.longitude) <= a.radiusKm
        )
      )
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
  const { technicianId, error } = await requireTechnicianProfile();
  if (!technicianId) return { success: false, error: error! };

  try {
    const me = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
      select: {
        vendorId: true,
        userId: true,
        location: { select: { isOnDuty: true } },
        serviceAreas: { select: { latitude: true, longitude: true, radiusKm: true } },
      },
    });
    if (!me) return { success: false, error: "Technician profile not found" };
    if (!me.location?.isOnDuty) return { success: false, error: "Go on duty before taking a job." };

    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      include: {
        liveCall: { select: { latitude: true, longitude: true, address: true, city: true, customerId: true } },
        vendor: { select: { userId: true } },
      },
    });
    if (!call) return { success: false, error: "Job not found" };
    if (call.status !== "UNASSIGNED") return { success: false, error: "This job is no longer available." };

    const hasPendingOffer = await prisma.serviceCallOffer.findFirst({
      where: { liveCallId: call.liveCallId, technicianId, status: "PENDING" },
      select: { id: true },
    });
    const belongsToMyVendor = me.vendorId !== null && me.vendorId === call.vendorId;
    if (!hasPendingOffer && !belongsToMyVendor) {
      return { success: false, error: "This job isn't available to you." };
    }

    const coversLocation = me.serviceAreas.some(
      (a) => haversineKm(a.latitude, a.longitude, call.liveCall.latitude, call.liveCall.longitude) <= a.radiusKm
    );
    if (!coversLocation) return { success: false, error: "This job is outside your service area." };

    const claimed = await prisma.serviceCall.updateMany({
      where: { id: serviceCallId, technicianId: null, status: "UNASSIGNED" },
      data: { technicianId, status: "ASSIGNED", assignedAt: new Date() },
    });
    if (claimed.count === 0) return { success: false, error: "This job is no longer available." };

    await prisma.$transaction(async (tx) => {
      await tx.serviceCallOffer.updateMany({
        where: { liveCallId: call.liveCallId, technicianId, status: "PENDING" },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });
      // Everyone else's ping for this job stops now.
      await tx.serviceCallOffer.updateMany({
        where: { liveCallId: call.liveCallId, technicianId: { not: technicianId }, status: "PENDING" },
        data: { status: "EXPIRED", respondedAt: new Date() },
      });
      await tx.notification.create({
        data: {
          userId: call.vendor.userId,
          type: "CALL_ASSIGNED",
          title: "Technician accepted the job",
          message: `A technician accepted your call at ${call.liveCall.address}, ${call.liveCall.city}.`,
          liveCallId: call.liveCallId,
          serviceCallId,
        },
      });
      await tx.notification.create({
        data: {
          userId: call.liveCall.customerId,
          type: "CALL_ASSIGNED",
          title: "A technician is on the job",
          message: "Your service request has been assigned — track it from your order page.",
          liveCallId: call.liveCallId,
          serviceCallId,
        },
      });
    });

    revalidatePath("/technician");
    revalidatePath("/technician/service-calls");
    revalidatePath("/vendor/live-calls");
    revalidatePath("/vendor/service-calls");
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

    await prisma.$transaction(async (tx) => {
      await tx.serviceCallOffer.upsert({
        where: { liveCallId_technicianId: { liveCallId: call.liveCallId, technicianId } },
        create: {
          liveCallId: call.liveCallId,
          vendorId: call.vendorId,
          technicianId,
          status: "DECLINED",
          respondedAt: new Date(),
          declineReason: trimmedReason,
        },
        update: { status: "DECLINED", respondedAt: new Date(), declineReason: trimmedReason },
      });

      if (isMine) {
        await tx.serviceCall.update({
          where: { id: serviceCallId },
          data: { technicianId: null, status: "UNASSIGNED", assignedAt: null, pinAttempts: 0 },
        });
        await tx.notification.create({
          data: {
            userId: call.vendor.userId,
            type: "JOB_UNASSIGNED",
            title: "Technician dropped a job",
            message: `A technician declined the job at ${call.liveCall.address}, ${call.liveCall.city} — "${trimmedReason}". It's waiting for someone else.`,
            liveCallId: call.liveCallId,
            serviceCallId,
          },
        });
      }
    });

    revalidatePath("/technician");
    revalidatePath("/technician/service-calls");
    revalidatePath("/vendor/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Decline job error:", err);
    return { success: false, error: "Failed to decline this job." };
  }
}
