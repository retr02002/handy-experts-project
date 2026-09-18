// Thin wrapper around Razorpay's Orders API and the HMAC signature checks it
// requires — no SDK dependency, same reasoning as apitxt.ts: this is two REST
// calls and a crypto check, not enough surface to justify a dependency.
//
// Order creation: https://razorpay.com/docs/api/orders/create
// Payment verification: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/#step-5-verify-payment-signature
// Webhook verification: https://razorpay.com/docs/webhooks/validate-test

import crypto from "crypto";

const RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders";
const RAZORPAY_PAYMENTS_URL = "https://api.razorpay.com/v1/payments";
const REQUEST_TIMEOUT_MS = 10_000;

function getCredentials(): { keyId: string; keySecret: string } | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

/**
 * Creates a Razorpay order for the given amount (in paise — the caller is
 * responsible for converting from rupees, never trust a client-sent amount).
 * Never throws — returns a discriminated result, same shape as apitxt.ts.
 */
export async function createRazorpayOrder({
  amountPaise,
  receipt,
}: {
  amountPaise: number;
  receipt: string;
}): Promise<
  { ok: true; razorpayOrderId: string; amount: number; currency: string } | { ok: false; error: string }
> {
  const creds = getCredentials();
  if (!creds) {
    console.error("Razorpay order creation skipped: RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET are not set");
    return { ok: false, error: "Online payment isn't configured right now" };
  }
  if (!Number.isInteger(amountPaise) || amountPaise < 100) {
    return { ok: false, error: "Order amount is too small to process" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(RAZORPAY_ORDERS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
      signal: controller.signal,
    });

    const text = await res.text().catch(() => "");

    let parsed: { id?: string; amount?: number; currency?: string; error?: { description?: string } } | undefined;
    try {
      parsed = JSON.parse(text);
    } catch {
      // non-JSON body — fall through to the res.ok check below
    }

    if (!res.ok || !parsed?.id) {
      console.error("Razorpay order creation failed:", res.status, text.slice(0, 500));
      return { ok: false, error: parsed?.error?.description || "Couldn't start the payment — please try again" };
    }

    return { ok: true, razorpayOrderId: parsed.id, amount: parsed.amount ?? amountPaise, currency: parsed.currency ?? "INR" };
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    return { ok: false, error: "Couldn't start the payment — please try again" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRazorpayPayment(paymentId: string): Promise<{ ok: true; amount: number; status: string; currency: string } | { ok: false; error: string }> {
  const creds = getCredentials();
  if (!creds) return { ok: false, error: "Online payment isn't configured right now" };

  try {
    const res = await fetch(`${RAZORPAY_PAYMENTS_URL}/${paymentId}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64")}`,
      },
    });

    const parsed = await res.json().catch(() => ({}));

    if (!res.ok || !parsed?.id) {
      return { ok: false, error: parsed?.error?.description || "Failed to fetch payment details" };
    }

    return { ok: true, amount: parsed.amount, status: parsed.status, currency: parsed.currency };
  } catch (err) {
    return { ok: false, error: "Couldn't fetch payment details" };
  }
}

/**
 * Verifies the signature Razorpay's checkout.js hands back to the browser
 * after a successful payment: HMAC-SHA256(orderId + "|" + paymentId, keySecret).
 * Uses a constant-time compare — a plain === here would leak timing
 * information about how many leading bytes of the signature matched.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const creds = getCredentials();
  if (!creds) return false;

  const expected = crypto.createHmac("sha256", creds.keySecret).update(`${orderId}|${paymentId}`).digest("hex");

  return timingSafeEqualHex(expected, signature);
}

/**
 * Verifies a webhook call is genuinely from Razorpay: HMAC-SHA256 of the raw
 * request body against RAZORPAY_WEBHOOK_SECRET (a separate secret from the
 * API key, generated when the webhook is created in the dashboard). Must be
 * checked against the raw body bytes, not a re-JSON.stringify'd copy of the
 * parsed payload — a re-serialized copy can differ in key order/whitespace
 * and the signature won't match.
 */
export function verifyWebhookSignature({ rawBody, signature }: { rawBody: string; signature: string }): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Razorpay webhook verification skipped: RAZORPAY_WEBHOOK_SECRET is not set");
    return false;
  }

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(expectedHex: string, actualHex: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex, "hex");
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
