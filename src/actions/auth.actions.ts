"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { registerSchema, RegisterInput } from "@/lib/validations/auth.schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserRole() {
  const session = await getServerSession(authOptions);
  return session?.user?.role || "CUSTOMER";
}

export type ActionResponse<T = unknown> = 
  | { success: true; data?: T }
  | { success: false; error: string; errors?: Record<string, string[]> };

export async function registerUser(input: RegisterInput): Promise<ActionResponse> {
  try {
    // 1. Validate the input using Zod
    const validatedData = registerSchema.safeParse(input);
    
    if (!validatedData.success) {
      return { 
        success: false, 
        error: "Invalid input data",
        errors: validatedData.error.flatten().fieldErrors 
      };
    }

    const { email, password, name } = validatedData.data;

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { success: false, error: "A user with this email already exists" };
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create the user — role defaults to PENDING; they pick an account
    // type (customer/vendor/technician) on the /onboarding step right after.
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An unexpected error occurred during registration" };
  }
}
