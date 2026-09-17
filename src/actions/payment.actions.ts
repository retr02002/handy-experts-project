"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/actions/auth.actions";
import { checkoutDetailsSchema } from "@/lib/validations/livecall.schema";
import { computeOrderTotal } from "@/lib/pricing";
import { resolveCouponDiscount } from "@/lib/coupons";
import { createRazorpayOrder, verifyPaymentSignature } from "@/lib/razorpay";
import { notifyAllAdmins } from "@/actions/notification.actions";
import { requireCustomerId, resolveCoordinates, ensureServicePins } from "@/actions/livecall.actions";
import { LIVE_CALL_EXPIRY_MINUTES } from "@/lib/constants";
import { getCityCode, getAreaCode } from "@/lib/locationCodes";
import { nextSequence } from "@/lib/sequenceCounter";
import { formatTicketNumber } from "@/lib/ticketNumber";

export interface RazorpayOrderResult {
  liveCallId: string;
  ticketNumber: string;
  /** true when the wallet alone covered the whole order — no Razorpay
   *  fields are set, and the client should treat this like an already-placed
   *  order rather than opening the checkout modal. */
  fullyCoveredByWallet: boolean;
  razorpayOrderId: string | null;
  amountPaise: number;
  currency: string;
  keyId: string | null;
}

/**
 * The "Pay Online" checkout path. Creates the Razorpay order first, then
 * creates the LiveCall row already pointed at it but in AWAITING_PAYMENT —
 * invisible to every vendor/admin match query until verifyRazorpayPaymentAction
 * (or the webhook) confirms payment. The cart is deliberately NOT cleared
 * here — only once payment is verified, so an abandoned attempt leaves the
 * cart untouched and the row just expires via the same sweep that already
 * handles unaccepted broadcasts.
 *
 * If the customer applies enough wallet balance to cover the whole order,
 * Razorpay is skipped entirely — the wallet debit happens now and the order
 * is finalized immediately (fullyCoveredByWallet: true), same as a
 * wallet-covered COD order in createLiveCallAction. Otherwise the wallet
 * portion is debited now too (reserved against this specific order) and
 * Razorpay only has to collect the remainder — if this AWAITING_PAYMENT row
 * later expires unpaid, the sweep refunds the reserved wallet amount back.
 */
export async function createRazorpayOrderAction(input: unknown): Promise<ActionResponse<RazorpayOrderResult>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  const validated = checkoutDetailsSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid input data", errors: validated.error.flatten().fieldErrors };
  }
  const data = validated.data;

  const coords = await resolveCoordinates(data);
  if (!coords) {
    return {
      success: false,
      error: 'We couldn\'t pin your location from the address entered. Please tap "Use current location" or refine your address.',
    };
  }

  try {
    // Cart contents/prices are re-fetched here rather than trusted from the
    // client — the payload only carries customer/payment details. Mirrors
    // createLiveCallAction exactly.
    const cartRows = await prisma.cartItem.findMany({
      where: { userId, status: "ACTIVE" },
      include: { package: true },
    });
    if (cartRows.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    const rawSubtotal = cartRows.reduce((sum, row) => sum + row.package.price * row.quantity, 0);

    // Re-validated here regardless of whether DiscountCodeForm already
    // previewed it — never trust a client-claimed discount amount.
    let couponCode: string | null = null;
    let discountAmount = 0;
    if (data.couponCode) {
      const couponResult = await resolveCouponDiscount(
        data.couponCode,
        cartRows.map((row) => ({ packageId: row.packageId, unitPrice: row.package.price, quantity: row.quantity }))
      );
      if (!couponResult.ok) {
        return { success: false, error: couponResult.error };
      }
      couponCode = couponResult.data.couponCode;
      discountAmount = couponResult.data.discountAmount;
    }

    const { subtotal, tax, total } = computeOrderTotal(rawSubtotal - discountAmount);

    const existingWallet = await prisma.customerWallet.findUnique({ where: { userId }, select: { balance: true } });
    const walletApplied = Math.min(data.walletAmountRequested, existingWallet?.balance ?? 0, total);
    const remainder = total - walletApplied;

    await ensureServicePins(userId);

    const orderCityCode = getCityCode(data.city);
    const orderLocalityCode = getAreaCode(data.locality, orderCityCode);

    const baseLiveCallData = {
      customerId: userId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      siteContactName: data.siteContactName ?? null,
      siteContactPhone: data.siteContactPhone ?? null,
      customerEmail: data.customerEmail ?? "",
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      latitude: coords.latitude,
      longitude: coords.longitude,
      locality: data.locality,
      orderCityCode,
      orderLocalityCode,
      scheduledFor: data.scheduledFor,
      subtotal,
      tax,
      total,
      walletAmountApplied: walletApplied,
      couponCode,
      discountAmount,
      items: {
        create: cartRows.map((row) => ({
          packageId: row.packageId,
          packageName: row.package.name,
          unitPrice: row.package.price,
          quantity: row.quantity,
        })),
      },
    };

    if (remainder === 0) {
      // Wallet alone covers it — no Razorpay order, no AWAITING_PAYMENT
      // window, finalized immediately.
      const liveCall = await prisma.$transaction(async (tx) => {
        const debited = await tx.customerWallet.updateMany({
          where: { userId, balance: { gte: walletApplied } },
          data: { balance: { decrement: walletApplied } },
        });
        if (debited.count === 0) throw new Error("WALLET_BALANCE_CHANGED");

        const orderSeq = await nextSequence(`ORDER:${orderCityCode}`, tx);
        const created = await tx.liveCall.create({
          data: { ...baseLiveCallData, orderSeq, paymentMode: "WALLET", paymentStatus: "PAID", status: "BROADCASTING" },
        });

        if (walletApplied > 0) {
          const wallet = await tx.customerWallet.findUniqueOrThrow({ where: { userId }, select: { id: true } });
          await tx.customerWalletTransaction.create({
            data: { walletId: wallet.id, type: "REDEEM", amount: walletApplied, liveCallId: created.id },
          });
        }

        await tx.cartItem.deleteMany({ where: { userId, status: "ACTIVE" } });
        return created;
      });

      revalidatePath("/cart");
      notifyAllAdmins(
        "NEW_LIVE_CALL",
        "New live call",
        `${data.customerName} placed an order in ${data.city} — ₹${total}.`,
        liveCall.id
      );

      return {
        success: true,
        data: {
          liveCallId: liveCall.id,
          ticketNumber: formatTicketNumber(liveCall),
          fullyCoveredByWallet: true,
          razorpayOrderId: null,
          amountPaise: 0,
          currency: "INR",
          keyId: null,
        },
      };
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId) {
      return { success: false, error: "Online payment isn't configured right now — try Cash on Delivery instead" };
    }

    const amountPaise = remainder * 100;
    const order = await createRazorpayOrder({ amountPaise, receipt: randomUUID() });
    if (!order.ok) {
      return { success: false, error: order.error };
    }

    const expiresAt = new Date(Date.now() + LIVE_CALL_EXPIRY_MINUTES * 60 * 1000);

    const liveCall = await prisma.$transaction(async (tx) => {
      if (walletApplied > 0) {
        const debited = await tx.customerWallet.updateMany({
          where: { userId, balance: { gte: walletApplied } },
          data: { balance: { decrement: walletApplied } },
        });
        if (debited.count === 0) throw new Error("WALLET_BALANCE_CHANGED");
      }

      const orderSeq = await nextSequence(`ORDER:${orderCityCode}`, tx);
      const created = await tx.liveCall.create({
        data: {
          ...baseLiveCallData,
          orderSeq,
          paymentMode: "ONLINE",
          paymentStatus: "PENDING",
          razorpayOrderId: order.razorpayOrderId,
          expiresAt,
          status: "AWAITING_PAYMENT",
        },
      });

      if (walletApplied > 0) {
        const wallet = await tx.customerWallet.findUniqueOrThrow({ where: { userId }, select: { id: true } });
        await tx.customerWalletTransaction.create({
          data: { walletId: wallet.id, type: "REDEEM", amount: walletApplied, liveCallId: created.id },
        });
      }

      return created;
    });

    return {
      success: true,
      data: {
        liveCallId: liveCall.id,
        ticketNumber: formatTicketNumber(liveCall),
        fullyCoveredByWallet: false,
        razorpayOrderId: order.razorpayOrderId,
        amountPaise: order.amount,
        currency: order.currency,
        keyId,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.message === "WALLET_BALANCE_CHANGED") {
      return { success: false, error: "Your wallet balance changed — please review your order and try again." };
    }
    console.error("Create Razorpay order error:", err);
    return { success: false, error: "Couldn't start the payment. Please try again." };
  }
}

/**
 * Called by checkout.js's success handler right after the customer pays.
 * This is the fast path — the webhook is the durable backstop for a customer
 * who pays and then closes the tab before this call fires. Whichever of the
 * two lands first wins the conditional claim below; the other is a safe
 * no-op, same idempotency contract as the accept-a-call race elsewhere in
 * this codebase.
 */
export async function verifyRazorpayPaymentAction(input: {
  liveCallId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<ActionResponse<{ liveCallId: string; ticketNumber: string }>> {
  const { userId, error } = await requireCustomerId();
  if (!userId) return { success: false, error: error! };

  const { liveCallId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;
  if (!liveCallId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return { success: false, error: "Missing payment details" };
  }

  const isValid = verifyPaymentSignature({ orderId: razorpayOrderId, paymentId: razorpayPaymentId, signature: razorpaySignature });
  if (!isValid) {
    console.error("Razorpay signature verification failed for order", razorpayOrderId);
    return { success: false, error: "We couldn't verify your payment. If money was deducted, it will be refunded." };
  }

  try {
    const claim = await prisma.liveCall.updateMany({
      where: { id: liveCallId, customerId: userId, razorpayOrderId, status: "AWAITING_PAYMENT" },
      data: { status: "BROADCASTING", paymentStatus: "PAID", razorpayPaymentId },
    });

    // Fetched either way (not just on a fresh claim) — the confirmation
    // screen needs the ticket number regardless of whether this call won
    // the claim or arrived after the webhook already had.
    const liveCall = await prisma.liveCall.findUnique({ where: { id: liveCallId } });

    if (claim.count === 1) {
      // Same transaction shape as createLiveCallAction's cart clear — best
      // done outside a transaction here since the claim above already
      // committed; a failure past this point just leaves stale cart rows,
      // not a duplicate/lost order.
      await prisma.cartItem.deleteMany({ where: { userId, status: "ACTIVE" } });
      revalidatePath("/cart");
      if (liveCall) {
        notifyAllAdmins(
          "NEW_LIVE_CALL",
          "New live call",
          `${liveCall.customerName} placed an order in ${liveCall.city} — ₹${liveCall.total}.`,
          liveCall.id
        );
      }
    }
    // claim.count === 0 means the webhook already confirmed this payment —
    // treated as success, not an error, per the same idempotency contract.

    return {
      success: true,
      data: { liveCallId, ticketNumber: liveCall ? formatTicketNumber(liveCall) : `HZ-${liveCallId.slice(-8).toUpperCase()}` },
    };
  } catch (err) {
    console.error("Verify Razorpay payment error:", err);
    return { success: false, error: "Couldn't confirm your payment. Please contact support if money was deducted." };
  }
}
