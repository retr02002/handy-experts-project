"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { addressSchema, type AddressInput } from "@/lib/validations/address.schema";

async function requireCustomerId(): Promise<{ userId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { userId: null, error: "Not signed in" };
  if (session.user.role !== "CUSTOMER") {
    return { userId: null, error: "Only customer accounts have saved addresses" };
  }
  return { userId: session.user.id, error: null };
}

export interface AddressSummary {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export async function getMyAddressesAction(): Promise<ActionResponse<AddressSummary[]>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  try {
    const rows = await prisma.address.findMany({
      where: { customerId: userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return { success: true, data: rows };
  } catch (err) {
    console.error("Get my addresses error:", err);
    return { success: false, error: "Failed to load your addresses" };
  }
}

/** Purpose-built for checkout autofill — phone plus the address book, without dragging in vendor/technician profile data. */
export async function getCheckoutPrefillAction(): Promise<ActionResponse<{ phone: string | null; addresses: AddressSummary[] }>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  try {
    const [user, addresses] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { phone: true } }),
      prisma.address.findMany({ where: { customerId: userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    ]);
    return { success: true, data: { phone: user?.phone ?? null, addresses } };
  } catch (err) {
    console.error("Get checkout prefill error:", err);
    return { success: false, error: "Failed to load your details" };
  }
}

export async function createAddressAction(input: AddressInput): Promise<ActionResponse<{ id: string }>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  const validated = addressSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  try {
    const existingCount = await prisma.address.count({ where: { customerId: userId } });
    const makeDefault = data.isDefault || existingCount === 0;

    const created = await prisma.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.address.updateMany({ where: { customerId: userId, isDefault: true }, data: { isDefault: false } });
      }
      return tx.address.create({
        data: {
          customerId: userId,
          label: data.label,
          addressLine: data.addressLine,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: makeDefault,
        },
      });
    });

    revalidatePath("/customer/addresses");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    console.error("Create address error:", err);
    return { success: false, error: "Failed to save this address" };
  }
}

export async function updateAddressAction(id: string, input: AddressInput): Promise<ActionResponse> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  const validated = addressSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  try {
    const existing = await prisma.address.findFirst({ where: { id, customerId: userId } });
    if (!existing) return { success: false, error: "Address not found" };

    await prisma.$transaction(async (tx) => {
      if (data.isDefault && !existing.isDefault) {
        await tx.address.updateMany({ where: { customerId: userId, isDefault: true }, data: { isDefault: false } });
      }
      await tx.address.update({
        where: { id },
        data: {
          label: data.label,
          addressLine: data.addressLine,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: data.latitude,
          longitude: data.longitude,
          isDefault: data.isDefault || existing.isDefault,
        },
      });
    });

    revalidatePath("/customer/addresses");
    return { success: true };
  } catch (err) {
    console.error("Update address error:", err);
    return { success: false, error: "Failed to update this address" };
  }
}

export async function deleteAddressAction(id: string): Promise<ActionResponse> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  try {
    const existing = await prisma.address.findFirst({ where: { id, customerId: userId } });
    if (!existing) return { success: false, error: "Address not found" };

    await prisma.address.delete({ where: { id } });

    // Promote the next-most-recent address to default so there's always one
    // set whenever any addresses remain — keeps checkout autofill working.
    if (existing.isDefault) {
      const next = await prisma.address.findFirst({ where: { customerId: userId }, orderBy: { createdAt: "desc" } });
      if (next) await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }

    revalidatePath("/customer/addresses");
    return { success: true };
  } catch (err) {
    console.error("Delete address error:", err);
    return { success: false, error: "Failed to delete this address" };
  }
}

export async function setDefaultAddressAction(id: string): Promise<ActionResponse> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  try {
    const existing = await prisma.address.findFirst({ where: { id, customerId: userId } });
    if (!existing) return { success: false, error: "Address not found" };

    await prisma.$transaction([
      prisma.address.updateMany({ where: { customerId: userId, isDefault: true }, data: { isDefault: false } }),
      prisma.address.update({ where: { id }, data: { isDefault: true } }),
    ]);

    revalidatePath("/customer/addresses");
    return { success: true };
  } catch (err) {
    console.error("Set default address error:", err);
    return { success: false, error: "Failed to set default address" };
  }
}
