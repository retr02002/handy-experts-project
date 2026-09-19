/**
 * Who appears as the biller at the top of a generated document.
 *
 * Kept as constants read from env rather than a DB model with an admin CRUD
 * screen: this changes roughly never, and a one-row settings table plus a
 * form to edit it is a lot of surface for a value that gets set once. The
 * env indirection means the real GSTIN/bank details don't sit in the repo.
 */
export interface BillerIdentity {
  name: string;
  addressLines: string[];
  city: string;
  state: string;
  /** GST state code, e.g. "36" for Telangana — decides CGST+SGST vs IGST on the invoice. */
  stateCode: string;
  pincode: string;
  phone: string;
  email: string;
  gstin: string | null;
  pan: string | null;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

function env(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() ? value.trim() : fallback;
}

/**
 * The platform's own identity — biller on the CUSTOMER-facing invoice.
 * Fallbacks are the real business details already shown site-wide
 * (Footer.tsx / ContactInfo.tsx), so the invoice is correct out of the box
 * without needing PLATFORM_* env vars configured on every deploy — an env
 * var still overrides these if ever set. GSTIN/PAN have no real fallback
 * (none provided) and stay null, which JobDocument.tsx already renders as
 * correctly hidden rather than a fabricated blank line.
 */
export const PLATFORM_IDENTITY: BillerIdentity = {
  name: env("PLATFORM_LEGAL_NAME", "Handyzo"),
  addressLines: env("PLATFORM_ADDRESS", "Mf-2, P.S Nagar, Masab Tank, Mehdipatnam").split("|").filter(Boolean),
  city: env("PLATFORM_CITY", "Hyderabad"),
  state: env("PLATFORM_STATE", "Telangana"),
  stateCode: env("PLATFORM_STATE_CODE", "36"),
  pincode: env("PLATFORM_PINCODE", "500028"),
  phone: env("PLATFORM_PHONE", "+91 9866716036"),
  email: env("PLATFORM_EMAIL", "Info@handyzo.com"),
  gstin: process.env.PLATFORM_GSTIN?.trim() || null,
  pan: process.env.PLATFORM_PAN?.trim() || null,
};

export const PLATFORM_BANK: BankDetails | null = process.env.PLATFORM_BANK_ACCOUNT_NUMBER
  ? {
      accountName: env("PLATFORM_BANK_ACCOUNT_NAME", PLATFORM_IDENTITY.name),
      accountNumber: env("PLATFORM_BANK_ACCOUNT_NUMBER", ""),
      ifsc: env("PLATFORM_BANK_IFSC", ""),
      bankName: env("PLATFORM_BANK_NAME", ""),
    }
  : null;

/** Printed in the job-report details grid — the schema has no business-unit concept. */
export const PLATFORM_BUSINESS_UNIT = "Home Services";

/**
 * Fallback SAC (service accounting code) for line items whose package
 * doesn't carry its own. A GST document without one isn't compliant, so
 * this is a floor, not decoration — 998714 is maintenance/repair of
 * household appliances.
 */
export const DEFAULT_SAC_CODE = "998714";

export const INVOICE_TERMS: string[] = [
  "Work carried out as per the scope agreed with the customer.",
  "Warranty, where applicable, covers workmanship only and excludes parts subject to wear.",
  "Any additional parts or work beyond the agreed scope is billed separately.",
];
