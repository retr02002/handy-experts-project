"use server";

import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendOtpMessage, type OtpChannel } from "@/lib/apitxt";
import type { ActionResponse } from "@/actions/auth.actions";
import { sendCustomerOtpSchema, sendTechnicianOtpSchema } from "@/lib/validations/otp.schema";
import type { OtpPurpose } from "@prisma/client";

const RESEND_COOLDOWN_SECONDS = 45;
const HOURLY_SEND_CAP = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const CODE_TTL_MINUTES = 10;

function generateCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

function maskPhone(phone: string): string {
  return `•••••• ${phone.slice(-4)}`;
}

async function checkRateLimit(phone: string, purpose: OtpPurpose): Promise<{ ok: true } | { ok: false; error: string }> {
  const latest = await prisma.otpCode.findFirst({
    where: { phone, purpose },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (latest) {
    const elapsedSeconds = (Date.now() - latest.createdAt.getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const remaining = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
      return { ok: false, error: `Please wait ${remaining}s before requesting another code` };
    }
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.otpCode.count({
    where: { phone, purpose, createdAt: { gt: oneHourAgo } },
  });
  if (recentCount >= HOURLY_SEND_CAP) {
    return { ok: false, error: "Too many code requests — please try again later" };
  }

  return { ok: true };
}

async function issueOtp(
  phone: string,
  purpose: OtpPurpose,
  channel: OtpChannel
): Promise<{ ok: true; cooldownSeconds: number } | { ok: false; error: string }> {
  const rateCheck = await checkRateLimit(phone, purpose);
  if (!rateCheck.ok) return rateCheck;

  const code = generateCode();
  if (process.env.OTP_DEBUG_LOG === "true") console.log(`[OTP DEBUG] ${phone} (${purpose}/${channel}) code:`, code);
  const sendResult = await sendOtpMessage({ phone, code, channel });
  if (!sendResult.ok) return { ok: false, error: sendResult.error };

  const codeHash = await bcrypt.hash(code, 10);
  await prisma.otpCode.create({
    data: {
      phone,
      channel,
      purpose,
      codeHash,
      expiresAt: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
    },
  });

  return { ok: true, cooldownSeconds: RESEND_COOLDOWN_SECONDS };
}

export async function sendCustomerOtp(input: {
  phone: string;
  channel: OtpChannel;
}): Promise<ActionResponse<{ cooldownSeconds: number }>> {
  const validated = sendCustomerOtpSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  const result = await issueOtp(validated.data.phone, "CUSTOMER_LOGIN", validated.data.channel);
  if (!result.ok) return { success: false, error: result.error };
  return { success: true, data: { cooldownSeconds: result.cooldownSeconds } };
}

export async function sendTechnicianOtp(input: {
  username: string;
  channel: OtpChannel;
}): Promise<ActionResponse<{ cooldownSeconds: number; phoneHint: string }>> {
  const validated = sendTechnicianOtpSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }

  const technician = await prisma.user.findFirst({
    where: { username: validated.data.username, role: "TECHNICIAN" },
    select: { phone: true },
  });
  if (!technician?.phone) {
    return { success: false, error: "No technician account found for that username" };
  }

  const result = await issueOtp(technician.phone, "TECHNICIAN_LOGIN", validated.data.channel);
  if (!result.ok) return { success: false, error: result.error };
  return { success: true, data: { cooldownSeconds: result.cooldownSeconds, phoneHint: maskPhone(technician.phone) } };
}

/**
 * Shared verification primitive — called from inside the NextAuth OTP
 * providers' authorize() functions, not exposed as a standalone "verify"
 * action, so a code is only ever consumed once, in one place.
 *
 * Matches against ANY non-consumed, non-expired, under-attempt-limit row for
 * this (phone, purpose) whose hash matches the submitted code — not just the
 * latest one — so a second OTP request from another tab/device doesn't
 * invalidate a still-valid first code.
 */
export async function consumeOtp({
  phone,
  purpose,
  code,
}: {
  phone: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const candidates = await prisma.otpCode.findMany({
    where: {
      phone,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      attempts: { lt: MAX_VERIFY_ATTEMPTS },
    },
    orderBy: { createdAt: "desc" },
  });

  if (candidates.length === 0) {
    return { ok: false, error: "Code expired or too many attempts — request a new one" };
  }

  for (const candidate of candidates) {
    const matches = await bcrypt.compare(code, candidate.codeHash);
    if (matches) {
      await prisma.otpCode.update({ where: { id: candidate.id }, data: { consumedAt: new Date() } });
      return { ok: true };
    }
  }

  // Wrong code — count it against the most recent candidate only, so a
  // client resending after a genuine expiry doesn't quietly burn attempts on
  // an already-dead row.
  await prisma.otpCode.update({
    where: { id: candidates[0].id },
    data: { attempts: { increment: 1 } },
  });
  return { ok: false, error: "Incorrect code" };
}
