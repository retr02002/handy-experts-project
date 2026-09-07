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
 * Vendor accepts a broadcasting live call and assigns one of their own
 * technicians in a single action. The `updateMany` conditional on
 * `status: "BROADCASTING"` is the correctness-critical piece: only the
 * first caller to reach it while the call is still broadcasting actually
 * changes a row (count === 1); anyone racing them gets count === 0 and a
 * clean "already taken" error instead of a double assignment.
 */
export async function acceptAndAssignLiveCallAction(
  liveCallId: string,
  technicianId: string
): Promise<ActionResponse<{ serviceCallId: string }>> {
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

    const technician = await prisma.technicianProfile.findFirst({
      where: { id: technicianId, vendorId },
      select: { id: true, userId: true },
    });
    if (!technician) return { success: false, error: "Technician not found" };

    const claimed = await prisma.liveCall.updateMany({
      where: { id: liveCallId, status: "BROADCASTING" },
      data: { status: "ACCEPTED", acceptedByVendorId: vendorId, acceptedAt: new Date() },
    });
    if (claimed.count === 0) {
      return { success: false, error: "This call was already accepted by another vendor or has expired." };
    }

    const liveCall = await prisma.liveCall.findUnique({ where: { id: liveCallId } });
    if (!liveCall) return { success: false, error: "Live call not found" };

    const serviceCall = await prisma.$transaction(async (tx) => {
      await tx.liveCall.update({ where: { id: liveCallId }, data: { status: "CONVERTED" } });
      const created = await tx.serviceCall.create({
        data: {
          liveCallId,
          vendorId,
          technicianId,
          customerId: liveCall.customerId,
          status: "ASSIGNED",
        },
      });
      await tx.notification.create({
        data: {
          userId: technician.userId,
          type: "CALL_ASSIGNED",
          title: "New job assigned",
          message: `You've been assigned a job at ${liveCall.address}, ${liveCall.city} — ₹${liveCall.total}.`,
          liveCallId,
          serviceCallId: created.id,
        },
      });
      return created;
    });

    revalidatePath("/vendor/live-calls");
    revalidatePath("/vendor/service-calls");
    notifyAllAdmins(
      "CALL_ACCEPTED",
      "Live call accepted",
      `${vendorProfile.companyName} accepted a call at ${liveCall.address}, ${liveCall.city}.`,
      liveCallId,
      serviceCall.id
    );
    return { success: true, data: { serviceCallId: serviceCall.id } };
  } catch (err) {
    console.error("Accept and assign live call error:", err);
    return { success: false, error: "Failed to accept this call. Please try again." };
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
  paymentScreenshotUrl: string;
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
