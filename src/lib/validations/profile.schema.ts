import { z } from "zod";

export const updateNameSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
});
export type UpdateNameInput = z.infer<typeof updateNameSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters").max(100),
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
