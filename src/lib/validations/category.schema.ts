import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  // Same regex and message as serviceSchema.slug so error copy stays
  // consistent across the admin.
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated"),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().int().min(0, "Sort order must be 0 or more").default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
