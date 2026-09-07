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
import { forwardGeocodePincode } from "@/lib/geocode";

/**
 * Phone is globally unique across every role (OTP login depends on this).
 * Any onboarding path that writes phone needs this check first — otherwise
 * a second account (most commonly: someone who signed up with Google, then
 * enters a phone already used by an existing account) would either hit a
 * raw DB unique-constraint crash or silently take over someone else's
 * number. Blocking here means that PENDING row just never gets promoted to
 * a real account — no separate cleanup needed.
 */
async function checkPhoneAvailable(phone: string, excludeUserId: string): Promise<ActionResponse | null> {
  const owner = await prisma.user.findFirst({ where: { phone, NOT: { id: excludeUserId } }, select: { role: true } });
  if (!owner) return null;
  return {
    success: false,
    error: `This phone number is already registered as a ${owner.role.toLowerCase()} — log in instead.`,
    errors: { phone: ["Already in use"] },
  };
}

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
    const phoneConflict = await checkPhoneAvailable(validated.data.phone, userId);
    if (phoneConflict) return phoneConflict;

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
    const phoneConflict = await checkPhoneAvailable(phone, userId);
    if (phoneConflict) return phoneConflict;

    // Checked before the upsert so we know whether this is a first-time
    // completion (auto-seed one serviceable area below) vs. a repeat
    // profile edit (never re-seed on every save).
    const isFirstCompletion = (await prisma.vendorProfile.findUnique({ where: { userId }, select: { id: true } })) === null;

    const [, vendorProfile] = await prisma.$transaction([
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
          // undefined means "leave unchanged" to Prisma's update — clearing
          // a KYC field back to blank must explicitly set null.
          gstNumber: gstNumber ?? null,
          panNumber: panNumber ?? null,
          aadhaarNumber: aadhaarNumber ?? null,
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

    if (isFirstCompletion) {
      // Best-effort so a brand-new vendor isn't stuck at zero live-call
      // coverage until they visit /vendor/service-areas themselves. 15km
      // mirrors the old flat-radius default; a failed geocode is non-fatal.
      const coords = await forwardGeocodePincode(pincode);
      if (coords) {
        await prisma.vendorServiceArea.create({
          data: { vendorId: vendorProfile.id, pincode, latitude: coords.latitude, longitude: coords.longitude, radiusKm: 15 },
        });
      } else {
        console.error(`Could not auto-seed a service area for new vendor ${vendorProfile.id} (pincode ${pincode})`);
      }
    }

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
    const phoneConflict = await checkPhoneAvailable(phone, userId);
    if (phoneConflict) return phoneConflict;

    // Checked before the upsert so we know whether this is a first-time
    // completion (auto-seed one serviceable area below) vs. a repeat
    // profile edit (never re-seed on every save).
    const isFirstCompletion = (await prisma.technicianProfile.findUnique({ where: { userId }, select: { id: true } })) === null;

    const [, technicianProfile] = await prisma.$transaction([
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

    if (isFirstCompletion) {
      // Best-effort so a brand-new technician isn't stuck with no coverage
      // circle visible on the vendor/admin map until they visit
      // /technician/service-areas themselves. 15km mirrors the vendor
      // round's auto-seed default; a failed geocode is non-fatal.
      const coords = await forwardGeocodePincode(servicePincode);
      if (coords) {
        await prisma.technicianServiceArea.create({
          data: {
            technicianId: technicianProfile.id,
            pincode: servicePincode,
            latitude: coords.latitude,
            longitude: coords.longitude,
            radiusKm: 15,
          },
        });
      } else {
        console.error(`Could not auto-seed a service area for new technician ${technicianProfile.id} (pincode ${servicePincode})`);
      }
    }

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
