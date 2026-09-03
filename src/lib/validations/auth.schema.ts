import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password must be less than 100 characters" }),
  name: z.string().optional(),
  // Technician-only login handle — self-chosen at signup.
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{4,20}$/, "4-20 characters — letters, numbers, underscores only")
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
