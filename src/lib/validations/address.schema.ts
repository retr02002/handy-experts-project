import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Give this address a name").max(50),
  addressLine: z.string().trim().min(5, "Please enter the full address").max(500),
  city: z.string().trim().min(1, "Enter a valid city").max(100),
  state: z.string().trim().min(1, "Enter a valid state").max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isDefault: z.boolean().optional(),
});
export type AddressInput = z.infer<typeof addressSchema>;
