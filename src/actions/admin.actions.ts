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
    // coverage until they visit /vendor/service-areas themselves. 15km
    // mirrors the old flat-radius default; failure to geocode is non-fatal
    // — the vendor can add an area manually later.
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
}

export async function getAllVendorsForAdminAction(): Promise<ActionResponse<AdminVendor[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.vendorProfile.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        _count: { select: { technicians: true, serviceCalls: true } },
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
      })),
    };
  } catch (err) {
    console.error("Get all vendors for admin error:", err);
    return { success: false, error: "Failed to load vendors" };
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
        prisma.serviceCall.count({ where: { status: { in: ["ASSIGNED", "EN_ROUTE", "IN_PROGRESS"] } } }),
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
