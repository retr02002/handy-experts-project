"use server";

import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/actions/auth.actions";
import { requireAdmin } from "@/lib/require-admin";
import { createTechnicianSchema, type CreateTechnicianInput, type SkillAssignmentInput } from "@/lib/validations/technician.schema";
import { generateUsername, type CreatedTechnicianCredentials } from "./technician.actions";
import { issueTechnicianId, formatTechnicianId } from "@/lib/structuredIds";
import { applySkillAssignments, deriveLegacySkillLabel } from "@/lib/technicianSkills";
import { sendTextMessage } from "@/lib/apitxt";
import { revalidatePath } from "next/cache";

export async function createFreelanceTechnicianAction(
  input: CreateTechnicianInput
): Promise<ActionResponse<CreatedTechnicianCredentials>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  const validated = createTechnicianSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  
  // Note: servicePincode is omitted based on user feedback
  const { name, email, phone, skillAssignments, experienceYears, city } = validated.data;
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
          type: "FREELANCE",
          vendorId: null,
          skillCategory,
          experienceYears,
          servicePincode: null,
        },
      });
      await applySkillAssignments(tx, technician.id, skillAssignments);
      const idParts = await issueTechnicianId(tx, technician.id, city);
      return { technicianId: technician.id, idParts };
    });

    const sendResult = await sendTextMessage({
      phone,
      channel: "SMS",
      message: `Your Handyzo freelance technician login — Username: ${username}  Temp password: ${tempPassword}. Please log in and change your password.`,
    });

    revalidatePath("/admin/freelance-technicians");
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
    console.error("Create freelance technician error:", err);
    return { success: false, error: "Failed to create freelance technician" };
  }
}

export async function updateFreelanceTechnicianSkillsAction(
  technicianId: string,
  skillAssignments: SkillAssignmentInput[]
): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: technicianId, type: "FREELANCE" },
    });
    if (!technician) return { success: false, error: "Freelance technician not found" };

    const skillCategory = await deriveLegacySkillLabel(prisma, skillAssignments);

    await prisma.$transaction(async (tx) => {
      await tx.technicianProfile.update({
        where: { id: technicianId },
        data: { skillCategory },
      });
      await applySkillAssignments(tx, technicianId, skillAssignments);
    });

    revalidatePath(`/admin/freelance-technicians/${technicianId}`);
    return { success: true };
  } catch (err) {
    console.error("Update freelance skills error:", err);
    return { success: false, error: "Failed to update skills" };
  }
}
