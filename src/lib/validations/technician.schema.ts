import { z } from "zod";
import { SKILL_CATEGORIES } from "@/lib/validations/onboarding.schema";

export const createTechnicianSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  skillCategory: z.enum(SKILL_CATEGORIES),
  experienceYears: z.coerce.number().int().min(0, "Can't be negative").max(60),
  servicePincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});
export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;

export const updateTechnicianSchema = createTechnicianSchema.extend({
  id: z.string().min(1),
});
export type UpdateTechnicianInput = z.infer<typeof updateTechnicianSchema>;
