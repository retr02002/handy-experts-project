import { z } from "zod";

const phoneSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{4,20}$/, "4-20 characters — letters, numbers, underscores only");
const channelSchema = z.enum(["SMS", "WHATSAPP"]);
export const otpCodeSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code");

export const sendCustomerOtpSchema = z.object({
  phone: phoneSchema,
  channel: channelSchema,
});
export type SendCustomerOtpInput = z.infer<typeof sendCustomerOtpSchema>;

/**
 * Either a username or a 10-digit mobile. Validated loosely here (the two
 * formats can't be expressed as one regex without rejecting valid input);
 * findTechnicianByIdentifier decides which it is and whether it resolves.
 */
const technicianIdentifierSchema = z
  .string()
  .trim()
  .min(4, "Enter your username or 10-digit mobile number")
  .max(20, "Enter your username or 10-digit mobile number");

export const sendTechnicianOtpSchema = z.object({
  identifier: technicianIdentifierSchema,
  channel: channelSchema,
});
export type SendTechnicianOtpInput = z.infer<typeof sendTechnicianOtpSchema>;

export { phoneSchema, usernameSchema, technicianIdentifierSchema };
