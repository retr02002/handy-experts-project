"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { serviceReportSchema, type ServiceReportInput } from "@/lib/validations/servicereport.schema";
import { geoFixSchema, type GeoFixInput } from "@/lib/validations/geofix.schema";
import { evaluateGeofence, formatDistance } from "@/lib/geo";
import {
  JOB_GEOFENCE_RADIUS_METERS,
  GEOFENCE_ACCURACY_GRACE_METERS,
  GEOFENCE_ENFORCED,
  GEOFENCE_POSITION_REQUIRED,
} from "@/lib/constants";

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
  | {
      ok: true;
      call: {
        id: string;
        liveCallId: string;
        vendorUserId: string;
        customerId: string;
        geofenceBypass: boolean;
        latitude: number;
        longitude: number;
      };
    }
  | { ok: false; error: string }
> {
  // Also carries geofenceBypass (a plain scalar, already included via
  // `include` below) and liveCall.latitude/longitude — fetched here so
  // evaluateJobGeofence never has to re-fetch the same ServiceCall row a
  // second time; that redundant round trip was the single biggest
  // contributor to start/complete feeling slow.
  const call = await prisma.serviceCall.findUnique({
    where: { id: serviceCallId },
    include: {
      vendor: { select: { userId: true } },
      liveCall: {
        select: {
          customerId: true,
          startPin: true,
          completionPin: true,
          latitude: true,
          longitude: true,
          customer: { select: { startPin: true, completionPin: true } },
        },
      },
    },
  });
  if (!call) return { ok: false, error: "Job not found" };
  if (!call.vendor) return { ok: false, error: "Job has no associated vendor." };
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
  // An admin-created order's own liveCall.startPin/completionPin (see
  // schema.prisma) takes priority over the customer account's permanent
  // PIN when set — see adminlivecall.actions.ts.
  const expected =
    expectedStatus === "EN_ROUTE"
      ? call.liveCall.startPin ?? call.liveCall.customer.startPin
      : call.liveCall.completionPin ?? call.liveCall.customer.completionPin;
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
      vendorUserId: call.vendor!.userId,
      customerId: call.liveCall.customerId,
      geofenceBypass: call.geofenceBypass,
      latitude: call.liveCall.latitude,
      longitude: call.liveCall.longitude,
    },
  };
}

interface GateGeoOutcome {
  /** Null only when the caller should be blocked — the message is then in `error`. */
  fields: Record<string, number | null>;
  error: string | null;
}

/**
 * Proximity half of a job gate. Always returns the columns to persist, so
 * the distance is recorded whether or not it blocks — during the warn-only
 * rollout (GEOFENCE_ENFORCED=false) that recording IS the point.
 *
 * Deliberately called only AFTER the PIN has verified, so being out of
 * range never burns one of the five PIN attempts. Takes the customer
 * coordinates and bypass flag as plain arguments (verifyJobPin already
 * fetched them off the same ServiceCall row) rather than re-fetching —
 * this used to be a second, redundant findUnique on every single call.
 */
function evaluateJobGeofence(
  serviceCallId: string,
  customer: { latitude: number; longitude: number; geofenceBypass: boolean },
  fix: GeoFixInput | null,
  phase: "start" | "complete"
): GateGeoOutcome {
  const prefix = phase === "start" ? "start" : "complete";
  const blank: Record<string, number | null> = {
    [`${prefix}Latitude`]: fix?.latitude ?? null,
    [`${prefix}Longitude`]: fix?.longitude ?? null,
    [`${prefix}AccuracyM`]: fix?.accuracyM ?? null,
    [`${prefix}DistanceM`]: null,
  };

  const result = evaluateGeofence(
    { latitude: customer.latitude, longitude: customer.longitude },
    fix,
    {
      radiusM: JOB_GEOFENCE_RADIUS_METERS,
      accuracyGraceM: GEOFENCE_ACCURACY_GRACE_METERS,
      bypass: customer.geofenceBypass,
    }
  );

  const fields = { ...blank, [`${prefix}DistanceM`]: result.distanceM };

  if (result.ok) return { fields, error: null };

  // Measured and recorded, but not enforced yet — see GEOFENCE_ENFORCED.
  if (!GEOFENCE_ENFORCED) {
    console.warn(
      `[geofence] would block ${phase} of ${serviceCallId}: reason=${result.reason} distanceM=${result.distanceM?.toFixed(0) ?? "n/a"}`
    );
    return { fields, error: null };
  }

  const verb = phase === "start" ? "start" : "complete";
  if (result.reason === "NO_FIX") {
    return { fields, error: GEOFENCE_POSITION_REQUIRED };
  }
  return {
    fields,
    error: `You're ${formatDistance(result.distanceM ?? 0)} from the job site. Move within ${JOB_GEOFENCE_RADIUS_METERS} m of the customer's address to ${verb}.`,
  };
}

/** EN_ROUTE → IN_PROGRESS, gated on the customer's PIN and on being at the site. */
export async function startJobAction(
  serviceCallId: string,
  pin: string,
  fix: GeoFixInput | null = null
): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  const parsedFix = fix ? geoFixSchema.safeParse(fix) : null;
  const usableFix = parsedFix?.success ? parsedFix.data : null;

  try {
    const verified = await verifyJobPin(serviceCallId, technicianId, pin, "EN_ROUTE");
    if (!verified.ok) return { success: false, error: verified.error };

    const geo = evaluateJobGeofence(serviceCallId, verified.call, usableFix, "start");
    if (geo.error) return { success: false, error: geo.error };

    await prisma.$transaction(async (tx) => {
      await tx.serviceCall.update({
        where: { id: serviceCallId },
        data: { status: "IN_PROGRESS", startedAt: new Date(), pinAttempts: 0, ...geo.fields },
      });
    });

    // Fire-and-forget notification to avoid blocking the client response
    prisma.notification.create({
      data: {
        userId: verified.call.customerId,
        type: "CALL_STATUS_UPDATE",
        title: "Work has started",
        message: "Your technician has started the job.",
        liveCallId: verified.call.liveCallId,
        serviceCallId,
      },
    }).catch(console.error);

    revalidatePath("/technician/service-calls");
    revalidatePath("/vendor/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Start job error:", err);
    return { success: false, error: "Failed to start the job. Please try again." };
  }
}

/** IN_PROGRESS → COMPLETED, gated on the customer's PIN, being at the site, and the closing report. */
export async function completeJobAction(
  serviceCallId: string,
  pin: string,
  report: ServiceReportInput,
  fix: GeoFixInput | null = null
): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  const validated = serviceReportSchema.safeParse(report);
  if (!validated.success) {
    return { success: false, error: "Please complete the report", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  const parsedFix = fix ? geoFixSchema.safeParse(fix) : null;
  const usableFix = parsedFix?.success ? parsedFix.data : null;

  try {
    const verified = await verifyJobPin(serviceCallId, technicianId, pin, "IN_PROGRESS");
    if (!verified.ok) return { success: false, error: verified.error };

    const geo = evaluateJobGeofence(serviceCallId, verified.call, usableFix, "complete");
    if (geo.error) return { success: false, error: geo.error };

    // None of these three writes depends on another's return value — all
    // three inputs (geo.fields, the report data, the notification
    // recipients) are already known before the transaction starts, so they
    // run concurrently instead of one round trip at a time.
    await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.serviceCall.update({
          where: { id: serviceCallId },
          data: { status: "COMPLETED", completedAt: new Date(), pinAttempts: 0, ...geo.fields },
        }),
        tx.serviceReport.upsert({
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
        }),
      ]);
    });

    // Fire-and-forget notifications
    prisma.notification.createMany({
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
    }).catch(console.error);

    revalidatePath("/technician/service-calls");
    revalidatePath("/vendor/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Complete job error:", err);
    return { success: false, error: "Failed to complete the job. Please try again." };
  }
}

/** Vendor-only escape hatch after a technician burns through the PIN attempts. */
/**
 * Vendor-only for their own jobs, or admin for any job — same "look up the
 * call's own vendorId instead of requiring it to match the caller's" shape
 * used across every other admin-bypass added in this pass, so admin gets
 * exactly vendor-equivalent power without a parallel action.
 */
export async function resetJobPinAttemptsAction(serviceCallId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "VENDOR" && session.user.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Not authorized" };
  }

  try {
    const isAdmin = session.user.role === "SUPER_ADMIN";
    let where: { id: string; vendorId?: string } = { id: serviceCallId };
    if (!isAdmin) {
      const vendor = await prisma.vendorProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!vendor) return { success: false, error: "Vendor profile not found" };
      where = { id: serviceCallId, vendorId: vendor.id };
    }

    const updated = await prisma.serviceCall.updateMany({ where, data: { pinAttempts: 0 } });
    if (updated.count === 0) return { success: false, error: "Service call not found" };

    revalidatePath("/vendor/service-calls");
    revalidatePath("/admin/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Reset job pin attempts error:", err);
    return { success: false, error: "Failed to unlock this job" };
  }
}

/**
 * Waives the proximity check for one job — same vendor-or-admin shape as
 * resetJobPinAttemptsAction above. Needed because some orders carry a
 * geocoded city centroid rather than a real pin, making the required
 * distance unachievable no matter where the technician stands; without an
 * escape hatch those jobs could never be started once enforcement is on.
 */
export async function setJobGeofenceBypassAction(
  serviceCallId: string,
  enabled: boolean,
  reason: string
): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "VENDOR" && session.user.role !== "SUPER_ADMIN")) {
    return { success: false, error: "Not authorized" };
  }

  const trimmedReason = reason.trim();
  if (enabled && trimmedReason.length < 3) {
    return { success: false, error: "Say why the location check is being waived." };
  }
  if (trimmedReason.length > 300) return { success: false, error: "That reason is too long." };

  try {
    const isAdmin = session.user.role === "SUPER_ADMIN";
    let where: { id: string; vendorId?: string } = { id: serviceCallId };
    if (!isAdmin) {
      const vendor = await prisma.vendorProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!vendor) return { success: false, error: "Vendor profile not found" };
      where = { id: serviceCallId, vendorId: vendor.id };
    }

    const updated = await prisma.serviceCall.updateMany({
      where,
      data: enabled
        ? {
            geofenceBypass: true,
            geofenceBypassBy: session.user.name?.trim() || (isAdmin ? "An admin" : "The vendor"),
            geofenceBypassReason: trimmedReason,
            geofenceBypassAt: new Date(),
          }
        : { geofenceBypass: false, geofenceBypassBy: null, geofenceBypassReason: null, geofenceBypassAt: null },
    });
    if (updated.count === 0) return { success: false, error: "Service call not found" };

    revalidatePath("/vendor/service-calls");
    revalidatePath("/admin/service-calls");
    return { success: true };
  } catch (err) {
    console.error("Set job geofence bypass error:", err);
    return { success: false, error: "Failed to update the location check" };
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
      call.vendor?.userId === session.user.id ||
      call.technician?.userId === session.user.id ||
      session.user.role === "SUPER_ADMIN";
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
