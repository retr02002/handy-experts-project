"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mapPrismaPackage } from "@/lib/services-data";
import type { ActionResponse } from "@/actions/auth.actions";
import type { CartItem } from "@/context/CartContext";

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getCartAction(): Promise<ActionResponse<{ items: CartItem[]; savedItems: CartItem[] }>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  try {
    const rows = await prisma.cartItem.findMany({
      where: { userId },
      include: { package: { include: { service: true } } },
      orderBy: { createdAt: "asc" },
    });

    const toCartItem = (row: (typeof rows)[number]): CartItem => ({
      id: row.packageId,
      serviceId: row.package.service.id,
      serviceTitle: row.package.service.title,
      pkg: mapPrismaPackage(row.package),
      quantity: row.quantity,
    });

    const items = rows.filter((r) => r.status === "ACTIVE").map(toCartItem);
    const savedItems = rows.filter((r) => r.status === "SAVED").map(toCartItem);

    return { success: true, data: { items, savedItems } };
  } catch (error) {
    console.error("Get cart error:", error);
    return { success: false, error: "Failed to load cart" };
  }
}

export async function addToCartAction(packageId: string): Promise<ActionResponse<null>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  try {
    const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId }, select: { id: true } });
    if (!pkg) return { success: false, error: "Package not found" };

    const existing = await prisma.cartItem.findUnique({
      where: { userId_packageId: { userId, packageId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          status: "ACTIVE",
          quantity: existing.status === "ACTIVE" ? existing.quantity + 1 : existing.quantity,
        },
      });
    } else {
      await prisma.cartItem.create({
        data: { userId, packageId, quantity: 1, status: "ACTIVE" },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

export async function updateCartItemQuantityAction(packageId: string, quantity: number): Promise<ActionResponse<null>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  try {
    if (quantity <= 0) {
      await prisma.cartItem.deleteMany({ where: { userId, packageId } });
    } else {
      await prisma.cartItem.updateMany({ where: { userId, packageId }, data: { quantity } });
    }
    return { success: true };
  } catch (error) {
    console.error("Update cart quantity error:", error);
    return { success: false, error: "Failed to update quantity" };
  }
}

export async function removeCartItemAction(packageId: string): Promise<ActionResponse<null>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  try {
    await prisma.cartItem.deleteMany({ where: { userId, packageId } });
    return { success: true };
  } catch (error) {
    console.error("Remove cart item error:", error);
    return { success: false, error: "Failed to remove item" };
  }
}

export async function setCartItemStatusAction(
  packageId: string,
  status: "ACTIVE" | "SAVED"
): Promise<ActionResponse<null>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  try {
    await prisma.cartItem.updateMany({ where: { userId, packageId }, data: { status } });
    return { success: true };
  } catch (error) {
    console.error("Set cart item status error:", error);
    return { success: false, error: "Failed to update item" };
  }
}

export async function clearActiveCartAction(): Promise<ActionResponse<null>> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Not signed in" };

  try {
    await prisma.cartItem.deleteMany({ where: { userId, status: "ACTIVE" } });
    return { success: true };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}
