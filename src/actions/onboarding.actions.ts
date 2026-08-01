"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/actions/auth.actions";
import {
  customerOnboardingSchema,
  vendorOnboardingSchema,
  technicianOnboardingSchema,
  type CustomerOnboardingInput,
  type VendorOnboardingInput,
  type TechnicianOnboardingInput,
} from "@/lib/validations/onboarding.schema";

async function requireOnboardableUser(
  targetRole: "CUSTOMER" | "VENDOR" | "TECHNICIAN"
): Promise<{ userId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return { userId: null, error: "Not signed in" };

  // Allow a fresh PENDING signup to pick this role, or an existing holder of
  // this exact role to fill in details they're still missing. Switching
  // between roles once one is set isn't supported by this flow.
  const currentRole = session.user.role;
  if (currentRole !== "PENDING" && currentRole !== targetRole) {
    return { userId: null, error: "Your account type is already set." };
  }

  return { userId, error: null };
}

export async function completeCustomerOnboarding(input: CustomerOnboardingInput): Promise<ActionResponse> {
  const { userId, error } = await requireOnboardableUser("CUSTOMER");
  if (!userId) return { success: false, error: error! };

  const validated = customerOnboardingSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "CUSTOMER", name: validated.data.name, phone: validated.data.phone },
    });
    return { success: true };
  } catch (err) {
    console.error("Customer onboarding error:", err);
    return { success: false, error: "Failed to save your details" };
  }
}

export async function completeVendorOnboarding(input: VendorOnboardingInput): Promise<ActionResponse> {
  const { userId, error } = await requireOnboardableUser("VENDOR");
  if (!userId) return { success: false, error: error! };

  const validated = vendorOnboardingSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  const {
    name,
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
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: "VENDOR", name, phone },
      }),
      prisma.vendorProfile.upsert({
        where: { userId },
        create: {
          userId,
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
        update: {
          companyName,
          companyType,
          gstNumber,
          panNumber,
          aadhaarNumber,
          address,
          city,
          state,
          pincode,
          // Only overwrite coordinates if this submission actually provided
          // them — repeat calls into this upsert (e.g. a repair flow) with no
          // location captured shouldn't wipe a previously-set one.
          ...(latitude !== undefined && longitude !== undefined ? { latitude, longitude } : {}),
          incorporationDate: new Date(incorporationDate),
        },
      }),
    ]);
    return { success: true };
  } catch (err) {
    console.error("Vendor onboarding error:", err);
    return { success: false, error: "Failed to save your company details" };
  }
}

export async function completeTechnicianOnboarding(input: TechnicianOnboardingInput): Promise<ActionResponse> {
  const { userId, error } = await requireOnboardableUser("TECHNICIAN");
  if (!userId) return { success: false, error: error! };

  const validated = technicianOnboardingSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  const { name, phone, skillCategory, experienceYears, aadhaarNumber, servicePincode } = validated.data;

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: "TECHNICIAN", name, phone },
      }),
      prisma.technicianProfile.upsert({
        where: { userId },
        create: {
          userId,
          type: "FREELANCE",
          skillCategory,
          experienceYears,
          aadhaarNumber,
          servicePincode,
        },
        update: {
          skillCategory,
          experienceYears,
          aadhaarNumber,
          servicePincode,
        },
      }),
    ]);
    return { success: true };
  } catch (err) {
    console.error("Technician onboarding error:", err);
    return { success: false, error: "Failed to save your professional details" };
  }
}

export interface OnboardingStatus {
  role: "PENDING" | "CUSTOMER" | "VENDOR" | "TECHNICIAN" | "SUPER_ADMIN";
  name: string | null;
  phone: string | null;
  hasVendorProfile: boolean;
  hasTechnicianProfile: boolean;
}

/** Single source of truth for "does this signed-in user still need onboarding, and for which role". */
export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      name: true,
      phone: true,
      vendorProfile: { select: { id: true } },
      technicianProfile: { select: { id: true } },
    },
  });
  if (!user) return null;

  return {
    role: user.role,
    name: user.name,
    phone: user.phone,
    hasVendorProfile: !!user.vendorProfile,
    hasTechnicianProfile: !!user.technicianProfile,
  };
}
