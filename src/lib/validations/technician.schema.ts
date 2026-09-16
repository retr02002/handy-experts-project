import { z } from "zod";
import { usernameSchema } from "@/lib/validations/otp.schema";
import { SERVICEABLE_CITIES } from "@/lib/cities";

/**
 * One row of the modular "what they do" builder: a whole category (empty
 * `serviceIds`) or specific services within it (non-empty `serviceIds`).
 * The two are independent server-side (a TechnicianService row never
 * requires its parent category to also be assigned) — this input shape is
 * just the convenient "pick a category, then optionally narrow it" UI
 * grouping, not a structural requirement.
 */
export const skillAssignmentSchema = z.object({
  categoryId: z.string().min(1),
  serviceIds: z.array(z.string().min(1)).default([]),
});
export type SkillAssignmentInput = z.infer<typeof skillAssignmentSchema>;

export const createTechnicianSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  skillAssignments: z.array(skillAssignmentSchema).min(1, "Select at least one category or service"),
  experienceYears: z.coerce.number().int().min(0, "Can't be negative").max(60),
  // Drives the technician's structured ID city code — see src/lib/structuredIds.ts.
  city: z.enum(SERVICEABLE_CITIES, "Select a city"),
  // Courtesy display field only, no longer required — job matching is now
  // live-location-based, not pincode-based. Blank stays blank.
  servicePincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
    .optional()
    .or(z.literal("")),
  // Optional: blank means the server generates one. Vendors who want a
  // memorable login for their technician can set it themselves.
  username: usernameSchema.optional().or(z.literal("")),
});
export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;

export const updateTechnicianSchema = createTechnicianSchema.extend({
  id: z.string().min(1),
  // City is set once at creation (issues the structured ID) and never
  // edited through this form — optional here purely so the existing edit
  // form, which doesn't collect it, keeps validating.
  city: z.enum(SERVICEABLE_CITIES).optional(),
});
export type UpdateTechnicianInput = z.infer<typeof updateTechnicianSchema>;
