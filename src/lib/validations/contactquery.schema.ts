import { z } from "zod";

export const contactQuerySchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Enter a valid email address").max(254),
  reason: z.enum(["GENERAL", "SUPPORT", "SALES", "PARTNER"]),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message is too long — please keep it under 2000 characters"),
});

export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
