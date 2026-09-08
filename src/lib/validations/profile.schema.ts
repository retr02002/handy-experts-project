import { z } from "zod";

export const updateNameSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
});
export type UpdateNameInput = z.infer<typeof updateNameSchema>;

export const updateEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;

export const updatePhoneSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
});
export type UpdatePhoneInput = z.infer<typeof updatePhoneSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(100),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
