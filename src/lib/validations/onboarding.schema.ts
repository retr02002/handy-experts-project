import { z } from "zod";

export const COMPANY_TYPES = [
  "Private Limited",
  "Public Limited",
  "Partnership",
  "LLP",
  "Proprietorship",
  "Other",
] as const;

export const SKILL_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "AC & Appliance Repair",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Pest Control",
  "General Handyman",
] as const;

const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters").max(100);
const phoneSchema = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
const aadhaarSchema = z.string().trim().regex(/^\d{12}$/, "Enter a valid 12-digit Aadhaar number");
const pincodeSchema = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode");
const citySchema = z.string().trim().min(2, "Enter a valid city").max(100);
const stateSchema = z.string().trim().min(2, "Enter a valid state").max(100);

export const customerOnboardingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
});
export type CustomerOnboardingInput = z.infer<typeof customerOnboardingSchema>;

export const vendorOnboardingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  companyName: z.string().trim().min(2, "Company name is required").max(150),
  companyType: z.enum(COMPANY_TYPES),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Enter a valid 15-character GST number"),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter a valid 10-character PAN number"),
  aadhaarNumber: aadhaarSchema,
  address: z.string().trim().min(5, "Please enter your street address").max(500),
  city: citySchema,
  state: stateSchema,
  pincode: pincodeSchema,
  // Captured from "use current location" — optional because a vendor may
  // type their address manually instead; they can set it later from their
  // profile page (needed for nearby-vendor live-call matching).
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  incorporationDate: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid incorporation date"),
});
export type VendorOnboardingInput = z.infer<typeof vendorOnboardingSchema>;

export const technicianOnboardingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  skillCategory: z.enum(SKILL_CATEGORIES),
  experienceYears: z.coerce.number().int().min(0, "Can't be negative").max(60),
  aadhaarNumber: aadhaarSchema,
  servicePincode: pincodeSchema,
});
export type TechnicianOnboardingInput = z.infer<typeof technicianOnboardingSchema>;
