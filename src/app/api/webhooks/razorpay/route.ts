import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { notifyAllAdmins } from "@/actions/notification.actions";

// The one unauthenticated endpoint in this codebase, and the only reason a
// Route Handler exists for this feature at all — Razorpay is the caller, not
// a signed-in browser, so there's no NextAuth session to check. The webhook
// signature is the entire trust boundary here: it's verified against the RAW
// request body before the payload is even parsed, let alone trusted.
//
// This is the durable confirmation path — verifyRazorpayPaymentAction (the
// client-return call in payment.actions.ts) is the fast path for the common
// case, but a customer who pays and then closes the tab never calls it. This
// webhook is what still confirms that payment. Idempotent against Razorpay's
// at-least-once delivery via the same conditional-update claim used
// everywhere else in this codebase for race-safety.

interface RazorpayWebhookPayload {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
      };
    };
  };
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature({ rawBody, signature })) {
    console.error("Razorpay webhook: invalid or missing signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let body: RazorpayWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const entity = body.payload?.payment?.entity;
  const razorpayOrderId = entity?.order_id;
  const razorpayPaymentId = entity?.id;

  try {
    if (body.event === "payment.captured" && razorpayOrderId && razorpayPaymentId) {
      const claim = await prisma.liveCall.updateMany({
        where: { razorpayOrderId, status: "AWAITING_PAYMENT" },
        data: { status: "BROADCASTING", paymentStatus: "PAID", razorpayPaymentId },
      });

      if (claim.count === 1) {
        const liveCall = await prisma.liveCall.findUnique({ where: { razorpayOrderId } });
        if (liveCall) {
          await prisma.cartItem.deleteMany({ where: { userId: liveCall.customerId, status: "ACTIVE" } });
          notifyAllAdmins(
            "NEW_LIVE_CALL",
            "New live call",
            `${liveCall.customerName} placed an order in ${liveCall.city} — ₹${liveCall.total}.`,
            liveCall.id
          );
        }
      } else {
        // count === 0: either this checkout order was already confirmed by
        // verifyRazorpayPaymentAction (safe no-op), or razorpayOrderId
        // doesn't belong to a LiveCall at all — check whether it's a
        // vendor-wallet top-up instead. Razorpay doesn't care what an order
        // was for, only that the signature is valid, so one webhook covers
        // both purposes.
        const liveCallExists = await prisma.liveCall.findUnique({
          where: { razorpayOrderId },
          select: { id: true },
        });
        if (!liveCallExists) {
          const walletTx = await prisma.vendorWalletTransaction.findUnique({
            where: { razorpayOrderId },
            select: { id: true, walletId: true, amount: true },
          });
          if (walletTx) {
            await prisma.$transaction(async (tx) => {
              const walletClaim = await tx.vendorWalletTransaction.updateMany({
                where: { id: walletTx.id, status: "PENDING" },
                data: { status: "COMPLETED", razorpayPaymentId },
              });
              if (walletClaim.count === 1) {
                await tx.vendorWallet.update({
                  where: { id: walletTx.walletId },
                  data: { balance: { increment: walletTx.amount } },
                });
              }
              // count === 0 means verifyWalletTopupAction already confirmed
              // this deposit — a safe no-op.
            });
          }
        }
      }
    } else if (body.event === "payment.failed" && razorpayOrderId) {
      // Left in AWAITING_PAYMENT rather than a terminal state — it just
      // expires via the existing sweep, no separate cancel path needed.
      const liveCallClaim = await prisma.liveCall.updateMany({
        where: { razorpayOrderId, status: "AWAITING_PAYMENT" },
        data: { paymentStatus: "FAILED" },
      });
      if (liveCallClaim.count === 0) {
        await prisma.vendorWalletTransaction.updateMany({
          where: { razorpayOrderId, status: "PENDING" },
          data: { status: "FAILED" },
        });
      }
    }
  } catch (err) {
    console.error("Razorpay webhook processing error:", err);
    // Still acknowledge with 200 below — Razorpay would otherwise retry a
    // signature-valid event indefinitely for what's likely a transient DB
    // issue on our side, not something a retry from Razorpay can fix.
  }

  return NextResponse.json({ ok: true });
}
