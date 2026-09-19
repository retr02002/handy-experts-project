"use server";

import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/actions/auth.actions";
import { createRazorpayOrder, verifyPaymentSignature } from "@/lib/razorpay";
import { requireAdmin } from "@/lib/require-admin";

const MIN_TOPUP_RUPEES = 100;

async function requireVendorId(): Promise<{ vendorId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { vendorId: null, error: "Not signed in as a vendor" };
  }
  const profile = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, isActive: true },
  });
  if (!profile) return { vendorId: null, error: "Vendor profile not found" };
  // Same isActive gate buyLiveCallAction already applies before letting a
  // vendor spend — a deactivated account shouldn't be able to move wallet
  // money either.
  if (!profile.isActive) return { vendorId: null, error: "Your account is deactivated." };
  return { vendorId: profile.id, error: null };
}

/**
 * Gets-or-creates the vendor's wallet row — every vendor should have one,
 * but existing vendors predate this feature, so it's lazily created on
 * first touch rather than backfilled.
 */
async function ensureVendorWallet(vendorId: string): Promise<{ id: string }> {
  const existing = await prisma.vendorWallet.findUnique({ where: { vendorId }, select: { id: true } });
  if (existing) return existing;
  return prisma.vendorWallet.create({ data: { vendorId }, select: { id: true } });
}

export interface WalletSummary {
  balance: number;
  leadPricingType: string;
  leadPricingValue: number;
  transactions: {
    id: string;
    type: string;
    status: string;
    amount: number;
    liveCallId: string | null;
    adminName: string | null;
    adminNote: string | null;
    createdAt: string;
  }[];
}

export async function getMyWalletAction(): Promise<ActionResponse<WalletSummary>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  try {
    const wallet = await ensureVendorWallet(vendorId);
    const [balanceRow, transactions, vendorProfile] = await Promise.all([
      prisma.vendorWallet.findUnique({ where: { id: wallet.id }, select: { balance: true } }),
      prisma.vendorWalletTransaction.findMany({
        where: { walletId: wallet.id, status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.vendorProfile.findUnique({
        where: { id: vendorId },
        select: { leadPricingType: true, leadPricingValue: true },
      }),
    ]);

    return {
      success: true,
      data: {
        balance: balanceRow?.balance ?? 0,
        leadPricingType: vendorProfile?.leadPricingType ?? "FLAT",
        leadPricingValue: vendorProfile?.leadPricingValue ?? 49,
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
          amount: t.amount,
          liveCallId: t.liveCallId,
          adminName: t.adminName,
          adminNote: t.adminNote,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    };
  } catch (err) {
    console.error("Get my wallet error:", err);
    return { success: false, error: "Failed to load your wallet" };
  }
}

/**
 * Admin-by-id counterpart to getMyWalletAction (which is session-derived,
 * for the vendor's own dashboard) — same shape, for the admin vendor detail
 * page's Wallet tab. Never creates a wallet row on a read — only an actual
 * recharge (adminRechargeVendorWalletAction, unchanged) should provision one.
 */
export async function getAdminVendorWalletAction(vendorId: string): Promise<ActionResponse<WalletSummary>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const [wallet, vendorProfile] = await Promise.all([
      prisma.vendorWallet.findUnique({ where: { vendorId }, select: { id: true, balance: true } }),
      prisma.vendorProfile.findUnique({ where: { id: vendorId }, select: { leadPricingType: true, leadPricingValue: true } }),
    ]);
    if (!vendorProfile) return { success: false, error: "Vendor not found" };

    const transactions = wallet
      ? await prisma.vendorWalletTransaction.findMany({
          where: { walletId: wallet.id, status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      : [];

    return {
      success: true,
      data: {
        balance: wallet?.balance ?? 0,
        leadPricingType: vendorProfile.leadPricingType,
        leadPricingValue: vendorProfile.leadPricingValue,
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          status: t.status,
          amount: t.amount,
          liveCallId: t.liveCallId,
          adminName: t.adminName,
          adminNote: t.adminNote,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    };
  } catch (err) {
    console.error("Get admin vendor wallet error:", err);
    return { success: false, error: "Failed to load this vendor's wallet" };
  }
}

export interface WalletTopupOrderResult {
  transactionId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

/**
 * Starts a deposit — mirrors createRazorpayOrderAction's shape exactly
 * (src/actions/payment.actions.ts): create the Razorpay order first, then a
 * local PENDING record pointing at it. Balance is untouched until
 * verifyWalletTopupAction (or the webhook) confirms payment.
 */
export async function createWalletTopupOrderAction(amountRupees: number): Promise<ActionResponse<WalletTopupOrderResult>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  if (!Number.isFinite(amountRupees) || amountRupees < MIN_TOPUP_RUPEES) {
    return { success: false, error: `Minimum top-up is ₹${MIN_TOPUP_RUPEES}` };
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    return { success: false, error: "Online payment isn't configured right now" };
  }

  try {
    const wallet = await ensureVendorWallet(vendorId);
    const amountPaise = Math.round(amountRupees) * 100;

    const order = await createRazorpayOrder({ amountPaise, receipt: randomUUID() });
    if (!order.ok) {
      return { success: false, error: order.error };
    }

    const transaction = await prisma.vendorWalletTransaction.create({
      data: {
        walletId: wallet.id,
        type: "DEPOSIT",
        status: "PENDING",
        amount: amountRupees,
        razorpayOrderId: order.razorpayOrderId,
      },
    });

    return {
      success: true,
      data: {
        transactionId: transaction.id,
        razorpayOrderId: order.razorpayOrderId,
        amountPaise: order.amount,
        currency: order.currency,
        keyId,
      },
    };
  } catch (err) {
    console.error("Create wallet top-up order error:", err);
    return { success: false, error: "Couldn't start the top-up. Please try again." };
  }
}

/**
 * Confirms a deposit — same idempotent contract as verifyRazorpayPaymentAction:
 * whichever of this client-return call or the webhook lands first wins the
 * conditional claim, the other is a safe no-op (count === 0 is success, not
 * an error).
 */
export async function verifyWalletTopupAction(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ActionResponse<{ balance: number }>> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error! };

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return { success: false, error: "Missing payment details" };
  }

  const isValid = verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
  if (!isValid) {
    console.error("Wallet top-up signature verification failed for order", razorpayOrderId);
    return { success: false, error: "We couldn't verify your payment. If money was deducted, it will be refunded." };
  }

  try {
    const txRow = await prisma.vendorWalletTransaction.findUnique({
      where: { razorpayOrderId },
      select: { id: true, walletId: true, amount: true, wallet: { select: { vendorId: true } } },
    });
    if (!txRow || txRow.wallet.vendorId !== vendorId) {
      return { success: false, error: "Top-up not found" };
    }

    await prisma.$transaction(async (tx) => {
      const claim = await tx.vendorWalletTransaction.updateMany({
        where: { id: txRow.id, status: "PENDING" },
        data: { status: "COMPLETED", razorpayPaymentId },
      });
      if (claim.count === 1) {
        await tx.vendorWallet.update({
          where: { id: txRow.walletId },
          data: { balance: { increment: txRow.amount } },
        });
      }
      // count === 0 means the webhook already confirmed this deposit — a
      // safe no-op, same idempotency contract as everywhere else.
    });

    // No revalidatePath — VendorWalletClient sets its local balance state
    // directly from this action's own returned data, it never re-fetches.
    const wallet = await prisma.vendorWallet.findUnique({ where: { id: txRow.walletId }, select: { balance: true } });
    return { success: true, data: { balance: wallet?.balance ?? 0 } };
  } catch (err) {
    console.error("Verify wallet top-up error:", err);
    return { success: false, error: "Couldn't confirm your payment. Please contact support if money was deducted." };
  }
}

export interface VendorLeadPricing {
  id: string;
  companyName: string;
  isActive: boolean;
  leadPricingType: string;
  leadPricingValue: number;
  walletBalance: number;
}

export async function getAllVendorsForLeadPricingAction(): Promise<ActionResponse<VendorLeadPricing[]>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const vendors = await prisma.vendorProfile.findMany({
      select: {
        id: true,
        companyName: true,
        isActive: true,
        leadPricingType: true,
        leadPricingValue: true,
        wallet: { select: { balance: true } },
      },
      orderBy: { companyName: "asc" },
    });

    return {
      success: true,
      data: vendors.map((v) => ({
        id: v.id,
        companyName: v.companyName,
        isActive: v.isActive,
        leadPricingType: v.leadPricingType,
        leadPricingValue: v.leadPricingValue,
        walletBalance: v.wallet?.balance ?? 0,
      })),
    };
  } catch (err) {
    console.error("Get vendors for lead pricing error:", err);
    return { success: false, error: "Failed to load vendors" };
  }
}

/** The signed-in customer's wallet balance, for the checkout "use wallet
 *  balance" toggle. Never creates a wallet row on read — a customer with no
 *  wallet yet (never had a refund) just has a balance of 0. */
export async function getMyCustomerWalletBalanceAction(): Promise<ActionResponse<{ balance: number }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return { success: false, error: "Not signed in as a customer" };
  }

  try {
    const wallet = await prisma.customerWallet.findUnique({
      where: { userId: session.user.id },
      select: { balance: true },
    });
    return { success: true, data: { balance: wallet?.balance ?? 0 } };
  } catch (err) {
    console.error("Get my customer wallet balance error:", err);
    return { success: false, error: "Failed to load your wallet" };
  }
}

export interface AdminWalletOverview {
  totalDeposited: number;
  totalSpentOnLeads: number;
  currentBalanceAcrossVendors: number;
  activeVendorCount: number;
  recentTransactions: {
    id: string;
    vendorName: string;
    type: string;
    amount: number;
    createdAt: string;
  }[];
}

/** Platform-wide view for /admin/wallet — real aggregates, not the
 *  hardcoded placeholder numbers this page used to show. */
export async function getAdminWalletOverviewAction(): Promise<ActionResponse<AdminWalletOverview>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  try {
    const [deposits, debits, balances, activeVendorCount, recent] = await Promise.all([
      prisma.vendorWalletTransaction.aggregate({
        where: { type: "DEPOSIT", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.vendorWalletTransaction.aggregate({
        where: { type: "DEBIT", status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.vendorWallet.aggregate({ _sum: { balance: true } }),
      prisma.vendorProfile.count({ where: { isActive: true } }),
      prisma.vendorWalletTransaction.findMany({
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { wallet: { select: { vendor: { select: { companyName: true } } } } },
      }),
    ]);

    return {
      success: true,
      data: {
        totalDeposited: deposits._sum.amount ?? 0,
        totalSpentOnLeads: debits._sum.amount ?? 0,
        currentBalanceAcrossVendors: balances._sum.balance ?? 0,
        activeVendorCount,
        recentTransactions: recent.map((t) => ({
          id: t.id,
          vendorName: t.wallet.vendor.companyName,
          type: t.type,
          amount: t.amount,
          createdAt: t.createdAt.toISOString(),
        })),
      },
    };
  } catch (err) {
    console.error("Get admin wallet overview error:", err);
    return { success: false, error: "Failed to load wallet overview" };
  }
}

export async function setVendorLeadPricingAction(
  vendorId: string,
  type: "FLAT" | "PERCENTAGE",
  value: number
): Promise<ActionResponse<null>> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { success: false, error: "Not authorized" };

  if (!Number.isFinite(value) || value < 0 || (type === "PERCENTAGE" && value > 100)) {
    return { success: false, error: "Invalid pricing value" };
  }

  try {
    await prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { leadPricingType: type, leadPricingValue: value },
    });
    revalidatePath("/admin/vendors");
    return { success: true };
  } catch (err) {
    console.error("Set vendor lead pricing error:", err);
    return { success: false, error: "Failed to update pricing" };
  }
}

/**
 * Admin manually credits a vendor's wallet — e.g. cash received outside the
 * app — alongside the vendor's own self-service Razorpay top-up. No
 * gateway involved, so this lands as COMPLETED immediately; the optional
 * note is the only audit trail for why the money was added.
 */
export async function adminRechargeVendorWalletAction(
  vendorId: string,
  amountRupees: number,
  note?: string
): Promise<ActionResponse<{ balance: number }>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return { success: false, error: "Not authorized" };
  }

  if (!Number.isFinite(amountRupees) || amountRupees <= 0) {
    return { success: false, error: "Enter a positive amount" };
  }

  // Whatever the admin's own profile currently has set as their name — the
  // same field shown everywhere else in the app as "who this is."
  const adminName = session.user.name?.trim() || "An admin";

  try {
    const wallet = await ensureVendorWallet(vendorId);
    await prisma.$transaction(async (tx) => {
      await tx.vendorWallet.update({ where: { id: wallet.id }, data: { balance: { increment: amountRupees } } });
      await tx.vendorWalletTransaction.create({
        // adminName is always non-null here — its presence, not its
        // content, is what the vendor's own wallet page uses to distinguish
        // "an admin credited this" from a self-service Razorpay deposit.
        data: {
          walletId: wallet.id,
          type: "DEPOSIT",
          status: "COMPLETED",
          amount: amountRupees,
          adminName,
          adminNote: note?.trim() || null,
        },
      });
    });

    const updated = await prisma.vendorWallet.findUnique({ where: { id: wallet.id }, select: { balance: true } });
    revalidatePath("/admin/vendors");
    revalidatePath("/vendor/wallet");
    return { success: true, data: { balance: updated?.balance ?? 0 } };
  } catch (err) {
    console.error("Admin recharge vendor wallet error:", err);
    return { success: false, error: "Failed to recharge this vendor's wallet" };
  }
}
