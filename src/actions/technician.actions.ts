"use server";

import crypto from "crypto";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import {
  createTechnicianSchema,
  updateTechnicianSchema,
  type CreateTechnicianInput,
  type UpdateTechnicianInput,
} from "@/lib/validations/technician.schema";
import { requireAdmin } from "@/lib/require-admin";
import { sendTextMessage } from "@/lib/apitxt";

/** Slugified name + random suffix, retried on collision. @unique on User.username is the hard backstop. */
async function generateUsername(name: string): Promise<string> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) || "tech";
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${slug}${crypto.randomInt(1000, 10000)}`;
    const existing = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique username");
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

async function requireTechnicianId(): Promise<{ technicianId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { technicianId: null, error: "Not signed in as a technician" };
  }
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { technicianId: null, error: "Technician profile not found" };
  return { technicianId: profile.id, error: null };
}

export interface CreatedTechnicianCredentials {
  email: string;
  username: string;
  tempPassword: string;
  smsDelivered: boolean;
}

/**
 * Vendor-initiated technician creation. Generates a one-time-shown temp
 * password and an auto-generated username, and best-effort texts both to
 * the technician's phone — delivery failure never fails the whole action,
 * since the credentials are always also shown to the vendor to relay
 * manually as a fallback.
 */
export async function createTechnicianAction(
  input: CreateTechnicianInput
): Promise<ActionResponse<CreatedTechnicianCredentials>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  const validated = createTechnicianSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { name, email, phone, skillCategory, experienceYears, servicePincode } = validated.data;

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingEmail) {
      return { success: false, error: "A user with this email already exists", errors: { email: ["Already in use"] } };
    }

    const existingPhone = await prisma.user.findUnique({ where: { phone }, select: { role: true } });
    if (existingPhone) {
      return {
        success: false,
        error: `This phone number is already registered as a ${existingPhone.role.toLowerCase()} — log in instead.`,
        errors: { phone: ["Already in use"] },
      };
    }

    const username = await generateUsername(name);
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name, phone, username, password: hashedPassword, role: "TECHNICIAN" },
      });
      await tx.technicianProfile.create({
        data: {
          userId: user.id,
          type: "VENDOR_MANAGED",
          vendorId,
          skillCategory,
          experienceYears,
          servicePincode,
        },
      });
    });

    const sendResult = await sendTextMessage({
      phone,
      channel: "SMS",
      message: `Your Handyzo technician login — Username: ${username}  Temp password: ${tempPassword}. Please log in and change your password.`,
    });

    revalidatePath("/vendor/technicians");
    return { success: true, data: { email, username, tempPassword, smsDelivered: sendResult.ok } };
  } catch (err) {
    console.error("Create technician error:", err);
    return { success: false, error: "Failed to create technician" };
  }
}

export async function updateTechnicianAction(input: UpdateTechnicianInput): Promise<ActionResponse> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  const validated = updateTechnicianSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { id, name, email, phone, skillCategory, experienceYears, servicePincode } = validated.data;

  try {
    const technician = await prisma.technicianProfile.findFirst({ where: { id, vendorId }, select: { userId: true } });
    if (!technician) return { success: false, error: "Technician not found" };

    const emailTaken = await prisma.user.findFirst({
      where: { email, NOT: { id: technician.userId } },
      select: { id: true },
    });
    if (emailTaken) {
      return { success: false, error: "That email is already in use", errors: { email: ["Already in use"] } };
    }

    const phoneTaken = await prisma.user.findFirst({
      where: { phone, NOT: { id: technician.userId } },
      select: { role: true },
    });
    if (phoneTaken) {
      return {
        success: false,
        error: `This phone number is already registered as a ${phoneTaken.role.toLowerCase()} — can't reuse it here.`,
        errors: { phone: ["Already in use"] },
      };
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: technician.userId }, data: { name, email, phone } }),
      prisma.technicianProfile.update({ where: { id }, data: { skillCategory, experienceYears, servicePincode } }),
    ]);

    revalidatePath("/vendor/technicians");
    return { success: true };
  } catch (err) {
    console.error("Update technician error:", err);
    return { success: false, error: "Failed to update technician" };
  }
}

/**
 * Hard-deletes the technician's account. Blocked when they have any
 * ServiceCall history — ServiceCall.technician cascades on delete, so
 * allowing this unconditionally would silently wipe job/payment history.
 */
export async function deleteTechnicianAction(id: string): Promise<ActionResponse> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const technician = await prisma.technicianProfile.findFirst({ where: { id, vendorId }, select: { userId: true } });
    if (!technician) return { success: false, error: "Technician not found" };

    const serviceCallCount = await prisma.serviceCall.count({ where: { technicianId: id } });
    if (serviceCallCount > 0) {
      return {
        success: false,
        error: "This technician has service call history and can't be deleted. Reassign or complete their active jobs first.",
      };
    }

    await prisma.user.delete({ where: { id: technician.userId } });
    revalidatePath("/vendor/technicians");
    return { success: true };
  } catch (err) {
    console.error("Delete technician error:", err);
    return { success: false, error: "Failed to delete technician" };
  }
}

/** Vendor-initiated password reset for a technician they manage — same one-time-shown temp-password UX as creation. */
export async function resetTechnicianPasswordAction(
  id: string
): Promise<ActionResponse<{ tempPassword: string; smsDelivered: boolean }>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const technician = await prisma.technicianProfile.findFirst({
      where: { id, vendorId },
      select: { userId: true, user: { select: { phone: true, username: true } } },
    });
    if (!technician) return { success: false, error: "Technician not found" };

    const tempPassword = crypto.randomBytes(9).toString("base64url");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    await prisma.user.update({ where: { id: technician.userId }, data: { password: hashedPassword } });

    let smsDelivered = false;
    if (technician.user.phone) {
      const sendResult = await sendTextMessage({
        phone: technician.user.phone,
        channel: "SMS",
        message: `Your Handyzo technician password was reset. Username: ${technician.user.username ?? ""}  New temp password: ${tempPassword}`,
      });
      smsDelivered = sendResult.ok;
    }

    return { success: true, data: { tempPassword, smsDelivered } };
  } catch (err) {
    console.error("Reset technician password error:", err);
    return { success: false, error: "Failed to reset password" };
  }
}

export interface VendorTechnician {
  id: string;
  name: string;
  email: string;
  phone: string;
  skillCategory: string;
  experienceYears: number;
  servicePincode: string;
  type: string;
  isOnDuty: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export async function getMyTechniciansAction(): Promise<ActionResponse<VendorTechnician[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const rows = await prisma.technicianProfile.findMany({
      where: { vendorId },
      include: { user: { select: { name: true, email: true, phone: true } }, location: true },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.user.name ?? "",
        email: r.user.email ?? "",
        phone: r.user.phone ?? "",
        skillCategory: r.skillCategory,
        experienceYears: r.experienceYears,
        servicePincode: r.servicePincode,
        type: r.type,
        isOnDuty: r.location?.isOnDuty ?? false,
        latitude: r.location?.latitude ?? null,
        longitude: r.location?.longitude ?? null,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Get my technicians error:", err);
    return { success: false, error: "Failed to load technicians" };
  }
}

export interface AdminTechnician {
  id: string;
  name: string;
  vendorName: string;
  isOnDuty: boolean;
  latitude: number | null;
  longitude: number | null;
}

/** Admin sees every technician across every vendor, for the platform-wide live map. */
export async function getAllTechniciansForAdminAction(): Promise<ActionResponse<AdminTechnician[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.technicianProfile.findMany({
      include: { user: { select: { name: true } }, vendor: { select: { companyName: true } }, location: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.user.name ?? "",
        vendorName: r.vendor?.companyName ?? "Freelance",
        isOnDuty: r.location?.isOnDuty ?? false,
        latitude: r.location?.latitude ?? null,
        longitude: r.location?.longitude ?? null,
      })),
    };
  } catch (err) {
    console.error("Get all technicians for admin error:", err);
    return { success: false, error: "Failed to load technicians" };
  }
}

/** Durable, throttled position write — called periodically while on duty, not on every GPS tick. */
export async function updateTechnicianLocationAction(latitude: number, longitude: number): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return { success: false, error: "Invalid coordinates" };
  }

  try {
    await prisma.technicianLocation.upsert({
      where: { technicianId },
      create: { technicianId, latitude, longitude, isOnDuty: true },
      update: { latitude, longitude, isOnDuty: true },
    });
    return { success: true };
  } catch (err) {
    console.error("Update technician location error:", err);
    return { success: false, error: "Failed to update location" };
  }
}

export async function setTechnicianDutyStatusAction(isOnDuty: boolean): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  try {
    // updateMany (not update) so toggling off before any location was ever
    // recorded is a harmless no-op instead of a "row not found" error.
    await prisma.technicianLocation.updateMany({ where: { technicianId }, data: { isOnDuty } });
    return { success: true };
  } catch (err) {
    console.error("Set technician duty status error:", err);
    return { success: false, error: "Failed to update duty status" };
  }
}
