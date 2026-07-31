import { z } from "zod";

export const serviceBenefitSchema = z.object({
  icon: z.string().min(1, "Icon is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
export type ServiceBenefit = z.infer<typeof serviceBenefitSchema>;

export const serviceStepSchema = z.object({
  step: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});
export type ServiceStep = z.infer<typeof serviceStepSchema>;

export const serviceFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});
export type ServiceFaq = z.infer<typeof serviceFaqSchema>;

export const serviceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, alphanumeric, and hyphen-separated"),
  category: z.string().min(1, "Category is required"),
  badge: z.string().optional(),
  badgeColor: z.string().optional(),
  rating: z.string().optional(),
  image: z.string().min(1, "Image is required"),
  videoUrl: z.string().optional(),
  time: z.string().optional(),
  warranty: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  benefits: z.array(serviceBenefitSchema).default([]),
  howItWorks: z.array(serviceStepSchema).default([]),
  faqs: z.array(serviceFaqSchema).default([]),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

export const servicePackageSchema = z.object({
  serviceId: z.string().min(1, "Service is required"),
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.number().nonnegative("Price must be 0 or more"),
  originalPrice: z.number().nonnegative("Original price must be 0 or more"),
  time: z.string().optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  rating: z.string().optional(),
  image: z.string().optional(),
  features: z.array(z.string().min(1)).min(1, "Add at least one feature"),
  details: z.array(z.string().min(1)).default([]),
});

export type ServicePackageInput = z.infer<typeof servicePackageSchema>;
