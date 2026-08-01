import { z } from "zod";
import { vendorOnboardingSchema } from "@/lib/validations/onboarding.schema";

export const createVendorSchema = vendorOnboardingSchema.extend({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});
export type CreateVendorInput = z.infer<typeof createVendorSchema>;

export const updateVendorSchema = vendorOnboardingSchema.omit({ latitude: true, longitude: true }).extend({
  id: z.string().min(1),
});
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;
