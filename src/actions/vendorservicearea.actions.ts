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
} from "@/lib/validations/vendorservicearea.schema";

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
 * Matching (getNearbyLiveCallsForVendorAction) and the admin map both depend
 * on this data, so every mutation revalidates all three surfaces.
 */
function revalidateServiceAreaSurfaces() {
  revalidatePath("/vendor/service-areas");
  revalidatePath("/vendor/live-calls");
  revalidatePath("/admin/live-calls");
}

export interface VendorServiceAreaSummary {
  id: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export async function getMyServiceAreasAction(): Promise<ActionResponse<VendorServiceAreaSummary[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  const areas = await prisma.vendorServiceArea.findMany({
    where: { vendorId },
    orderBy: { createdAt: "asc" },
  });
  return { success: true, data: areas };
}

export async function addServiceAreaAction(input: AddServiceAreaInput): Promise<ActionResponse<{ id: string }>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  const validated = addServiceAreaSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { pincode, radiusKm } = validated.data;

  try {
    const existing = await prisma.vendorServiceArea.findUnique({
      where: { vendorId_pincode: { vendorId, pincode } },
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

    const area = await prisma.vendorServiceArea.create({
      data: { vendorId, pincode, latitude: coords.latitude, longitude: coords.longitude, radiusKm },
    });

    revalidateServiceAreaSurfaces();
    return { success: true, data: { id: area.id } };
  } catch (err) {
    console.error("Add service area error:", err);
    return { success: false, error: "Failed to add serviceable area" };
  }
}

export async function updateServiceAreaRadiusAction(input: UpdateServiceAreaRadiusInput): Promise<ActionResponse> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  const validated = updateServiceAreaRadiusSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { id, radiusKm } = validated.data;

  try {
    const area = await prisma.vendorServiceArea.findUnique({ where: { id }, select: { vendorId: true } });
    if (!area || area.vendorId !== vendorId) {
      return { success: false, error: "Serviceable area not found" };
    }

    await prisma.vendorServiceArea.update({ where: { id }, data: { radiusKm } });

    revalidateServiceAreaSurfaces();
    return { success: true };
  } catch (err) {
    console.error("Update service area error:", err);
    return { success: false, error: "Failed to update serviceable area" };
  }
}

export async function removeServiceAreaAction(id: string): Promise<ActionResponse> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const area = await prisma.vendorServiceArea.findUnique({ where: { id }, select: { vendorId: true } });
    if (!area || area.vendorId !== vendorId) {
      return { success: false, error: "Serviceable area not found" };
    }

    await prisma.vendorServiceArea.delete({ where: { id } });

    revalidateServiceAreaSurfaces();
    return { success: true };
  } catch (err) {
    console.error("Remove service area error:", err);
    return { success: false, error: "Failed to remove serviceable area" };
  }
}

export interface AdminVendorServiceArea {
  id: string;
  vendorId: string;
  companyName: string;
  pincode: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

/** Every vendor's coverage areas, for the admin's global live-calls map. */
export async function getAllVendorServiceAreasForAdminAction(): Promise<ActionResponse<AdminVendorServiceArea[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const areas = await prisma.vendorServiceArea.findMany({
    include: { vendor: { select: { companyName: true } } },
    orderBy: { createdAt: "asc" },
  });

  return {
    success: true,
    data: areas.map((a) => ({
      id: a.id,
      vendorId: a.vendorId,
      companyName: a.vendor.companyName,
      pincode: a.pincode,
      latitude: a.latitude,
      longitude: a.longitude,
      radiusKm: a.radiusKm,
    })),
  };
}
