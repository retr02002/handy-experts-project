"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { ActionResponse } from "@/actions/auth.actions";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type TechnicianWalletTransaction = {
  id: string;
  type: string;
  status: string;
  amount: number;
  createdAt: string;
  liveCallId?: string | null;
  adminName?: string | null;
  adminNote?: string | null;
};

export type TechnicianWalletData = {
  id: string;
  balance: number;
  transactions: TechnicianWalletTransaction[];
};

export async function getAdminTechnicianWalletAction(technicianId: string): Promise<ActionResponse<TechnicianWalletData>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    let wallet = await prisma.technicianWallet.findUnique({
      where: { technicianId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!wallet) {
      // Create empty wallet if it doesn't exist
      wallet = await prisma.technicianWallet.create({
        data: { technicianId, balance: 0 },
        include: { transactions: true },
      });
    }

    return {
      success: true,
      data: {
        id: wallet.id,
        balance: wallet.balance,
        transactions: wallet.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
          amount: t.amount,
          createdAt: t.createdAt.toISOString(),
          liveCallId: t.liveCallId,
          adminName: t.adminName,
          adminNote: t.adminNote,
        })),
      },
    };
  } catch (err) {
    console.error("Get admin technician wallet error:", err);
    return { success: false, error: "Failed to load wallet" };
  }
}

export async function adminAddTechnicianFundsAction(
  technicianId: string,
  amount: number,
  note: string
): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  if (amount <= 0) return { success: false, error: "Amount must be greater than 0" };

  try {
    const session = await getServerSession(authOptions);
    const adminName = session?.user?.name || "Admin";

    await prisma.$transaction(async (tx) => {
      let wallet = await tx.technicianWallet.findUnique({ where: { technicianId } });
      if (!wallet) {
        wallet = await tx.technicianWallet.create({
          data: { technicianId, balance: 0 },
        });
      }

      await tx.technicianWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: amount,
          adminName,
          adminNote: note || "Manual recharge by admin",
        },
      });

      await tx.technicianWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });
    });

    revalidatePath(`/admin/freelance-technicians/${technicianId}`);
    return { success: true };
  } catch (err) {
    console.error("Admin add technician funds error:", err);
    return { success: false, error: "Failed to add funds" };
  }
}

export async function adminDeductTechnicianFundsAction(
  technicianId: string,
  amount: number,
  note: string
): Promise<ActionResponse> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  if (amount <= 0) return { success: false, error: "Amount must be greater than 0" };

  try {
    const session = await getServerSession(authOptions);
    const adminName = session?.user?.name || "Admin";

    await prisma.$transaction(async (tx) => {
      const wallet = await tx.technicianWallet.findUnique({ where: { technicianId } });
      if (!wallet) throw new Error("Wallet not found");
      if (wallet.balance < amount) throw new Error("Insufficient balance");

      await tx.technicianWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "REFUND", // Use REFUND or REDEEM, since WalletTransactionType only has DEPOSIT, REFUND, REDEEM. We'll use REFUND for deduction.
          status: "COMPLETED",
          amount: amount,
          adminName,
          adminNote: note || "Manual deduction by admin",
        },
      });

      await tx.technicianWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });
    });

    revalidatePath(`/admin/freelance-technicians/${technicianId}`);
    return { success: true };
  } catch (error) {
    console.error("Admin deduct technician funds error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to deduct funds" };
  }
}

export type TechnicianWalletSummary = TechnicianWalletData & {
  leadFeeType: "PERCENTAGE" | "FIXED";
  leadFeeAmount: number;
};

export async function getMyTechnicianWalletAction(): Promise<ActionResponse<TechnicianWalletSummary>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const technician = await prisma.technicianProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, type: true, leadFeeType: true, leadFeeAmount: true },
    });
    if (!technician) return { success: false, error: "Technician profile not found" };
    if (technician.type !== "FREELANCE") return { success: false, error: "Only freelance technicians have wallets" };

    let wallet = await prisma.technicianWallet.findUnique({
      where: { technicianId: technician.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.technicianWallet.create({
        data: { technicianId: technician.id, balance: 0 },
        include: { transactions: true },
      });
    }

    return {
      success: true,
      data: {
        id: wallet.id,
        balance: wallet.balance,
        leadFeeType: technician.leadFeeType,
        leadFeeAmount: technician.leadFeeAmount,
        transactions: wallet.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
          amount: t.amount,
          createdAt: t.createdAt.toISOString(),
          liveCallId: t.liveCallId,
          adminName: t.adminName,
          adminNote: t.adminNote,
        })),
      },
    };
  } catch (err) {
    console.error("Get my technician wallet error:", err);
    return { success: false, error: "Failed to load wallet" };
  }
}

export async function createTechnicianWalletTopupOrderAction(amount: number): Promise<ActionResponse<{ razorpayOrderId: string; amountPaise: number; currency: string; keyId: string }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Not authorized" };
  }
  if (amount < 100) return { success: false, error: "Minimum top-up is ₹100" };

  try {
    const technician = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id } });
    if (!technician || technician.type !== "FREELANCE") return { success: false, error: "Only freelance technicians can top up" };

    const amountPaise = Math.round(amount * 100);
    const { createRazorpayOrder } = await import("@/lib/razorpay");
    
    const orderRes = await createRazorpayOrder({
      amountPaise,
      receipt: `technician_topup_${technician.id}_${Date.now()}`,
    });

    if (!orderRes.ok) {
      return { success: false, error: orderRes.error };
    }

    return {
      success: true,
      data: {
        razorpayOrderId: orderRes.razorpayOrderId,
        amountPaise,
        currency: orderRes.currency,
        keyId: process.env.RAZORPAY_KEY_ID!,
      },
    };
  } catch (err) {
    console.error("Create technician wallet topup order error:", err);
    return { success: false, error: "Failed to initialize payment gateway" };
  }
}

export async function verifyTechnicianWalletTopupAction(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ActionResponse<{ balance: number }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const { verifyPaymentSignature, fetchRazorpayPayment } = await import("@/lib/razorpay");

    if (!verifyPaymentSignature({
      orderId: params.razorpayOrderId,
      paymentId: params.razorpayPaymentId,
      signature: params.razorpaySignature
    })) {
      return { success: false, error: "Payment verification failed" };
    }

    const paymentRes = await fetchRazorpayPayment(params.razorpayPaymentId);
    
    if (!paymentRes.ok) {
      return { success: false, error: paymentRes.error };
    }
    
    if (paymentRes.status !== "captured") {
      return { success: false, error: "Payment is not in captured state" };
    }

    const amountAdded = paymentRes.amount / 100;
    
    const technician = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id } });
    if (!technician) return { success: false, error: "Technician not found" };

    const newBalance = await prisma.$transaction(async (tx) => {
      let wallet = await tx.technicianWallet.findUnique({ where: { technicianId: technician.id } });
      if (!wallet) {
        wallet = await tx.technicianWallet.create({ data: { technicianId: technician.id, balance: 0 } });
      }

      await tx.technicianWalletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: amountAdded,
          adminNote: `Razorpay topup (${params.razorpayPaymentId})`,
        },
      });

      const updated = await tx.technicianWallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amountAdded } },
      });
      return updated.balance;
    });

    revalidatePath("/technician/wallet");
    return { success: true, data: { balance: newBalance } };
  } catch (err) {
    console.error("Verify technician wallet topup error:", err);
    return { success: false, error: "Payment verification process failed" };
  }
}
