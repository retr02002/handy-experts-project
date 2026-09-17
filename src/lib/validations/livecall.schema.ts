import { z } from "zod";

// Shared shape for both checkout paths — Cash on Delivery (createLiveCallAction)
// and Pay Online (createRazorpayOrderAction). Payment mode is no longer part
// of the client payload: it's implied by which action the client calls, and
// each action sets paymentMode/paymentStatus itself rather than trusting it.
export const checkoutDetailsSchema = z.object({
  customerName: z.string().trim().min(2, "Enter your full name").max(100),
  // Optional — an empty string from the client is treated as "not provided"
  // rather than validated as an email; a non-empty value still has to be a
  // real email address.
  customerEmail: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.string().email("Enter a valid email").optional()),
  customerPhone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  siteContactName: z.string().trim().max(100).optional().transform((v) => (v ? v : undefined)),
  // .optional() must be last — the client sends `undefined` (not "") when
  // the site-contact toggle is off, and a preceding z.string() would reject
  // that as a missing required field before ever reaching the regex check.
  siteContactPhone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number").optional(),
  address: z.string().trim().min(5, "Please enter your street address").max(500),
  city: z.string().trim().min(1, "Enter a valid city").max(100),
  state: z.string().trim().min(1, "Enter a valid state").max(100),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  // Nullable, not optional — the client always sends the field, but it's
  // null whenever "use current location" wasn't used. The action falls back
  // to forward-geocoding the address in that case rather than rejecting it.
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  // Neighbourhood/suburb text, present whenever the address came from "use
  // current location" or a saved address that has one — used to derive the
  // order's structured-ID area code. Null degrades gracefully (the area
  // code falls back to repeating the city code) rather than blocking checkout.
  locality: z.string().trim().max(200).nullable(),
  // Null means "as soon as possible" — the customer picked the Instant
  // option at checkout rather than a scheduled slot.
  scheduledFor: z.string().datetime().nullable(),
  // How much of the customer's wallet balance they'd like applied — always
  // re-clamped server-side against their real balance and the real order
  // total, never trusted as-is (same principle every price computation here
  // already follows). Optional — most orders don't touch the wallet at all.
  walletAmountRequested: z.number().min(0).optional().default(0),
  couponCode: z.string().trim().max(50).optional(),
});
export type CheckoutDetailsInput = z.infer<typeof checkoutDetailsSchema>;

// Cash on Delivery uses the shared shape as-is.
export const createLiveCallSchema = checkoutDetailsSchema;
export type CreateLiveCallInput = CheckoutDetailsInput;

export const cancelOrderSchema = z.object({
  liveCallId: z.string().min(1),
  reason: z.string().trim().min(3, "Please tell us why you're cancelling").max(300),
});
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
