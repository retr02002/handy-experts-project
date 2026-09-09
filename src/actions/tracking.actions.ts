"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/actions/auth.actions";
import { getRoute } from "@/lib/routing";

/**
 * Statuses where the technician's position is genuinely in play.
 *
 * ASSIGNED is deliberately excluded: a job can be accepted days before its
 * slot, and until the technician actually sets off their whereabouts say
 * nothing about when they'll arrive. Tracking begins at EN_ROUTE.
 */
const LIVE_STATUSES = ["EN_ROUTE", "IN_PROGRESS"];

/**
 * Past this age a stored position stops being "where the technician is" and
 * becomes "where the technician last was". On duty the device writes every
 * ~12s, so 10 minutes is ~50 consecutive missed writes — a dead phone, denied
 * location, or a closed app, not a brief GPS gap. Callers must not present a
 * stale position as live tracking: a 6-hour-old fix reading "5 m away, approx
 * 1 min" tells the customer someone is at their door who may be miles away.
 */
const STALE_POSITION_AFTER_SECONDS = 600;

export interface JobRoute {
  /** [lng, lat] pairs for a GeoJSON LineString. */
  coordinates: [number, number][];
  distanceKm: number;
  durationMin: number;
  /** "straight" means routing was unavailable and this is a rough estimate. */
  source: "osrm" | "straight";
  technicianLatitude: number;
  technicianLongitude: number;
  customerLatitude: number;
  customerLongitude: number;
  /** When the technician's position was last written. */
  updatedAt: string;
  /** Age of that position in seconds, computed server-side. */
  ageSeconds: number;
  /**
   * True when the position is too old to stand for "where they are now".
   * `distanceKm`/`durationMin`/`coordinates` are still returned so the last
   * known position can be drawn, but they must not be labelled as live.
   */
  isStale: boolean;
}

/**
 * The technician→customer leg for one job, for whichever party is looking at
 * it. Returns null (not an error) when there's simply nothing to draw yet —
 * no technician assigned, no position on file, or the job already finished,
 * at which point the technician's whereabouts stop being the customer's
 * business.
 */
export async function getJobRouteAction(serviceCallId: string): Promise<ActionResponse<JobRoute | null>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };
  const userId = session.user.id;

  try {
    const call = await prisma.serviceCall.findUnique({
      where: { id: serviceCallId },
      select: {
        status: true,
        customerId: true,
        vendor: { select: { userId: true } },
        technician: {
          select: {
            userId: true,
            location: { select: { latitude: true, longitude: true, updatedAt: true } },
          },
        },
        liveCall: { select: { latitude: true, longitude: true } },
      },
    });
    if (!call) return { success: false, error: "Job not found" };

    const allowed =
      call.customerId === userId ||
      call.vendor.userId === userId ||
      call.technician?.userId === userId;
    if (!allowed) return { success: false, error: "You don't have access to this job" };

    if (!LIVE_STATUSES.includes(call.status)) return { success: true, data: null };
    const techLocation = call.technician?.location;
    if (!techLocation) return { success: true, data: null };

    const ageSeconds = Math.max(0, Math.round((Date.now() - techLocation.updatedAt.getTime()) / 1000));
    const isStale = ageSeconds > STALE_POSITION_AFTER_SECONDS;

    // Routing a stale position would burn an OSRM call to answer a question
    // nobody should be asking ("how far is this six-hour-old dot?"), so skip
    // it and hand back the bare last-known point.
    const route = isStale
      ? { coordinates: [] as [number, number][], distanceKm: 0, durationMin: 0, source: "straight" as const }
      : await getRoute(
          { latitude: techLocation.latitude, longitude: techLocation.longitude },
          { latitude: call.liveCall.latitude, longitude: call.liveCall.longitude }
        );

    return {
      success: true,
      data: {
        ...route,
        technicianLatitude: techLocation.latitude,
        technicianLongitude: techLocation.longitude,
        customerLatitude: call.liveCall.latitude,
        customerLongitude: call.liveCall.longitude,
        updatedAt: techLocation.updatedAt.toISOString(),
        ageSeconds,
        isStale,
      },
    };
  } catch (err) {
    console.error("Get job route error:", err);
    return { success: false, error: "Failed to load live tracking" };
  }
}
