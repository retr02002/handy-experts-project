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
import { STALE_POSITION_AFTER_SECONDS } from "@/lib/constants";
import { haversineKm } from "@/lib/geo";
import { applySkillAssignments, deriveLegacySkillLabel } from "@/lib/technicianSkills";
import { issueTechnicianId, formatTechnicianId } from "@/lib/structuredIds";

/** Slugified name + random suffix, retried on collision. @unique on User.username is the hard backstop. */
export async function generateUsername(name: string): Promise<string> {
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
  technicianNumber: string;
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
  const { name, email, phone, skillAssignments, experienceYears, servicePincode, city } = validated.data;
  const requestedUsername = validated.data.username?.trim().toLowerCase() || null;

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

    if (requestedUsername) {
      const taken = await prisma.user.findUnique({ where: { username: requestedUsername }, select: { id: true } });
      if (taken) {
        return { success: false, error: "That username is already taken", errors: { username: ["Already taken"] } };
      }
    }
    const username = requestedUsername ?? (await generateUsername(name));
    const tempPassword = crypto.randomBytes(9).toString("base64url");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const skillCategory = await deriveLegacySkillLabel(prisma, skillAssignments);

    const { technicianId, idParts } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name, phone, username, password: hashedPassword, role: "TECHNICIAN" },
      });
      const technician = await tx.technicianProfile.create({
        data: {
          userId: user.id,
          type: "VENDOR_MANAGED",
          vendorId,
          skillCategory,
          experienceYears,
          servicePincode: servicePincode || null,
        },
      });
      await applySkillAssignments(tx, technician.id, skillAssignments);
      const idParts = await issueTechnicianId(tx, technician.id, city);
      return { technicianId: technician.id, idParts };
    });

    const sendResult = await sendTextMessage({
      phone,
      channel: "SMS",
      message: `Your Handyzo technician login — Username: ${username}  Temp password: ${tempPassword}. Please log in and change your password.`,
    });

    revalidatePath("/vendor/technicians");
    return {
      success: true,
      data: {
        email,
        username,
        tempPassword,
        smsDelivered: sendResult.ok,
        technicianNumber: formatTechnicianId(name, idParts.idCityCode, idParts.idSeq, technicianId),
      },
    };
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
  const { id, name, email, phone, skillAssignments, experienceYears, servicePincode } = validated.data;

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

    const skillCategory = await deriveLegacySkillLabel(prisma, skillAssignments);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: technician.userId }, data: { name, email, phone } });
      await tx.technicianProfile.update({
        where: { id },
        data: { skillCategory, experienceYears, servicePincode: servicePincode || null },
      });
      await applySkillAssignments(tx, id, skillAssignments);
    });

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
  /**
   * Shown permanently in the vendor's list, not just once at creation.
   * Without it a vendor who closed the credentials dialog had no way to tell
   * their technician how to log in.
   */
  username: string | null;
  /** Live aggregates so a vendor can see who is actually performing. */
  ratingAvg: number | null;
  ratingCount: number;
  jobsCompleted: number;
  jobsActive: number;
  skillCategory: string;
  experienceYears: number;
  /** Courtesy display only — no longer collected or used for matching. */
  servicePincode: string | null;
  type: string;
  leadFeeType: "FIXED" | "PERCENTAGE";
  leadFeeAmount: number;
  isOnDuty: boolean;
  isWithinServiceArea: boolean;
  latitude: number | null;
  longitude: number | null;
  /** On-duty but hasn't reported a position in over STALE_POSITION_AFTER_SECONDS — feeds the tracking map's red-dot "disconnected" indicator. Computed here (server-side) rather than from a raw timestamp so no client component needs to call Date.now() during render. */
  isStale: boolean;
  /** Raw last-position timestamp, for an absolute "last seen" display (toLocaleString on a fixed prop, never a live-ticking Date.now() computation). */
  locationUpdatedAt: string | null;
  /** Null in every vendor-facing action (the vendor already knows it's their own team) — set only by the admin-by-id action, which spans every vendor. */
  vendorName: string | null;
  /** What this technician is actually assigned to do — feeds the edit modal's builder. */
  skillAssignments: { categoryId: string; categoryName: string; serviceIds: string[] }[];
  createdAt: string;
}

export async function getMyTechniciansAction(): Promise<ActionResponse<VendorTechnician[]>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    // One grouped count for the whole team rather than a query per
    // technician — this list is polled, so an N+1 here would scale with
    // headcount on every refresh. Vendor's own coverage circles fetched
    // once too, to compute each technician's isWithinServiceArea in-memory
    // rather than per-row.
    const [rows, counts, areas] = await Promise.all([
      prisma.technicianProfile.findMany({
        where: { vendorId },
        include: {
          user: { select: { name: true, email: true, phone: true, username: true } },
          location: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceCall.groupBy({
        by: ["technicianId", "status"],
        where: { vendorId, technicianId: { not: null } },
        _count: { _all: true },
      }),
      prisma.vendorServiceArea.findMany({ where: { vendorId }, select: { latitude: true, longitude: true, radiusKm: true } }),
    ]);

    const technicianIds = rows.map((r) => r.id);
    const [wholeCategoryRows, narrowServiceRows] = await Promise.all([
      prisma.technicianCategory.findMany({
        where: { technicianId: { in: technicianIds } },
        select: { technicianId: true, categoryId: true, category: { select: { name: true } } },
      }),
      prisma.technicianService.findMany({
        where: { technicianId: { in: technicianIds } },
        select: { technicianId: true, serviceId: true, service: { select: { category: { select: { id: true, name: true } } } } },
      }),
    ]);

    // Merge into one display list per technician: a whole-category entry
    // (serviceIds: []) wins over narrower entries for the same category —
    // it already covers everything those services would.
    const assignmentsByTechnician = new Map<string, Map<string, { categoryName: string; serviceIds: string[] }>>();
    for (const id of technicianIds) assignmentsByTechnician.set(id, new Map());

    for (const row of wholeCategoryRows) {
      assignmentsByTechnician.get(row.technicianId)?.set(row.categoryId, { categoryName: row.category.name, serviceIds: [] });
    }
    for (const row of narrowServiceRows) {
      const categoryId = row.service.category?.id;
      const categoryName = row.service.category?.name;
      if (!categoryId || !categoryName) continue;
      const map = assignmentsByTechnician.get(row.technicianId);
      if (!map) continue;
      const existing = map.get(categoryId);
      if (existing && existing.serviceIds.length === 0) continue; // whole-category already covers this
      if (existing) existing.serviceIds.push(row.serviceId);
      else map.set(categoryId, { categoryName, serviceIds: [row.serviceId] });
    }

    const ACTIVE: string[] = ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"];
    const completedBy = new Map<string, number>();
    const activeBy = new Map<string, number>();
    for (const c of counts) {
      if (!c.technicianId) continue;
      const n = c._count._all;
      if (c.status === "COMPLETED") {
        completedBy.set(c.technicianId, (completedBy.get(c.technicianId) ?? 0) + n);
      } else if (ACTIVE.includes(c.status)) {
        activeBy.set(c.technicianId, (activeBy.get(c.technicianId) ?? 0) + n);
      }
    }

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.user.name ?? "",
        email: r.user.email ?? "",
        phone: r.user.phone ?? "",
        username: r.user.username,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        jobsCompleted: completedBy.get(r.id) ?? 0,
        jobsActive: activeBy.get(r.id) ?? 0,
        skillCategory: r.skillCategory,
        experienceYears: r.experienceYears,
        servicePincode: r.servicePincode,
        type: r.type,
        leadFeeType: r.leadFeeType,
        leadFeeAmount: r.leadFeeAmount,
        isOnDuty: r.location?.isOnDuty ?? false,
        isWithinServiceArea: r.location
          ? areas.some((a) => haversineKm(a.latitude, a.longitude, r.location!.latitude, r.location!.longitude) <= a.radiusKm)
          : false,
        latitude: r.location?.latitude ?? null,
        longitude: r.location?.longitude ?? null,
        isStale: !!r.location?.isOnDuty && (Date.now() - r.location.updatedAt.getTime()) / 1000 > STALE_POSITION_AFTER_SECONDS,
        locationUpdatedAt: r.location?.updatedAt.toISOString() ?? null,
        vendorName: null,
        skillAssignments: [...(assignmentsByTechnician.get(r.id) ?? new Map())].map(([categoryId, v]) => ({
          categoryId,
          categoryName: v.categoryName,
          serviceIds: v.serviceIds,
        })),
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Get my technicians error:", err);
    return { success: false, error: "Failed to load technicians" };
  }
}

/**
 * Single-technician variant of getMyTechniciansAction, for the vendor's
 * technician detail page — same shape, scoped to one id (and ownership-
 * checked against the calling vendor) instead of fetching the whole roster
 * to find one row.
 */
export async function getVendorTechnicianByIdAction(technicianId: string): Promise<ActionResponse<VendorTechnician>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const [r, completedCount, activeCount, areas, wholeCategoryRows, narrowServiceRows] = await Promise.all([
      prisma.technicianProfile.findFirst({
        where: { id: technicianId, vendorId },
        include: { user: { select: { name: true, email: true, phone: true, username: true } }, location: true },
      }),
      prisma.serviceCall.count({ where: { technicianId, vendorId, status: "COMPLETED" } }),
      prisma.serviceCall.count({ where: { technicianId, vendorId, status: { in: ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] } } }),
      prisma.vendorServiceArea.findMany({ where: { vendorId }, select: { latitude: true, longitude: true, radiusKm: true } }),
      prisma.technicianCategory.findMany({
        where: { technicianId },
        select: { categoryId: true, category: { select: { name: true } } },
      }),
      prisma.technicianService.findMany({
        where: { technicianId },
        select: { serviceId: true, service: { select: { category: { select: { id: true, name: true } } } } },
      }),
    ]);
    if (!r) return { success: false, error: "Technician not found" };

    const assignments = new Map<string, { categoryName: string; serviceIds: string[] }>();
    for (const row of wholeCategoryRows) assignments.set(row.categoryId, { categoryName: row.category.name, serviceIds: [] });
    for (const row of narrowServiceRows) {
      const categoryId = row.service.category?.id;
      const categoryName = row.service.category?.name;
      if (!categoryId || !categoryName) continue;
      const existing = assignments.get(categoryId);
      if (existing && existing.serviceIds.length === 0) continue; // whole-category already covers this
      if (existing) existing.serviceIds.push(row.serviceId);
      else assignments.set(categoryId, { categoryName, serviceIds: [row.serviceId] });
    }

    return {
      success: true,
      data: {
        id: r.id,
        name: r.user.name ?? "",
        email: r.user.email ?? "",
        phone: r.user.phone ?? "",
        username: r.user.username,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        jobsCompleted: completedCount,
        jobsActive: activeCount,
        skillCategory: r.skillCategory,
        experienceYears: r.experienceYears,
        servicePincode: r.servicePincode,
        type: r.type,
        leadFeeType: r.leadFeeType,
        leadFeeAmount: r.leadFeeAmount,
        isOnDuty: r.location?.isOnDuty ?? false,
        isWithinServiceArea: r.location
          ? areas.some((a) => haversineKm(a.latitude, a.longitude, r.location!.latitude, r.location!.longitude) <= a.radiusKm)
          : false,
        latitude: r.location?.latitude ?? null,
        longitude: r.location?.longitude ?? null,
        isStale: !!r.location?.isOnDuty && (Date.now() - r.location.updatedAt.getTime()) / 1000 > STALE_POSITION_AFTER_SECONDS,
        locationUpdatedAt: r.location?.updatedAt.toISOString() ?? null,
        vendorName: null,
        skillAssignments: [...assignments].map(([categoryId, v]) => ({ categoryId, categoryName: v.categoryName, serviceIds: v.serviceIds })),
        createdAt: r.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Get vendor technician by id error:", err);
    return { success: false, error: "Failed to load technician" };
  }
}

/**
 * Admin-by-id counterpart to getVendorTechnicianByIdAction — same shape,
 * but spans every vendor (no ownership scoping) since an admin can view
 * any technician on the platform, including freelancers.
 */
export async function getAdminTechnicianByIdAction(technicianId: string): Promise<ActionResponse<VendorTechnician>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const r = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
      include: {
        user: { select: { name: true, email: true, phone: true, username: true } },
        vendor: { select: { companyName: true } },
        location: true,
      },
    });
    if (!r) return { success: false, error: "Technician not found" };

    const [completedCount, activeCount, areas, wholeCategoryRows, narrowServiceRows] = await Promise.all([
      prisma.serviceCall.count({ where: { technicianId, status: "COMPLETED" } }),
      prisma.serviceCall.count({ where: { technicianId, status: { in: ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] } } }),
      r.vendorId
        ? prisma.vendorServiceArea.findMany({ where: { vendorId: r.vendorId }, select: { latitude: true, longitude: true, radiusKm: true } })
        : Promise.resolve([]),
      prisma.technicianCategory.findMany({ where: { technicianId }, select: { categoryId: true, category: { select: { name: true } } } }),
      prisma.technicianService.findMany({
        where: { technicianId },
        select: { serviceId: true, service: { select: { category: { select: { id: true, name: true } } } } },
      }),
    ]);

    const assignments = new Map<string, { categoryName: string; serviceIds: string[] }>();
    for (const row of wholeCategoryRows) assignments.set(row.categoryId, { categoryName: row.category.name, serviceIds: [] });
    for (const row of narrowServiceRows) {
      const categoryId = row.service.category?.id;
      const categoryName = row.service.category?.name;
      if (!categoryId || !categoryName) continue;
      const existing = assignments.get(categoryId);
      if (existing && existing.serviceIds.length === 0) continue;
      if (existing) existing.serviceIds.push(row.serviceId);
      else assignments.set(categoryId, { categoryName, serviceIds: [row.serviceId] });
    }

    return {
      success: true,
      data: {
        id: r.id,
        name: r.user.name ?? "",
        email: r.user.email ?? "",
        phone: r.user.phone ?? "",
        username: r.user.username,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        jobsCompleted: completedCount,
        jobsActive: activeCount,
        skillCategory: r.skillCategory,
        experienceYears: r.experienceYears,
        servicePincode: r.servicePincode,
        type: r.type,
        leadFeeType: r.leadFeeType,
        leadFeeAmount: r.leadFeeAmount,
        isOnDuty: r.location?.isOnDuty ?? false,
        isWithinServiceArea: r.location
          ? areas.some((a) => haversineKm(a.latitude, a.longitude, r.location!.latitude, r.location!.longitude) <= a.radiusKm)
          : false,
        latitude: r.location?.latitude ?? null,
        longitude: r.location?.longitude ?? null,
        isStale: !!r.location?.isOnDuty && (Date.now() - r.location.updatedAt.getTime()) / 1000 > STALE_POSITION_AFTER_SECONDS,
        locationUpdatedAt: r.location?.updatedAt.toISOString() ?? null,
        vendorName: r.vendor?.companyName ?? null,
        skillAssignments: [...assignments].map(([categoryId, v]) => ({ categoryId, categoryName: v.categoryName, serviceIds: v.serviceIds })),
        createdAt: r.createdAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Get admin technician by id error:", err);
    return { success: false, error: "Failed to load technician" };
  }
}

export interface AdminTechnician {
  id: string;
  name: string;
  phone: string;
  skillCategory: string;
  vendorName: string;
  leadFeeType: "FIXED" | "PERCENTAGE";
  leadFeeAmount: number;
  isOnDuty: boolean;
  latitude: number | null;
  longitude: number | null;
  /** On-duty but hasn't reported a position in over STALE_POSITION_AFTER_SECONDS — feeds the tracking map's red-dot "disconnected" indicator. Computed here (server-side) rather than from a raw timestamp so no client component needs to call Date.now() during render. */
  isStale: boolean;
}

/** Admin sees every technician across every vendor, for the platform-wide live map. */
export async function getAllTechniciansForAdminAction(): Promise<ActionResponse<AdminTechnician[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.technicianProfile.findMany({
      include: {
        user: { select: { name: true, phone: true } },
        vendor: { select: { companyName: true } },
        location: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.user.name ?? "",
        phone: r.user.phone ?? "",
        skillCategory: r.skillCategory,
        vendorName: r.vendor?.companyName ?? "Freelance",
        leadFeeType: r.leadFeeType,
        leadFeeAmount: r.leadFeeAmount,
        isOnDuty: r.location?.isOnDuty ?? false,
        latitude: r.location?.latitude ?? null,
        longitude: r.location?.longitude ?? null,
        isStale: !!r.location?.isOnDuty && (Date.now() - r.location.updatedAt.getTime()) / 1000 > STALE_POSITION_AFTER_SECONDS,
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
    const existing = await prisma.technicianLocation.findUnique({
      where: { technicianId },
      select: { isOnDuty: true },
    });
    const isNewDutyOn = !existing || !existing.isOnDuty;

    await prisma.technicianLocation.upsert({
      where: { technicianId },
      create: { technicianId, latitude, longitude, isOnDuty: true },
      update: { latitude, longitude, isOnDuty: true },
    });

    // History logging is throttled independently of this write's own cadence
    // (5-12s while on duty) — a fresh clock-in is always logged (infrequent,
    // and it's the anchor the timeline reconstructs a day from), an ordinary
    // ping only every ~90s or ~150m of travel, so an 8-hour shift produces
    // roughly 300 rows rather than thousands. See TechnicianLocationEvent's
    // doc comment in the schema for the full reasoning.
    if (isNewDutyOn) {
      await prisma.technicianLocationEvent.create({
        data: { technicianId, eventType: "DUTY_ON", latitude, longitude },
      });
    } else {
      const lastPing = await prisma.technicianLocationEvent.findFirst({
        where: { technicianId, eventType: "PING" },
        orderBy: { createdAt: "desc" },
        select: { latitude: true, longitude: true, createdAt: true },
      });
      const secondsSincePing = lastPing ? (Date.now() - lastPing.createdAt.getTime()) / 1000 : Infinity;
      const movedKm = lastPing ? haversineKm(lastPing.latitude, lastPing.longitude, latitude, longitude) : Infinity;
      if (secondsSincePing >= 90 || movedKm >= 0.15) {
        await prisma.technicianLocationEvent.create({
          data: { technicianId, eventType: "PING", latitude, longitude },
        });
      }
    }

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
    const existing = await prisma.technicianLocation.findUnique({
      where: { technicianId },
      select: { latitude: true, longitude: true, isOnDuty: true },
    });

    // updateMany (not update) so toggling off before any location was ever
    // recorded is a harmless no-op instead of a "row not found" error.
    await prisma.technicianLocation.updateMany({ where: { technicianId }, data: { isOnDuty } });

    // Only log a real on->off transition, at wherever they last reported
    // from — this is the timeline's "clock-out" anchor for the day.
    if (existing?.isOnDuty && !isOnDuty) {
      await prisma.technicianLocationEvent.create({
        data: { technicianId, eventType: "DUTY_OFF", latitude: existing.latitude, longitude: existing.longitude },
      });
    }

    return { success: true };
  } catch (err) {
    console.error("Set technician duty status error:", err);
    return { success: false, error: "Failed to update duty status" };
  }
}

export interface TechnicianLastKnownLocation {
  latitude: number;
  longitude: number;
  isOnDuty: boolean;
  updatedAt: string;
}

/**
 * The technician's own last durable position. The job screen prefers a live
 * GPS fix, but that can be denied, time out, or simply be unavailable
 * indoors — falling back to this is what stops the panel from claiming
 * "distance unavailable" when we genuinely do know roughly where they are.
 */
export async function getMyLastKnownLocationAction(): Promise<ActionResponse<TechnicianLastKnownLocation | null>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  try {
    const location = await prisma.technicianLocation.findUnique({
      where: { technicianId },
      select: { latitude: true, longitude: true, isOnDuty: true, updatedAt: true },
    });
    if (!location) return { success: true, data: null };
    return {
      success: true,
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
        isOnDuty: location.isOnDuty,
        updatedAt: location.updatedAt.toISOString(),
      },
    };
  } catch (err) {
    console.error("Get my last known location error:", err);
    return { success: false, error: "Failed to load your location" };
  }
}

/**
 * Duty state plus whether this technician is mid-journey to a job.
 *
 * `hasJobEnRoute` rides along on a poll that already runs every 15s rather
 * than getting a poll of its own, and it's what lets the device report its
 * position faster while someone is actually watching the dot move — without
 * paying that battery cost for a technician who is merely on duty.
 */
export async function getMyDutyStatusAction(): Promise<
  ActionResponse<{ isOnDuty: boolean; hasJobEnRoute: boolean }>
> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  try {
    const [location, enRouteCount] = await Promise.all([
      prisma.technicianLocation.findUnique({ where: { technicianId }, select: { isOnDuty: true } }),
      prisma.serviceCall.count({ where: { technicianId, status: "EN_ROUTE" } }),
    ]);
    return {
      success: true,
      data: { isOnDuty: location?.isOnDuty ?? false, hasJobEnRoute: enRouteCount > 0 },
    };
  } catch (err) {
    console.error("Get my duty status error:", err);
    return { success: false, error: "Failed to load duty status" };
  }
}

export interface TechnicianStats {
  jobsCompleted: number;
  jobsActive: number;
  /** Gross value of completed jobs — what the customer paid, not take-home. */
  lifetimeValue: number;
  ratingAvg: number | null;
  ratingCount: number;
}

/**
 * The technician's own running totals, for their history screen. Reads the
 * denormalized rating aggregates off TechnicianProfile rather than averaging
 * reviews here — they're kept in step by submitReviewAction's transaction.
 */
export async function getMyTechnicianStatsAction(): Promise<ActionResponse<TechnicianStats>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  try {
    const [profile, jobsCompleted, jobsActive, completed] = await Promise.all([
      prisma.technicianProfile.findUnique({
        where: { id: technicianId },
        select: { ratingAvg: true, ratingCount: true },
      }),
      prisma.serviceCall.count({ where: { technicianId, status: "COMPLETED" } }),
      prisma.serviceCall.count({
        where: { technicianId, OR: [{ status: "ASSIGNED" }, { status: "EN_ROUTE" }, { status: "IN_PROGRESS" }] },
      }),
      prisma.serviceCall.findMany({
        where: { technicianId, status: "COMPLETED" },
        select: { liveCall: { select: { total: true } } },
      }),
    ]);

    return {
      success: true,
      data: {
        jobsCompleted,
        jobsActive,
        lifetimeValue: completed.reduce((sum, c) => sum + c.liveCall.total, 0),
        ratingAvg: profile?.ratingAvg ?? null,
        ratingCount: profile?.ratingCount ?? 0,
      },
    };
  } catch (err) {
    console.error("Get technician stats error:", err);
    return { success: false, error: "Failed to load your stats" };
  }
}

async function requireTimelineAccess(
  technicianId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, error: "Not signed in" };

  if (session.user.role === "SUPER_ADMIN") return { ok: true };

  if (session.user.role === "VENDOR") {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!vendor) return { ok: false, error: "Vendor profile not found" };
    const owns = await prisma.technicianProfile.findFirst({
      where: { id: technicianId, vendorId: vendor.id },
      select: { id: true },
    });
    if (!owns) return { ok: false, error: "That technician isn't on your team" };
    return { ok: true };
  }

  return { ok: false, error: "Not authorized" };
}

export interface TechnicianTimelineEvent {
  id: string;
  eventType: "PING" | "DUTY_ON" | "DUTY_OFF";
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface TechnicianTimelineJob {
  id: string;
  itemSummary: string;
  status: string;
  customerName: string;
  city: string;
  total: number;
  assignedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface TechnicianTimeline {
  technicianName: string;
  events: TechnicianTimelineEvent[];
  jobs: TechnicianTimelineJob[];
}

/**
 * One day's reconstructed activity for a technician — every logged
 * location/duty event plus every job they touched that day, for the "Google
 * Maps timeline" view. `date` is a "YYYY-MM-DD" string in the server's local
 * interpretation; omitted defaults to today.
 */
export async function getTechnicianTimelineAction(
  technicianId: string,
  date?: string
): Promise<ActionResponse<TechnicianTimeline>> {
  const auth = await requireTimelineAccess(technicianId);
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const day = date ? new Date(`${date}T00:00:00`) : new Date(new Date().toDateString());
    if (Number.isNaN(day.getTime())) return { success: false, error: "Invalid date" };
    const dayStart = new Date(day);
    const dayEnd = new Date(day.getTime() + 24 * 60 * 60 * 1000);

    const [technician, events, jobs] = await Promise.all([
      prisma.technicianProfile.findUnique({ where: { id: technicianId }, select: { user: { select: { name: true } } } }),
      prisma.technicianLocationEvent.findMany({
        where: { technicianId, createdAt: { gte: dayStart, lt: dayEnd } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.serviceCall.findMany({
        where: {
          technicianId,
          OR: [
            { assignedAt: { gte: dayStart, lt: dayEnd } },
            { startedAt: { gte: dayStart, lt: dayEnd } },
            { completedAt: { gte: dayStart, lt: dayEnd } },
          ],
        },
        include: { liveCall: { select: { items: true, city: true, total: true, customerName: true } } },
        orderBy: { assignedAt: "asc" },
      }),
    ]);

    if (!technician) return { success: false, error: "Technician not found" };

    return {
      success: true,
      data: {
        technicianName: technician.user.name ?? "",
        events: events.map((e) => ({
          id: e.id,
          eventType: e.eventType,
          latitude: e.latitude,
          longitude: e.longitude,
          createdAt: e.createdAt.toISOString(),
        })),
        jobs: jobs.map((j) => ({
          id: j.id,
          itemSummary: j.liveCall.items.map((i) => i.packageName).join(", "),
          status: j.status,
          customerName: j.liveCall.customerName,
          city: j.liveCall.city,
          total: j.liveCall.total,
          assignedAt: j.assignedAt?.toISOString() ?? null,
          startedAt: j.startedAt?.toISOString() ?? null,
          completedAt: j.completedAt?.toISOString() ?? null,
        })),
      },
    };
  } catch (err) {
    console.error("Get technician timeline error:", err);
    return { success: false, error: "Failed to load timeline" };
  }
}

export async function updateAdminFreelanceTechnicianLeadFeeAction(
  technicianId: string,
  leadFeeType: "FIXED" | "PERCENTAGE",
  leadFeeAmount: number
): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    if (leadFeeAmount < 0) return { success: false, error: "Amount cannot be negative" };
    if (leadFeeType === "PERCENTAGE" && leadFeeAmount > 100) {
      return { success: false, error: "Percentage cannot be greater than 100" };
    }

    await prisma.technicianProfile.update({
      where: { id: technicianId },
      data: { leadFeeType, leadFeeAmount },
    });

    revalidatePath(`/admin/freelance-technicians/${technicianId}`);
    return { success: true };
  } catch (err) {
    console.error("Update technician lead fee error:", err);
    return { success: false, error: "Failed to update lead fee" };
  }
}

export async function adminUpdateTechnicianStatusAction(
  technicianId: string,
  isOnDuty: boolean
): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };
  try {
    const loc = await prisma.technicianLocation.findUnique({ where: { technicianId } });
    if (!loc) {
      await prisma.technicianLocation.create({
        data: { technicianId, isOnDuty, latitude: 0, longitude: 0 },
      });
    } else {
      await prisma.technicianLocation.update({
        where: { technicianId },
        data: { isOnDuty, updatedAt: new Date() },
      });
    }
    revalidatePath(`/admin/freelance-technicians/${technicianId}`);
    return { success: true };
  } catch (err) {
    console.error("Admin update technician status error:", err);
    return { success: false, error: "Failed to update status" };
  }
}

export async function adminResetTechnicianPasswordAction(
  technicianId: string,
  newPasswordPlain: string
): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };
  
  if (!newPasswordPlain || newPasswordPlain.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  try {
    const technician = await prisma.technicianProfile.findUnique({ where: { id: technicianId } });
    if (!technician) return { success: false, error: "Technician not found" };

    const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);
    await prisma.user.update({
      where: { id: technician.userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (err) {
    console.error("Admin reset technician password error:", err);
    return { success: false, error: "Failed to reset password" };
  }
}

export async function getMyTechnicianTypeAction(): Promise<ActionResponse<{ type: string }>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error! };

  try {
    const profile = await prisma.technicianProfile.findUnique({
      where: { id: technicianId },
      select: { type: true },
    });
    if (!profile) return { success: false, error: "Profile not found" };

    return { success: true, data: { type: profile.type } };
  } catch (err) {
    console.error("Get my technician type error:", err);
    return { success: false, error: "Failed to fetch technician type" };
  }
}
