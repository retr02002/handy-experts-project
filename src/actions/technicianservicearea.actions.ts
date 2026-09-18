"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { forwardGeocodePincode } from "@/lib/geocode";

export interface TechnicianServiceAreaSummary {
  id: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export async function getTechnicianServiceAreasAction(
  technicianId: string
): Promise<ActionResponse<TechnicianServiceAreaSummary[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const areas = await prisma.technicianServiceArea.findMany({
      where: { technicianId },
      orderBy: { createdAt: "asc" },
      select: { id: true, pincode: true, latitude: true, longitude: true, radiusKm: true },
    });
    return { success: true, data: areas };
  } catch (err) {
    console.error("Get technician areas error:", err);
    return { success: false, error: "Failed to load service areas" };
  }
}

export async function addTechnicianServiceAreaAction(input: {
  technicianId: string;
  pincode: string;
  radiusKm?: number;
}): Promise<ActionResponse<{ id: string }>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const tech = await prisma.technicianProfile.findUnique({
      where: { id: input.technicianId },
    });
    if (!tech) return { success: false, error: "Technician not found" };

    const existing = await prisma.technicianServiceArea.findFirst({
      where: { technicianId: input.technicianId, pincode: input.pincode },
    });
    if (existing) return { success: false, error: "This pincode is already added" };

    const coords = await forwardGeocodePincode(input.pincode);
    if (!coords) return { success: false, error: "Couldn't find location for this pincode" };

    const area = await prisma.technicianServiceArea.create({
      data: {
        technicianId: input.technicianId,
        pincode: input.pincode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        radiusKm: input.radiusKm ?? 5,
      },
    });

    revalidatePath(`/admin/freelance-technicians/${input.technicianId}`);
    return { success: true, data: { id: area.id } };
  } catch (err) {
    console.error("Add technician area error:", err);
    return { success: false, error: "Failed to add service area" };
  }
}

export async function updateTechnicianServiceAreaRadiusAction(input: {
  id: string;
  radiusKm: number;
}): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const area = await prisma.technicianServiceArea.update({
      where: { id: input.id },
      data: { radiusKm: input.radiusKm },
    });
    revalidatePath(`/admin/freelance-technicians/${area.technicianId}`);
    return { success: true };
  } catch (err) {
    console.error("Update technician area radius error:", err);
    return { success: false, error: "Failed to update radius" };
  }
}

export async function removeTechnicianServiceAreaAction(id: string): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const area = await prisma.technicianServiceArea.findUnique({ where: { id } });
    if (!area) return { success: false, error: "Area not found" };

    await prisma.technicianServiceArea.delete({ where: { id } });
    revalidatePath(`/admin/freelance-technicians/${area.technicianId}`);
    return { success: true };
  } catch (err) {
    console.error("Remove technician area error:", err);
    return { success: false, error: "Failed to remove area" };
  }
}
