"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import {
  updateNameSchema,
  changePasswordSchema,
  type UpdateNameInput,
  type ChangePasswordInput,
} from "@/lib/validations/profile.schema";

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function updateProfileName(input: UpdateNameInput): Promise<ActionResponse> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  const validated = updateNameSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input", errors: validated.error.flatten().fieldErrors };
  }

  try {
    await prisma.user.update({ where: { id: userId }, data: { name: validated.data.name } });
    revalidatePath("/customer/profile");
    revalidatePath("/vendor/profile");
    revalidatePath("/technician/profile");
    return { success: true };
  } catch (error) {
    console.error("Update name error:", error);
    return { success: false, error: "Failed to update name" };
  }
}

export async function changePassword(input: ChangePasswordInput): Promise<ActionResponse> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  const validated = changePasswordSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input", errors: validated.error.flatten().fieldErrors };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) return { success: false, error: "User not found" };

    // OAuth-only accounts have no password on file yet — let them set one
    // without proving a "current" password that was never set.
    if (user.password) {
      if (!validated.data.currentPassword) {
        return {
          success: false,
          error: "Current password is required",
          errors: { currentPassword: ["Current password is required"] },
        };
      }
      const isCorrect = await bcrypt.compare(validated.data.currentPassword, user.password);
      if (!isCorrect) {
        return {
          success: false,
          error: "Current password is incorrect",
          errors: { currentPassword: ["Incorrect password"] },
        };
      }
    }

    const hashed = await bcrypt.hash(validated.data.newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password" };
  }
}

export interface ProfileDetails {
  name: string | null;
  email: string | null;
  image: string | null;
  phone: string | null;
  hasPassword: boolean;
  role: string;
  vendorProfile: {
    companyName: string;
    companyType: string;
    gstNumber: string;
    panNumber: string;
    aadhaarNumber: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    incorporationDate: Date;
  } | null;
  technicianProfile: {
    skillCategory: string;
    experienceYears: number;
    servicePincode: string;
    type: string;
  } | null;
}

export async function getProfileDetails(): Promise<ProfileDetails | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      phone: true,
      password: true,
      role: true,
      vendorProfile: {
        select: {
          companyName: true,
          companyType: true,
          gstNumber: true,
          panNumber: true,
          aadhaarNumber: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          incorporationDate: true,
        },
      },
      technicianProfile: {
        select: { skillCategory: true, experienceYears: true, servicePincode: true, type: true },
      },
    },
  });
  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    phone: user.phone,
    hasPassword: !!user.password,
    role: user.role,
    vendorProfile: user.vendorProfile,
    technicianProfile: user.technicianProfile,
  };
}
