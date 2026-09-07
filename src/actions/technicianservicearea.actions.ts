"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { forwardGeocodePincode } from "@/lib/geocode";
import {
  addServiceAreaSchema,
  updateServiceAreaRadiusSchema,
  AddServiceAreaInput,
  UpdateServiceAreaRadiusInput,
} from "@/lib/validations/technicianservicearea.schema";

async function requireTechnicianId(): Promise<{ technicianId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { technicianId: null, error: "Not signed in as a technician" };
  }
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { technicianId: null, error: "Technician profile not found" };
  return { technicianId: profile.id, error: null };
}

/**
 * Unlike the vendor version, these areas don't gate any matching logic
 * today — they're informational/visual on the vendor's and admin's live-calls
 * maps. Still revalidate both so a change shows up there immediately.
 */
function revalidateServiceAreaSurfaces() {
  revalidatePath("/technician/service-areas");
  revalidatePath("/vendor/live-calls");
  revalidatePath("/admin/live-calls");
}

export interface TechnicianServiceAreaSummary {
  id: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export async function getMyServiceAreasAction(): Promise<ActionResponse<TechnicianServiceAreaSummary[]>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  const areas = await prisma.technicianServiceArea.findMany({
    where: { technicianId },
    orderBy: { createdAt: "asc" },
  });
  return { success: true, data: areas };
}

export async function addServiceAreaAction(input: AddServiceAreaInput): Promise<ActionResponse<{ id: string }>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  const validated = addServiceAreaSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { pincode, radiusKm } = validated.data;

  try {
    const existing = await prisma.technicianServiceArea.findUnique({
      where: { technicianId_pincode: { technicianId, pincode } },
    });
    if (existing) {
      return {
        success: false,
        error: "This pincode is already in your serviceable areas",
        errors: { pincode: ["Already added"] },
      };
    }

    const coords = await forwardGeocodePincode(pincode);
    if (!coords) {
      return {
        success: false,
        error: "Couldn't locate that pincode. Please double-check it and try again.",
        errors: { pincode: ["Couldn't locate this pincode"] },
      };
    }

    const area = await prisma.technicianServiceArea.create({
      data: { technicianId, pincode, latitude: coords.latitude, longitude: coords.longitude, radiusKm },
    });

    revalidateServiceAreaSurfaces();
    return { success: true, data: { id: area.id } };
  } catch (err) {
    console.error("Add service area error:", err);
    return { success: false, error: "Failed to add serviceable area" };
  }
}

export async function updateServiceAreaRadiusAction(input: UpdateServiceAreaRadiusInput): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  const validated = updateServiceAreaRadiusSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { id, radiusKm } = validated.data;

  try {
    const area = await prisma.technicianServiceArea.findUnique({ where: { id }, select: { technicianId: true } });
    if (!area || area.technicianId !== technicianId) {
      return { success: false, error: "Serviceable area not found" };
    }

    await prisma.technicianServiceArea.update({ where: { id }, data: { radiusKm } });

    revalidateServiceAreaSurfaces();
    return { success: true };
  } catch (err) {
    console.error("Update service area error:", err);
    return { success: false, error: "Failed to update serviceable area" };
  }
}

export async function removeServiceAreaAction(id: string): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  try {
    const area = await prisma.technicianServiceArea.findUnique({ where: { id }, select: { technicianId: true } });
    if (!area || area.technicianId !== technicianId) {
      return { success: false, error: "Serviceable area not found" };
    }

    await prisma.technicianServiceArea.delete({ where: { id } });

    revalidateServiceAreaSurfaces();
    return { success: true };
  } catch (err) {
    console.error("Remove service area error:", err);
    return { success: false, error: "Failed to remove serviceable area" };
  }
}

export interface AdminTechnicianServiceArea {
  id: string;
  technicianId: string;
  technicianName: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

/** Every technician's coverage areas, for the admin's global live-calls map. */
export async function getAllTechnicianServiceAreasForAdminAction(): Promise<ActionResponse<AdminTechnicianServiceArea[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const areas = await prisma.technicianServiceArea.findMany({
    include: { technician: { include: { user: { select: { name: true } } } } },
    orderBy: { createdAt: "asc" },
  });

  return {
    success: true,
    data: areas.map((a) => ({
      id: a.id,
      technicianId: a.technicianId,
      technicianName: a.technician.user.name ?? "",
      pincode: a.pincode,
      latitude: a.latitude,
      longitude: a.longitude,
      radiusKm: a.radiusKm,
    })),
  };
}
