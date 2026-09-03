// Thin wrapper around ApiTxt's messaging API (confirmed against their
// Developer Hub docs at apitxt.com/developer/otp-api). We generate and
// verify OTP codes ourselves (see src/actions/otp.actions.ts) — ApiTxt's job
// here is purely delivery.
//
// Confirmed response shape (live-tested): success is
// {status:"success", message, data:{request_id, mobile, ...}}; failure is
// {status:"error", message, code} with a non-2xx HTTP status.
//
// `country` (e.g. "91" for India, no "+") defaults to 91 on their side for
// SMS, but is effectively REQUIRED for channel=whatsapp — omitting it fails
// with "Missing parameter: country" even though their docs mark it
// optional. Always sent here to avoid that trap.

const APITXT_SEND_URL = "https://apitxt.com/api/sendOTP";
const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_COUNTRY_CODE = "91";

export type OtpChannel = "SMS" | "WHATSAPP";

function isWhatsAppEnabled(): boolean {
  return process.env.APITXT_WHATSAPP_ENABLED === "true";
}

async function postToApitxt(body: Record<string, string>): Promise<{ ok: true } | { ok: false; error: string }> {
  const authkey = process.env.APITXT_AUTH_KEY;
  if (!authkey) {
    console.error("ApiTxt send skipped: APITXT_AUTH_KEY is not set");
    return { ok: false, error: "SMS/WhatsApp delivery isn't configured" };
  }

  const params = new URLSearchParams({
    authkey,
    country: process.env.APITXT_COUNTRY_CODE || DEFAULT_COUNTRY_CODE,
    ...body,
  });
  // SMS-only template override, and WhatsApp-only template/project
  // selectors — all optional per their docs; the account's default OTP
  // config is used when omitted (confirmed working that way in testing).
  for (const [envKey, paramKey] of [
    ["APITXT_SMS_TEMPLATE_ID", "template_id"],
    ["APITXT_WHATSAPP_TEMPLATE_NAME", "template_name"],
    ["APITXT_WHATSAPP_PROJECT_REF_ID", "project_ref_id"],
  ] as const) {
    const value = process.env[envKey];
    if (value) params.set(paramKey, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(APITXT_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("ApiTxt send failed:", res.status, text.slice(0, 500));
      // Confirmed response shape: {status:"error", message, code}. Surface
      // their message when present (e.g. their own rate-limit text) since
      // it's more useful than a generic fallback.
      let apitxtMessage: string | undefined;
      try {
        apitxtMessage = JSON.parse(text)?.message;
      } catch {
        // non-JSON body — ignore, fall through to generic error
      }
      return { ok: false, error: apitxtMessage || "Couldn't send the message — please try again" };
    }

    return { ok: true };
  } catch (err) {
    console.error("ApiTxt send error:", err);
    return { ok: false, error: "Couldn't send the message — please try again" };
  } finally {
    clearTimeout(timeout);
  }
}

/** Delivers a code we've already generated/hashed — never generates or verifies anything itself. */
export async function sendOtpMessage({
  phone,
  code,
  channel,
}: {
  phone: string;
  code: string;
  channel: OtpChannel;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (channel === "WHATSAPP" && !isWhatsAppEnabled()) {
    return { ok: false, error: "WhatsApp isn't available right now — try SMS instead" };
  }

  return postToApitxt({
    mobile: phone,
    otp: code,
    channel: channel === "WHATSAPP" ? "whatsapp" : "sms",
  });
}

/**
 * Free-text delivery (e.g. a vendor-created technician's username + temp
 * password) — separate from sendOtpMessage since it's not an OTP code.
 * Unconfirmed whether this account's ApiTxt setup allows free-text sends vs.
 * being template-locked; callers must treat this as best-effort.
 */
export async function sendTextMessage({
  phone,
  channel,
  message,
}: {
  phone: string;
  channel: OtpChannel;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (channel === "WHATSAPP" && !isWhatsAppEnabled()) {
    return { ok: false, error: "WhatsApp isn't available right now" };
  }

  return postToApitxt({
    mobile: phone,
    message,
    channel: channel === "WHATSAPP" ? "whatsapp" : "sms",
  });
}

export { isWhatsAppEnabled };
