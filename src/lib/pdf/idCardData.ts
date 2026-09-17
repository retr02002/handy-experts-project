import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { PLATFORM_IDENTITY } from "@/lib/companyIdentity";
import { formatTechnicianId, formatVendorId } from "@/lib/structuredIds";
import { embedOne, type EmbeddedImage } from "./embedImages";

export const PLATFORM_TAGLINE = "Smart Services. Simplified.";

export interface TechnicianIdCardData {
  technicianId: string;
  platformName: string;
  platformTagline: string;
  platformLogo: EmbeddedImage | null;
  name: string;
  role: string;
  technicianType: "FREELANCE" | "VENDOR_MANAGED";
  photo: EmbeddedImage | null;
  signature: EmbeddedImage | null;
  idNumber: string;
  issuedDate: Date;
  experienceYears: number;
  rating: { avg: number; count: number } | null;
  vendor: {
    name: string;
    idNumber: string;
    logo: EmbeddedImage | null;
  } | null;
}

// Read once per server process, not once per request — this is a static
// public/ asset, not a bucket object, so there's nothing to invalidate.
let cachedPlatformLogo: Promise<EmbeddedImage | null> | null = null;
function getPlatformLogo(): Promise<EmbeddedImage | null> {
  if (!cachedPlatformLogo) {
    cachedPlatformLogo = readFile(path.join(process.cwd(), "public", "favicon", "android-chrome-192x192.png"))
      .then((buffer) => ({ dataUri: `data:image/png;base64,${buffer.toString("base64")}` }))
      .catch(() => null);
  }
  return cachedPlatformLogo;
}

/**
 * One Prisma read shaping everything the ID card needs, called both by the
 * PDF route and by the technician profile page's server component (for the
 * HTML preview) — one function so the two renders can't drift apart.
 *
 * vendor is null for a freelance technician (drives Handyzo-only branding)
 * and {name, idNumber, logo} for a vendor-managed one, with logo possibly
 * null when the vendor hasn't uploaded one — the card falls back to name-only.
 */
export async function buildTechnicianIdCardData(technicianId: string): Promise<TechnicianIdCardData | null> {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    select: {
      type: true,
      skillCategory: true,
      experienceYears: true,
      ratingAvg: true,
      ratingCount: true,
      idCityCode: true,
      idSeq: true,
      user: { select: { name: true } },
      vendor: { select: { id: true, companyName: true, logoUrl: true, logoStorageKey: true, idCityCode: true, idSeq: true } },
    },
  });
  if (!technician) return null;

  const [photoDoc, signatureDoc] = await Promise.all([
    prisma.kycDocument.findFirst({
      where: { technicianId, documentType: "PHOTO" },
      select: { url: true, storageKey: true, contentType: true },
    }),
    prisma.kycDocument.findFirst({
      where: { technicianId, documentType: "SIGNATURE" },
      select: { url: true, storageKey: true, contentType: true },
    }),
  ]);

  const [photo, signature, vendorLogo, platformLogo] = await Promise.all([
    embedOne(photoDoc ?? null),
    embedOne(signatureDoc ?? null),
    technician.vendor?.logoUrl && technician.vendor.logoStorageKey
      ? embedOne({ url: technician.vendor.logoUrl, storageKey: technician.vendor.logoStorageKey })
      : Promise.resolve(null),
    getPlatformLogo(),
  ]);

  const name = technician.user.name ?? "Technician";
  const issuedDate = new Date();

  return {
    technicianId,
    platformName: PLATFORM_IDENTITY.name,
    platformTagline: PLATFORM_TAGLINE,
    platformLogo,
    name,
    role: technician.skillCategory,
    technicianType: technician.type,
    photo,
    signature,
    idNumber: formatTechnicianId(name, technician.idCityCode, technician.idSeq, technicianId),
    issuedDate,
    experienceYears: technician.experienceYears,
    rating: technician.ratingCount > 0 && technician.ratingAvg != null ? { avg: technician.ratingAvg, count: technician.ratingCount } : null,
    vendor: technician.vendor
      ? {
          name: technician.vendor.companyName,
          idNumber: formatVendorId(technician.vendor.companyName, technician.vendor.idCityCode, technician.vendor.idSeq, technician.vendor.id),
          logo: vendorLogo,
        }
      : null,
  };
}
