import { z } from "zod";

// Deliberately looser than the OTP-delivery phoneSchema (otp.schema.ts) —
// this is a display contact number, not a number that must receive an SMS,
// so a landline or a formatted number ("+91 11 4567 8900") is valid here.
const phoneValuePattern = /^[+]?[\d\s()-]{7,20}$/;

export const supportContactSchema = z
  .object({
    type: z.enum(["PHONE", "EMAIL"]),
    // e.g. "Billing", "Technical", "General" — shown above the value.
    label: z.string().trim().min(1, "Label is required").max(50, "Keep it short"),
    value: z.string().trim().min(1, "Enter a phone number or email"),
    sortOrder: z.coerce.number().int().min(0, "Sort order must be 0 or more").default(0),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PHONE" && !phoneValuePattern.test(data.value)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a valid phone number" });
    }
    if (data.type === "EMAIL") {
      const parsed = z.string().email().safeParse(data.value.toLowerCase());
      if (!parsed.success) {
        ctx.addIssue({ code: "custom", path: ["value"], message: "Enter a valid email address" });
      }
    }
  });

export type SupportContactInput = z.infer<typeof supportContactSchema>;
