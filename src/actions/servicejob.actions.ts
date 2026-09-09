"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { serviceReportSchema, type ServiceReportInput } from "@/lib/validations/servicereport.schema";

/**
 * A fixed 4-digit customer PIN is only 10,000 combinations, so the gate has
 * to be attempt-limited or it's guessable in an afternoon. Five wrong tries
 * and only the owning vendor can unlock it.
 */
const PIN_MAX_ATTEMPTS = 5;

async function requireTechnicianId(): Promise<{ technicianId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { technicianId: null, error: "Not signed in as a technician" };
  }
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return { technicianId: null, error: "Technician profile not found" };
  return { technicianId: profile.id, error: null };
}

/**
 * Loads the job, proves it belongs to the calling technician, and checks the
 * PIN the customer read out. The stored PIN never leaves the server — the
 * technician's client only ever sends a candidate.
 */
async function verifyJobPin(
  serviceCallId: string,
  technicianId: string,
  pin: string,
  expectedStatus: "EN_ROUTE" | "IN_PROGRESS"
): Promise<
  | { ok: true; call: { id: string; liveCallId: string; vendorUserId: string; customerId: string } }
  | { ok: false; error: string }
> {
  const call = await prisma.serviceCall.findUnique({
    where: { id: serviceCallId },
    include: {
      vendor: { select: { userId: true } },
      liveCall: { select: { customerId: true, customer: { select: { startPin: true, completionPin: true } } } },
    },
  });
  if (!call) return { ok: false, error: "Job not found" };
  if (call.technicianId !== technicianId) return { ok: false, error: "This job isn't assigned to you." };
  if (call.status !== expectedStatus) {
    return {
      ok: false,
      error:
        expectedStatus === "EN_ROUTE"
          ? "Mark yourself on the way before starting the job."
          : "This job isn't in progress.",
    };
  }
  if (call.pinAttempts >= PIN_MAX_ATTEMPTS) {
    return { ok: false, error: "Too many wrong PIN attempts. Ask your vendor to unlock this job." };
  }

  // Each gate has its own PIN — the start PIN must never close a job out.
  const expected =
    expectedStatus === "EN_ROUTE" ? call.liveCall.customer.startPin : call.liveCall.customer.completionPin;
  if (!expected) {
    return { ok: false, error: "This customer doesn't have a service PIN yet. Ask your vendor for help." };
  }

  if (pin.trim() !== expected) {
    const updated = await prisma.serviceCall.update({
      where: { id: serviceCallId },
      data: { pinAttempts: { increment: 1 } },
      select: { pinAttempts: true },
    });
    const left = Math.max(0, PIN_MAX_ATTEMPTS - updated.pinAttempts);
    return {
      ok: false,
      error: left > 0 ? `That PIN doesn't match. ${left} attempt${left === 1 ? "" : "s"} left.` : "Too many wrong PIN attempts. Ask your vendor to unlock this job.",
    };
  }

  return {
    ok: true,
    call: {
      id: call.id,
      liveCallId: call.liveCallId,
      vendorUserId: call.vendor.userId,
      customerId: call.liveCall.customerId,
    },
  };
}

/** EN_ROUTE → IN_PROGRESS, gated on the customer's PIN. */
export async function startJobAction(serviceCallId: string, pin: string): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  try {
    const verified = await verifyJobPin(serviceCallId, technicianId, pin, "EN_ROUTE");
    if (!verified.ok) return { success: false, error: verified.error };

    await prisma.$transaction(async (tx) => {
      await tx.serviceCall.update({
        where: { id: serviceCallId },
        data: { status: "IN_PROGRESS", startedAt: new Date(), pinAttempts: 0 },
      });
      await tx.notification.create({
        data: {
          userId: verified.call.customerId,
          type: "CALL_STATUS_UPDATE",
          title: "Work has started",
          message: "Your technician has started the job.",
          liveCallId: verified.call.liveCallId,
          serviceCallId,
        },
      });
    });

    revalidatePath("/technician/service-calls");
    revalidatePath("/vendor/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Start job error:", err);
    return { success: false, error: "Failed to start the job. Please try again." };
  }
}

/** IN_PROGRESS → COMPLETED, gated on the customer's PIN and the closing report. */
export async function completeJobAction(
  serviceCallId: string,
  pin: string,
  report: ServiceReportInput
): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  const validated = serviceReportSchema.safeParse(report);
  if (!validated.success) {
    return { success: false, error: "Please complete the report", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  try {
    const verified = await verifyJobPin(serviceCallId, technicianId, pin, "IN_PROGRESS");
    if (!verified.ok) return { success: false, error: verified.error };

    await prisma.$transaction(async (tx) => {
      await tx.serviceCall.update({
        where: { id: serviceCallId },
        data: { status: "COMPLETED", completedAt: new Date(), pinAttempts: 0 },
      });
      await tx.serviceReport.upsert({
        where: { serviceCallId },
        create: {
          serviceCallId,
          completionStatus: data.completionStatus,
          holdReason: data.holdReason ?? null,
          newVisitAt: data.newVisitAt ? new Date(data.newVisitAt) : null,
          remarks: data.remarks,
        },
        update: {
          completionStatus: data.completionStatus,
          holdReason: data.holdReason ?? null,
          newVisitAt: data.newVisitAt ? new Date(data.newVisitAt) : null,
          remarks: data.remarks,
        },
      });
      await tx.notification.createMany({
        data: [
          {
            userId: verified.call.customerId,
            type: "CALL_STATUS_UPDATE" as const,
            title: "Job completed",
            message: "Your technician has marked the job complete.",
            liveCallId: verified.call.liveCallId,
            serviceCallId,
          },
          {
            userId: verified.call.vendorUserId,
            type: "CALL_STATUS_UPDATE" as const,
            title: "Job completed",
            message: "A technician submitted their completion report.",
            liveCallId: verified.call.liveCallId,
            serviceCallId,
          },
        ],
      });
    });

    revalidatePath("/technician/service-calls");
    revalidatePath("/vendor/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Complete job error:", err);
    return { success: false, error: "Failed to complete the job. Please try again." };
  }
}

/** Vendor-only escape hatch after a technician burns through the PIN attempts. */
export async function resetJobPinAttemptsAction(serviceCallId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { success: false, error: "Not signed in as a vendor" };
  }

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!vendor) return { success: false, error: "Vendor profile not found" };

    const updated = await prisma.serviceCall.updateMany({
      where: { id: serviceCallId, vendorId: vendor.id },
      data: { pinAttempts: 0 },
    });
    if (updated.count === 0) return { success: false, error: "Service call not found" };

    revalidatePath("/vendor/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Reset job pin attempts error:", err);
    return { success: false, error: "Failed to unlock this job" };
  }
}

export interface ServiceReportSummary {
  completionStatus: string;
  holdReason: string | null;
  newVisitAt: string | null;
  remarks: string;
  submittedAt: string;
}

/** Readable by the assigned technician, the owning vendor, or the customer. */
export async function getServiceReportAction(serviceCallId: string): Promise<ActionResponse<ServiceReportSummary | null>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  try {
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      include: {
        report: true,
        vendor: { select: { userId: true } },
        technician: { select: { userId: true } },
      },
    });
    if (!call) return { success: false, error: "Service call not found" };

    const allowed =
      call.customerId === session.user.id ||
      call.vendor.userId === session.user.id ||
      call.technician?.userId === session.user.id;
    if (!allowed) return { success: false, error: "You don't have access to this report" };
    if (!call.report) return { success: true, data: null };

    return {
      success: true,
      data: {
        completionStatus: call.report.completionStatus,
        holdReason: call.report.holdReason,
        newVisitAt: call.report.newVisitAt?.toISOString() ?? null,
        remarks: call.report.remarks,
        submittedAt: call.report.submittedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Get service report error:", err);
    return { success: false, error: "Failed to load the report" };
  }
}
