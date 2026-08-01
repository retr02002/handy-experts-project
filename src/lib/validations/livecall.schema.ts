import { z } from "zod";
import { PAYMENT_MODE_OPTIONS } from "@/components/cart/checkoutTypes";

const PAYMENT_MODES = PAYMENT_MODE_OPTIONS.map((opt) => opt.value) as [string, ...string[]];

export const createLiveCallSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name").max(100),
  customerEmail: z.string().trim().email("Enter a valid email"),
  customerPhone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  address: z.string().trim().min(5, "Please enter your street address").max(500),
  city: z.string().trim().min(1, "Enter a valid city").max(100),
  state: z.string().trim().min(1, "Enter a valid state").max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  // Nullable, not optional — the client always sends the field, but it's
  // null whenever "use current location" wasn't used. The action falls back
  // to forward-geocoding the address in that case rather than rejecting it.
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  paymentMode: z.enum(PAYMENT_MODES),
  upiRef: z.string().trim().min(3, "Enter a valid UPI reference").max(100),
  paymentScreenshotUrl: z.string().trim().min(1, "Payment screenshot is required"),
});
export type CreateLiveCallInput = z.infer<typeof createLiveCallSchema>;
