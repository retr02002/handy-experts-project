import { z } from "zod";

export const addServiceAreaSchema = z.object({
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  radiusKm: z.number().min(1, "Radius must be at least 1km").max(25, "Radius can't exceed 25km"),
});
export type AddServiceAreaInput = z.infer<typeof addServiceAreaSchema>;

export const updateServiceAreaRadiusSchema = z.object({
  id: z.string().min(1),
  radiusKm: z.number().min(1, "Radius must be at least 1km").max(25, "Radius can't exceed 25km"),
});
export type UpdateServiceAreaRadiusInput = z.infer<typeof updateServiceAreaRadiusSchema>;
