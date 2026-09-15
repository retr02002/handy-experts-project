"use server";

import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import {
  createVendorSchema,
  updateVendorSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
} from "@/lib/validations/adminvendor.schema";
import { getAllServiceCallsAction, type AdminServiceCallSummary } from "@/actions/servicecall.actions";
import { sendTextMessage } from "@/lib/apitxt";
import { forwardGeocodePincode } from "@/lib/geocode";

export interface CreatedVendorCredentials {
  email: string;
  tempPassword: string;
  smsDelivered: boolean;
}

/** Admin-initiated vendor creation — same one-time-shown temp-password UX as createTechnicianAction. */
export async function createVendorAction(input: CreateVendorInput): Promise<ActionResponse<CreatedVendorCredentials>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const validated = createVendorSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const {
    name,
    email,
    phone,
    companyName,
    companyType,
    gstNumber,
    panNumber,
    aadhaarNumber,
    address,
    city,
    state,
    pincode,
    latitude,
    longitude,
    incorporationDate,
  } = validated.data;

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

    const tempPassword = crypto.randomBytes(9).toString("base64url");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const vendorId = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, name, phone, password: hashedPassword, role: "VENDOR" },
      });
      const vendor = await tx.vendorProfile.create({
        data: {
          userId: user.id,
          companyName,
          companyType,
          gstNumber,
          panNumber,
          aadhaarNumber,
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          incorporationDate: new Date(incorporationDate),
        },
      });
      return vendor.id;
    });

    // Best-effort so a brand-new vendor isn't stuck at zero live-call
    // coverage from day one — service areas are admin-managed now, so this
    // auto-seed is the only area a vendor gets until an admin (via
    // /admin/vendors/[id]/coverage) or a resolved support ticket adds more.
    // 15km mirrors the old flat-radius default; a failed geocode is non-fatal.
    const coords = await forwardGeocodePincode(pincode);
    if (coords) {
      await prisma.vendorServiceArea.create({
        data: { vendorId, pincode, latitude: coords.latitude, longitude: coords.longitude, radiusKm: 15 },
      });
    } else {
      console.error(`Could not auto-seed a service area for new vendor ${vendorId} (pincode ${pincode})`);
    }

    const sendResult = await sendTextMessage({
      phone,
      channel: "SMS",
      message: `Your Handyzo vendor login — Email: ${email}  Temp password: ${tempPassword}. Please log in and change your password.`,
    });

    revalidatePath("/admin/vendors");
    return { success: true, data: { email, tempPassword, smsDelivered: sendResult.ok } };
  } catch (err) {
    console.error("Create vendor error:", err);
    return { success: false, error: "Failed to create vendor" };
  }
}

export interface AdminVendor {
  id: string;
  companyName: string;
  companyType: string;
  contactName: string;
  email: string;
  phone: string;
  gstNumber: string | null;
  panNumber: string | null;
  aadhaarNumber: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  technicianCount: number;
  serviceCallCount: number;
  incorporationDate: string;
  createdAt: string;
  leadPricingType: string;
  leadPricingValue: number;
  walletBalance: number;
}

export async function getAllVendorsForAdminAction(): Promise<ActionResponse<AdminVendor[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.vendorProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { technicians: true, serviceCalls: true } },
        wallet: { select: { balance: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        companyName: r.companyName,
        companyType: r.companyType,
        contactName: r.user.name ?? "",
        email: r.user.email ?? "",
        phone: r.user.phone ?? "",
        gstNumber: r.gstNumber,
        panNumber: r.panNumber,
        aadhaarNumber: r.aadhaarNumber,
        address: r.address,
        city: r.city,
        state: r.state,
        pincode: r.pincode,
        latitude: r.latitude,
        longitude: r.longitude,
        isActive: r.isActive,
        technicianCount: r._count.technicians,
        serviceCallCount: r._count.serviceCalls,
        incorporationDate: r.incorporationDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
        leadPricingType: r.leadPricingType,
        leadPricingValue: r.leadPricingValue,
        walletBalance: r.wallet?.balance ?? 0,
      })),
    };
  } catch (err) {
    console.error("Get all vendors for admin error:", err);
    return { success: false, error: "Failed to load vendors" };
  }
}

/** Single-vendor variant of getAllVendorsForAdminAction, for the vendor detail page — same mapping, scoped to one row instead of fetching every vendor to find one. */
export async function getAdminVendorByIdAction(vendorId: string): Promise<ActionResponse<AdminVendor>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const r = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { technicians: true, serviceCalls: true } },
        wallet: { select: { balance: true } },
      },
    });
    if (!r) return { success: false, error: "Vendor not found" };

    return {
      success: true,
      data: {
        id: r.id,
        companyName: r.companyName,
        companyType: r.companyType,
        contactName: r.user.name ?? "",
        email: r.user.email ?? "",
        phone: r.user.phone ?? "",
        gstNumber: r.gstNumber,
        panNumber: r.panNumber,
        aadhaarNumber: r.aadhaarNumber,
        address: r.address,
        city: r.city,
        state: r.state,
        pincode: r.pincode,
        latitude: r.latitude,
        longitude: r.longitude,
        isActive: r.isActive,
        technicianCount: r._count.technicians,
        serviceCallCount: r._count.serviceCalls,
        incorporationDate: r.incorporationDate.toISOString(),
        createdAt: r.createdAt.toISOString(),
        leadPricingType: r.leadPricingType,
        leadPricingValue: r.leadPricingValue,
        walletBalance: r.wallet?.balance ?? 0,
      },
    };
  } catch (err) {
    console.error("Get admin vendor by id error:", err);
    return { success: false, error: "Failed to load vendor" };
  }
}

export async function updateVendorAction(input: UpdateVendorInput): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const validated = updateVendorSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const { id, name, phone, companyName, companyType, gstNumber, panNumber, aadhaarNumber, address, city, state, pincode, incorporationDate } =
    validated.data;

  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!vendor) return { success: false, error: "Vendor not found" };

    await prisma.$transaction([
      prisma.user.update({ where: { id: vendor.userId }, data: { name, phone } }),
      prisma.vendorProfile.update({
        where: { id },
        data: {
          companyName,
          companyType,
          // undefined means "leave unchanged" to Prisma's update — an admin
          // clearing the field back to blank must explicitly set null.
          gstNumber: gstNumber ?? null,
          panNumber: panNumber ?? null,
          aadhaarNumber: aadhaarNumber ?? null,
          address,
          city,
          state,
          pincode,
          incorporationDate: new Date(incorporationDate),
        },
      }),
    ]);

    revalidatePath("/admin/vendors");
    return { success: true };
  } catch (err) {
    console.error("Update vendor error:", err);
    return { success: false, error: "Failed to update vendor" };
  }
}

/** Deactivation is the safe alternative to deletion — ServiceCall.vendor cascades on delete, which would wipe job history. */
export async function setVendorActiveStatusAction(id: string, isActive: boolean): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    await prisma.vendorProfile.update({ where: { id }, data: { isActive } });
    revalidatePath("/admin/vendors");
    return { success: true };
  } catch (err) {
    console.error("Set vendor active status error:", err);
    return { success: false, error: "Failed to update vendor status" };
  }
}

export interface AdminDashboardStats {
  totalLiveCalls: number;
  broadcastingLiveCalls: number;
  totalServiceCalls: number;
  activeServiceCalls: number;
  completedServiceCalls: number;
  totalVendors: number;
  activeVendors: number;
  totalTechnicians: number;
  recentServiceCalls: AdminServiceCallSummary[];
  topVendors: { companyName: string; serviceCallCount: number; technicianCount: number }[];
}

export async function getAdminDashboardStatsAction(): Promise<ActionResponse<AdminDashboardStats>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const [totalLiveCalls, broadcastingLiveCalls, totalServiceCalls, activeServiceCalls, completedServiceCalls, totalVendors, activeVendors, totalTechnicians] =
      await Promise.all([
        prisma.liveCall.count(),
        prisma.liveCall.count({ where: { status: "BROADCASTING" } }),
        prisma.serviceCall.count(),
        prisma.serviceCall.count({ where: { OR: [{ status: "ASSIGNED" }, { status: "EN_ROUTE" }, { status: "IN_PROGRESS" }] } }),
        prisma.serviceCall.count({ where: { status: "COMPLETED" } }),
        prisma.vendorProfile.count(),
        prisma.vendorProfile.count({ where: { isActive: true } }),
        prisma.technicianProfile.count(),
      ]);

    const [serviceCallsRes, vendorsRes] = await Promise.all([getAllServiceCallsAction(), getAllVendorsForAdminAction()]);
    const recentServiceCalls = (serviceCallsRes.success ? (serviceCallsRes.data ?? []) : []).slice(0, 5);
    const topVendors = (vendorsRes.success ? (vendorsRes.data ?? []) : [])
      .slice()
      .sort((a, b) => b.serviceCallCount - a.serviceCallCount)
      .slice(0, 5)
      .map((v) => ({ companyName: v.companyName, serviceCallCount: v.serviceCallCount, technicianCount: v.technicianCount }));

    return {
      success: true,
      data: {
        totalLiveCalls,
        broadcastingLiveCalls,
        totalServiceCalls,
        activeServiceCalls,
        completedServiceCalls,
        totalVendors,
        activeVendors,
        totalTechnicians,
        recentServiceCalls,
        topVendors,
      },
    };
  } catch (err) {
    console.error("Get admin dashboard stats error:", err);
    return { success: false, error: "Failed to load dashboard stats" };
  }
}

export interface AdminTechnician {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string | null;
  skillCategory: string;
  experienceYears: number;
  type: string;
  vendorName: string | null;
  isOnDuty: boolean;
  ratingAvg: number | null;
  ratingCount: number;
  jobsCompleted: number;
  jobsActive: number;
  createdAt: string;
}

const ACTIVE_JOB_STATUSES = ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"];

/**
 * Every technician on the platform with the numbers that say whether they're
 * working out. One grouped count rather than a query per technician — this
 * list grows with the whole platform, not one vendor's team.
 */
export async function getAllTechniciansForAdminAction(): Promise<ActionResponse<AdminTechnician[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const [rows, counts] = await Promise.all([
      prisma.technicianProfile.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true, username: true } },
          vendor: { select: { companyName: true } },
          location: { select: { isOnDuty: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceCall.groupBy({
        by: ["technicianId", "status"],
        where: { technicianId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const completedBy = new Map<string, number>();
    const activeBy = new Map<string, number>();
    for (const c of counts) {
      if (!c.technicianId) continue;
      const n = c._count._all;
      if (c.status === "COMPLETED") {
        completedBy.set(c.technicianId, (completedBy.get(c.technicianId) ?? 0) + n);
      } else if (ACTIVE_JOB_STATUSES.includes(c.status)) {
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
        skillCategory: r.skillCategory,
        experienceYears: r.experienceYears,
        type: r.type,
        vendorName: r.vendor?.companyName ?? null,
        isOnDuty: r.location?.isOnDuty ?? false,
        ratingAvg: r.ratingAvg,
        ratingCount: r.ratingCount,
        jobsCompleted: completedBy.get(r.id) ?? 0,
        jobsActive: activeBy.get(r.id) ?? 0,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Get all technicians error:", err);
    return { success: false, error: "Failed to load technicians" };
  }
}

export interface VendorPerformance {
  vendorId: string;
  companyName: string;
  isActive: boolean;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  technicianCount: number;
  jobsTotal: number;
  jobsCompleted: number;
  jobsActive: number;
  jobsCancelled: number;
  /** Gross value of that vendor's completed jobs. */
  revenue: number;
  completionRate: number;
  ratingAvg: number | null;
  ratingCount: number;
  technicians: AdminTechnician[];
  /** Daily completed-job revenue for the trend chart. */
  revenueTrend: { date: string; total: number }[];
  statusBreakdown: { status: string; count: number }[];
}

/**
 * One vendor's whole operation, for the admin performance console: volume,
 * revenue, how reliably they close jobs, what customers scored them, and the
 * team underneath them.
 */
export async function getVendorPerformanceAction(vendorId: string): Promise<ActionResponse<VendorPerformance>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      include: { user: { select: { name: true, phone: true, email: true } } },
    });
    if (!vendor) return { success: false, error: "Vendor not found" };

    const [calls, reviewAgg, allTechnicians] = await Promise.all([
      prisma.serviceCall.findMany({
        where: { vendorId },
        select: {
          status: true,
          completedAt: true,
          createdAt: true,
          liveCall: { select: { total: true } },
        },
      }),
      prisma.review.aggregate({
        where: { vendorId },
        _avg: { technicianRating: true },
        _count: true,
      }),
      getAllTechniciansForAdminAction(),
    ]);

    const technicians =
      allTechnicians.success && allTechnicians.data
        ? allTechnicians.data.filter((t) => t.vendorName === vendor.companyName)
        : [];

    const jobsCompleted = calls.filter((c) => c.status === "COMPLETED").length;
    const jobsActive = calls.filter((c) => ACTIVE_JOB_STATUSES.includes(c.status)).length;
    const jobsCancelled = calls.filter((c) => c.status === "CANCELLED").length;
    const revenue = calls
      .filter((c) => c.status === "COMPLETED")
      .reduce((sum, c) => sum + c.liveCall.total, 0);

    const byStatus = new Map<string, number>();
    for (const c of calls) byStatus.set(c.status, (byStatus.get(c.status) ?? 0) + 1);

    return {
      success: true,
      data: {
        vendorId: vendor.id,
        companyName: vendor.companyName,
        isActive: vendor.isActive,
        contactName: vendor.user.name,
        phone: vendor.user.phone,
        email: vendor.user.email,
        technicianCount: technicians.length,
        jobsTotal: calls.length,
        jobsCompleted,
        jobsActive,
        jobsCancelled,
        revenue,
        completionRate: calls.length > 0 ? Math.round((jobsCompleted / calls.length) * 100) : 0,
        ratingAvg: reviewAgg._avg.technicianRating,
        ratingCount: reviewAgg._count,
        technicians,
        revenueTrend: calls
          .filter((c) => c.status === "COMPLETED" && c.completedAt)
          .map((c) => ({ date: c.completedAt!.toISOString(), total: c.liveCall.total })),
        statusBreakdown: [...byStatus.entries()].map(([status, count]) => ({ status, count })),
      },
    };
  } catch (err) {
    console.error("Get vendor performance error:", err);
    return { success: false, error: "Failed to load vendor performance" };
  }
}

export interface VendorCategoryAssignment {
  categoryId: string;
  categoryName: string;
}

/** A vendor's currently-assigned categories, for the admin coverage page. */
export async function getVendorCategoriesAction(vendorId: string): Promise<ActionResponse<VendorCategoryAssignment[]>> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.vendorCategory.findMany({
      where: { vendorId },
      select: { categoryId: true, category: { select: { name: true } } },
      orderBy: { category: { name: "asc" } },
    });
    return { success: true, data: rows.map((r) => ({ categoryId: r.categoryId, categoryName: r.category.name })) };
  } catch (err) {
    console.error("Get vendor categories error:", err);
    return { success: false, error: "Failed to load categories" };
  }
}

/**
 * Replaces a vendor's entire category assignment with the given set — the
 * hard gate on getNearbyLiveCallsForVendorAction reads directly off this
 * table, so a vendor with none of their requested categories here sees no
 * live calls at all.
 */
export async function setVendorCategoriesAction(vendorId: string, categoryIds: string[]): Promise<ActionResponse> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId }, select: { id: true } });
    if (!vendor) return { success: false, error: "Vendor not found" };

    const ids = [...new Set(categoryIds)];
    await prisma.$transaction(async (tx) => {
      await tx.vendorCategory.deleteMany({ where: { vendorId } });
      if (ids.length > 0) {
        await tx.vendorCategory.createMany({ data: ids.map((categoryId) => ({ vendorId, categoryId })), skipDuplicates: true });
      }
    });

    revalidatePath("/vendor/live-calls");
    revalidatePath(`/admin/vendors/${vendorId}/coverage`);
    return { success: true };
  } catch (err) {
    console.error("Set vendor categories error:", err);
    return { success: false, error: "Failed to update categories" };
  }
}
