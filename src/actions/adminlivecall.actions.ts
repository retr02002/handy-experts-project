"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import {
  adminCreateLiveCallSchema,
  adminBulkConfirmSchema,
  type AdminCreateLiveCallInput,
} from "@/lib/validations/adminlivecall.schema";
import { resolveCoordinates, ensureServicePins } from "@/actions/livecall.actions";
import { findEligibleTechnicians } from "@/actions/servicecall.actions";
import { computeOrderTotal } from "@/lib/pricing";
import { generatePinPair } from "@/lib/pins";
import { notifyAllAdmins, notifyUser } from "@/actions/notification.actions";
import { parseUploadedWorkbook } from "@/lib/adminLiveCallExcel";

/** Same admin-only gate as requireAdmin(), but also hands back the admin's
 *  own profile name — whatever they've set it to, the same field shown
 *  everywhere else in the app as "who this is." */
async function requireAdminWithName(): Promise<{ adminName: string } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return { error: "Not authorized" };
  }
  return { adminName: session.user.name?.trim() || "An admin" };
}

/**
 * Resolves a customer by phone — reuses an existing CUSTOMER account if one
 * is already registered under that number, or auto-provisions a minimal one
 * (no password, matches the OTP-only login convention every customer
 * account already uses). LiveCall snapshots its own customerName/Email/Phone
 * independently of the User record, so whatever the admin typed for this
 * order is what displays — this lookup only needs to land on *a* real user
 * row to satisfy the required customerId foreign key.
 */
async function resolveCustomerId(phone: string, name: string): Promise<{ customerId: string } | { error: string }> {
  const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true, role: true } });
  if (existing) {
    if (existing.role !== "CUSTOMER") {
      return { error: `${phone} is already registered as a ${existing.role.toLowerCase()} account` };
    }
    return { customerId: existing.id };
  }

  const created = await prisma.user.create({ data: { phone, name, role: "CUSTOMER" } });
  return { customerId: created.id };
}

interface CoreResult {
  liveCallId: string;
  serviceCallId: string | null;
}

/**
 * The shared core behind both the single-order form and the bulk upload.
 * Broadcasts normally (status BROADCASTING, matching every self-checkout
 * order) unless assignVendorId is set, in which case it's created directly
 * CONVERTED and owned by that vendor — free of charge, since this is an
 * admin override of the marketplace, not a vendor buying a lead — and the
 * rest proceeds exactly like buyLiveCallAction's tail end (ServiceCall +
 * eligible-technician offers + notifications).
 */
async function createOneAdminLiveCall(
  data: AdminCreateLiveCallInput,
  adminName: string
): Promise<{ ok: true; data: CoreResult } | { ok: false; error: string }> {
  const coords = await resolveCoordinates({
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    latitude: null,
    longitude: null,
  });
  if (!coords) {
    return { ok: false, error: `Couldn't pin the address: ${data.address}, ${data.city}` };
  }

  const customerResult = await resolveCustomerId(data.customerPhone, data.customerName);
  if ("error" in customerResult) return { ok: false, error: customerResult.error };
  const { customerId } = customerResult;

  const packages = await prisma.servicePackage.findMany({
    where: { id: { in: data.items.map((i) => i.packageId) } },
    select: { id: true, name: true, price: true },
  });
  const packageMap = new Map(packages.map((p) => [p.id, p]));
  const missing = data.items.find((i) => !packageMap.has(i.packageId));
  if (missing) return { ok: false, error: `Package not found: ${missing.packageId}` };

  const rawSubtotal = data.items.reduce((sum, item) => sum + packageMap.get(item.packageId)!.price * item.quantity, 0);
  const { subtotal, tax, total } = computeOrderTotal(rawSubtotal);

  await ensureServicePins(customerId);

  let assignedVendor: { id: string; userId: string; companyName: string; isActive: boolean } | null = null;
  if (data.assignVendorId) {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: data.assignVendorId },
      select: { id: true, userId: true, companyName: true, isActive: true },
    });
    if (!vendor) return { ok: false, error: "Selected vendor not found" };
    if (!vendor.isActive) return { ok: false, error: `${vendor.companyName} is deactivated and can't be assigned new jobs` };
    assignedVendor = vendor;
  }

  const baseData = {
    customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    latitude: coords.latitude,
    longitude: coords.longitude,
    scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
    paymentMode: "ADMIN",
    createdByAdminName: adminName,
    startPin: data.startPin,
    completionPin: data.completionPin,
    paymentStatus: "COD" as const,
    subtotal,
    tax,
    total,
    items: {
      create: data.items.map((item) => ({
        packageId: item.packageId,
        packageName: packageMap.get(item.packageId)!.name,
        unitPrice: packageMap.get(item.packageId)!.price,
        quantity: item.quantity,
      })),
    },
  };

  if (!assignedVendor) {
    const liveCall = await prisma.liveCall.create({ data: { ...baseData, status: "BROADCASTING" } });
    notifyAllAdmins("NEW_LIVE_CALL", "New live call", `${adminName} created an order in ${data.city} — ₹${total}.`, liveCall.id);
    return { ok: true, data: { liveCallId: liveCall.id, serviceCallId: null } };
  }

  const liveCall = await prisma.liveCall.create({
    data: { ...baseData, status: "CONVERTED", acceptedByVendorId: assignedVendor.id, acceptedAt: new Date() },
  });
  const serviceCall = await prisma.serviceCall.create({
    data: { liveCallId: liveCall.id, vendorId: assignedVendor.id, customerId, status: "UNASSIGNED" },
  });

  const eligible = await findEligibleTechnicians(assignedVendor.id, liveCall.id);
  if (eligible.length > 0) {
    await prisma.serviceCallOffer.createMany({
      data: eligible.map((t) => ({ liveCallId: liveCall.id, vendorId: assignedVendor.id, technicianId: t.id })),
      skipDuplicates: true,
    });
    await prisma.notification.createMany({
      data: eligible.map((t) => ({
        userId: t.userId,
        type: "JOB_OFFER" as const,
        title: "New job offer",
        message: `A job is available at ${data.address}, ${data.city} — ₹${total}.`,
        liveCallId: liveCall.id,
        serviceCallId: serviceCall.id,
      })),
    });
  }

  notifyUser(
    assignedVendor.userId,
    "CALL_ASSIGNED",
    "New job assigned to you",
    `${adminName} assigned you a job at ${data.address}, ${data.city} — ₹${total}.`,
    liveCall.id,
    serviceCall.id
  );

  return { ok: true, data: { liveCallId: liveCall.id, serviceCallId: serviceCall.id } };
}

export async function adminCreateLiveCallAction(input: unknown): Promise<ActionResponse<CoreResult>> {
  const adminAuth = await requireAdminWithName();
  if ("error" in adminAuth) return { success: false, error: adminAuth.error };

  const validated = adminCreateLiveCallSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const result = await createOneAdminLiveCall(validated.data, adminAuth.adminName);
    if (!result.ok) return { success: false, error: result.error };
    revalidatePath("/admin/live-calls");
    return { success: true, data: result.data };
  } catch (err) {
    console.error("Admin create live call error:", err);
    return { success: false, error: "Failed to create this order" };
  }
}

export interface BulkUploadResult {
  createdCount: number;
  failures: { rowNumber: number; error: string }[];
}

const MAX_BULK_ROWS = 500;

export interface BulkPreviewRow {
  rowNumber: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  packageId: string | null;
  packageName: string;
  quantity: number;
  scheduledFor: string | null;
  assignVendorId: string | null;
  vendorName: string | null;
  estimatedSubtotal: number | null;
  startPin: string;
  completionPin: string;
  valid: boolean;
  error: string | null;
}

/**
 * Resolves one parsed spreadsheet row against real packages/vendors and
 * generates its PIN pair — shared by both the preview step (so the admin
 * sees exactly what would be created) and, indirectly, by the confirm step
 * re-validating whatever the admin reviewed/edited in the browser.
 */
function resolveBulkPreviewRow(
  row: { rowNumber: number; values: Record<string, string> },
  packageByName: Map<string, { id: string; name: string; price: number }>,
  vendorByEmail: Map<string, { id: string; isActive: boolean; companyName: string }>
): BulkPreviewRow {
  const v = row.values;
  const base = {
    rowNumber: row.rowNumber,
    customerName: v.customerName ?? "",
    customerPhone: v.customerPhone ?? "",
    customerEmail: v.customerEmail ?? "",
    address: v.address ?? "",
    city: v.city ?? "",
    state: v.state ?? "",
    pincode: v.pincode ?? "",
    quantity: (() => {
      const n = Number(v.quantity);
      return Number.isFinite(n) && n > 0 ? n : 1;
    })(),
  };

  const pkg = v.packageName ? packageByName.get(v.packageName.trim().toLowerCase()) : undefined;
  if (v.packageName && !pkg) {
    return {
      ...base,
      packageId: null,
      packageName: v.packageName,
      scheduledFor: null,
      assignVendorId: null,
      vendorName: null,
      estimatedSubtotal: null,
      startPin: "",
      completionPin: "",
      valid: false,
      error: `Package not found: "${v.packageName}"`,
    };
  }

  let vendorId: string | null = null;
  let vendorName: string | null = null;
  if (v.vendorEmail) {
    const vendor = vendorByEmail.get(v.vendorEmail.trim().toLowerCase());
    if (!vendor) {
      return {
        ...base,
        packageId: pkg?.id ?? null,
        packageName: pkg?.name ?? v.packageName ?? "",
        scheduledFor: null,
        assignVendorId: null,
        vendorName: null,
        estimatedSubtotal: null,
        startPin: "",
        completionPin: "",
        valid: false,
        error: `Vendor email not found: "${v.vendorEmail}"`,
      };
    }
    vendorId = vendor.id;
    vendorName = vendor.companyName;
  }

  let scheduledForIso: string | null = null;
  if (v.scheduledFor) {
    const parsedDate = new Date(v.scheduledFor);
    if (Number.isNaN(parsedDate.getTime())) {
      return {
        ...base,
        packageId: pkg?.id ?? null,
        packageName: pkg?.name ?? v.packageName ?? "",
        scheduledFor: null,
        assignVendorId: vendorId,
        vendorName,
        estimatedSubtotal: null,
        startPin: "",
        completionPin: "",
        valid: false,
        error: `Invalid "Scheduled For" date: "${v.scheduledFor}"`,
      };
    }
    scheduledForIso = parsedDate.toISOString();
  }

  const { startPin, completionPin } = generatePinPair();
  const parsedInput = adminCreateLiveCallSchema.safeParse({
    customerName: base.customerName,
    customerPhone: base.customerPhone,
    customerEmail: base.customerEmail,
    address: base.address,
    city: base.city,
    state: base.state,
    pincode: base.pincode,
    items: pkg ? [{ packageId: pkg.id, quantity: base.quantity }] : [],
    scheduledFor: scheduledForIso,
    assignVendorId: vendorId,
    startPin,
    completionPin,
  });

  return {
    ...base,
    packageId: pkg?.id ?? null,
    packageName: pkg?.name ?? v.packageName ?? "",
    scheduledFor: scheduledForIso,
    assignVendorId: vendorId,
    vendorName,
    estimatedSubtotal: pkg ? pkg.price * base.quantity : null,
    startPin,
    completionPin,
    valid: parsedInput.success,
    error: parsedInput.success ? null : (parsedInput.error.issues[0]?.message ?? "Invalid row"),
  };
}

export async function adminBulkPreviewLiveCallsAction(formData: FormData): Promise<ActionResponse<{ rows: BulkPreviewRow[] }>> {
  const adminAuth = await requireAdminWithName();
  if ("error" in adminAuth) return { success: false, error: adminAuth.error };

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { success: false, error: "No file provided" };
  }
  if (!/\.(xlsx|csv)$/i.test(file.name)) {
    return { success: false, error: "Only .xlsx or .csv files are supported" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = await parseUploadedWorkbook(buffer, file.name);
    if (rows.length === 0) {
      return { success: false, error: "The file has no data rows" };
    }
    if (rows.length > MAX_BULK_ROWS) {
      return { success: false, error: `Too many rows — up to ${MAX_BULK_ROWS} orders per upload` };
    }

    const [packages, vendors] = await Promise.all([
      prisma.servicePackage.findMany({ select: { id: true, name: true, price: true } }),
      prisma.vendorProfile.findMany({ select: { id: true, isActive: true, companyName: true, user: { select: { email: true } } } }),
    ]);
    const packageByName = new Map(packages.map((p) => [p.name.trim().toLowerCase(), p]));
    const vendorByEmail = new Map(vendors.filter((v) => v.user.email).map((v) => [v.user.email!.toLowerCase(), v]));

    const preview = rows.map((row) => resolveBulkPreviewRow(row, packageByName, vendorByEmail));
    return { success: true, data: { rows: preview } };
  } catch (err) {
    console.error("Admin bulk preview live calls error:", err);
    return { success: false, error: "Failed to process the uploaded file" };
  }
}

export async function adminBulkConfirmCreateLiveCallsAction(input: unknown): Promise<ActionResponse<BulkUploadResult>> {
  const adminAuth = await requireAdminWithName();
  if ("error" in adminAuth) return { success: false, error: adminAuth.error };

  const validated = adminBulkConfirmSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid review data — try uploading again" };
  }

  try {
    const failures: BulkUploadResult["failures"] = [];
    let createdCount = 0;

    for (const row of validated.data) {
      const result = await createOneAdminLiveCall(
        {
          customerName: row.customerName,
          customerPhone: row.customerPhone,
          customerEmail: row.customerEmail,
          address: row.address,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          items: [{ packageId: row.packageId, quantity: row.quantity }],
          scheduledFor: row.scheduledFor,
          assignVendorId: row.assignVendorId,
          startPin: row.startPin,
          completionPin: row.completionPin,
        },
        adminAuth.adminName
      );
      if (!result.ok) {
        failures.push({ rowNumber: row.rowNumber, error: result.error });
        continue;
      }
      createdCount++;
    }

    if (createdCount > 0) revalidatePath("/admin/live-calls");
    return { success: true, data: { createdCount, failures } };
  } catch (err) {
    console.error("Admin bulk confirm create live calls error:", err);
    return { success: false, error: "Failed to create these orders" };
  }
}

export interface AdminOrderPackageOption {
  id: string;
  name: string;
  price: number;
  serviceTitle: string;
}

export async function getPackagesForAdminOrderAction(): Promise<ActionResponse<AdminOrderPackageOption[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.servicePackage.findMany({
      select: { id: true, name: true, price: true, service: { select: { title: true } } },
      orderBy: { name: "asc" },
    });
    return { success: true, data: rows.map((r) => ({ id: r.id, name: r.name, price: r.price, serviceTitle: r.service.title })) };
  } catch (err) {
    console.error("Get packages for admin order error:", err);
    return { success: false, error: "Failed to load packages" };
  }
}

export interface AdminOrderVendorOption {
  id: string;
  companyName: string;
  isActive: boolean;
}

export async function getVendorsForAssignmentAction(): Promise<ActionResponse<AdminOrderVendorOption[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.vendorProfile.findMany({
      select: { id: true, companyName: true, isActive: true },
      orderBy: { companyName: "asc" },
    });
    return { success: true, data: rows };
  } catch (err) {
    console.error("Get vendors for assignment error:", err);
    return { success: false, error: "Failed to load vendors" };
  }
}

export interface CustomerSearchResult {
  id: string;
  name: string;
  phone: string;
  email: string;
  /** Last-order context so an admin can tell two same-named customers apart. */
  lastOrderAt: string | null;
  lastOrderCity: string | null;
}

/**
 * Powers the Create Live Call modal's existing-customer autocomplete — a
 * pure client-side convenience layer. resolveCustomerId's phone-based
 * find-or-create stays the real source of truth at submit time regardless
 * of what got selected here.
 */
export async function searchExistingCustomersAction(query: string): Promise<ActionResponse<CustomerSearchResult[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const trimmed = query.trim();
  if (trimmed.length < 2) return { success: true, data: [] };

  try {
    const isDigits = /^\d+$/.test(trimmed);
    const customers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(isDigits ? { phone: { startsWith: trimmed } } : { name: { contains: trimmed, mode: "insensitive" } }),
      },
      select: { id: true, name: true, phone: true, email: true },
      take: 8,
    });
    if (customers.length === 0) return { success: true, data: [] };

    // One batched query for every match's most recent order, rather than
    // one query per row — this list is typed live, an N+1 here would fire
    // on every keystroke.
    const lastOrders = await prisma.liveCall.findMany({
      where: { customerId: { in: customers.map((c) => c.id) } },
      orderBy: { createdAt: "desc" },
      select: { customerId: true, city: true, createdAt: true },
    });
    const lastOrderByCustomer = new Map<string, { city: string; createdAt: Date }>();
    for (const o of lastOrders) {
      if (!lastOrderByCustomer.has(o.customerId)) lastOrderByCustomer.set(o.customerId, { city: o.city, createdAt: o.createdAt });
    }

    return {
      success: true,
      data: customers.map((c) => {
        const last = lastOrderByCustomer.get(c.id);
        return {
          id: c.id,
          name: c.name ?? "",
          phone: c.phone ?? "",
          email: c.email ?? "",
          lastOrderAt: last?.createdAt.toISOString() ?? null,
          lastOrderCity: last?.city ?? null,
        };
      }),
    };
  } catch (err) {
    console.error("Search existing customers error:", err);
    return { success: false, error: "Failed to search customers" };
  }
}
