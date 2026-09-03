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

export const sendTechnicianOtpSchema = z.object({
  username: usernameSchema,
  channel: channelSchema,
});
export type SendTechnicianOtpInput = z.infer<typeof sendTechnicianOtpSchema>;

export { phoneSchema, usernameSchema };
