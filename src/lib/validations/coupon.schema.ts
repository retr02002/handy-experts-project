import { z } from "zod";

export const couponScopeTargetSchema = z.object({
  categoryId: z.string().optional(),
  serviceId: z.string().optional(),
  packageId: z.string().optional(),
});

export const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(30, "Keep it under 30 characters")
      .regex(/^[A-Za-z0-9_-]+$/, "Letters, numbers, hyphens and underscores only")
      .transform((v) => v.toUpperCase()),
    description: z.string().trim().max(200).optional(),
    discountType: z.enum(["FLAT", "PERCENTAGE"]),
    discountValue: z.number().positive("Enter a value greater than 0"),
    scopeType: z.enum(["ALL", "SPECIFIC"]).default("ALL"),
    scopes: z.array(couponScopeTargetSchema).default([]),
    startsAt: z.string().datetime().nullable().default(null),
    endsAt: z.string().datetime().nullable().default(null),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
      ctx.addIssue({ code: "custom", path: ["discountValue"], message: "A percentage discount can't exceed 100" });
    }
    if (data.scopeType === "SPECIFIC" && data.scopes.length === 0) {
      ctx.addIssue({ code: "custom", path: ["scopes"], message: "Pick at least one category, service, or package" });
    }
    if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
      ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End date must be after the start date" });
    }
  });

export type CouponInput = z.infer<typeof couponSchema>;
