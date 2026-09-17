import { z } from "zod";

export const contactQuerySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  reason: z.enum(["GENERAL", "SUPPORT", "SALES", "PARTNER"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
