import type { Prisma } from "@prisma/client";
import { nextSequence } from "@/lib/sequenceCounter";
import { getCityCode, type ServiceableCity } from "@/lib/locationCodes";

export const COMPANY_CODE = "HANDYZO";

/** First word of a name/company, alnum-only, uppercased, capped — "Deepak Kumar" -> "DEEPAK". */
function nameCode(name: string): string {
  const firstWord = name.trim().split(/\s+/)[0] ?? "";
  const letters = firstWord.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return (letters || "USER").slice(0, 12);
}

export function formatTechnicianId(name: string, idCityCode: string | null, idSeq: number | null, technicianId: string): string {
  if (!idCityCode || idSeq == null) return `HZ-${technicianId.slice(-8).toUpperCase()}`;
  return `${nameCode(name)}${idCityCode}${idSeq}`;
}

export function formatVendorId(companyName: string, idCityCode: string | null, idSeq: number | null, vendorId: string): string {
  if (!idCityCode || idSeq == null) return `HZ-${vendorId.slice(-8).toUpperCase()}`;
  return `${nameCode(companyName)}${idCityCode}${idSeq}`;
}

export interface IssuedIdParts {
  idCityCode: string;
  idSeq: number;
}

/**
 * Idempotent — guarded by `idSeq: null` so a double-submit (e.g. a technician
 * retrying /select-city) never burns two sequence numbers on the same
 * technician; the second call matches zero rows and its reserved number is
 * simply skipped (an accepted gap, same as elsewhere in this scheme).
 * Returns the assigned parts so a caller (e.g. a post-creation credentials
 * screen) can format the new ID immediately without a follow-up read.
 */
export async function issueTechnicianId(
  tx: Prisma.TransactionClient,
  technicianId: string,
  city: ServiceableCity
): Promise<IssuedIdParts> {
  const idCityCode = getCityCode(city);
  const idSeq = await nextSequence(`TECHNICIAN:${idCityCode}`, tx);
  await tx.technicianProfile.updateMany({
    where: { id: technicianId, idSeq: null },
    data: { city, idCityCode, idSeq },
  });
  return { idCityCode, idSeq };
}

/** Same idempotent shape as issueTechnicianId — also reused by the one-time vendor backfill script. */
export async function issueVendorId(tx: Prisma.TransactionClient, vendorId: string, city: string): Promise<IssuedIdParts> {
  const idCityCode = getCityCode(city);
  const idSeq = await nextSequence(`VENDOR:${idCityCode}`, tx);
  await tx.vendorProfile.updateMany({
    where: { id: vendorId, idSeq: null },
    data: { idCityCode, idSeq },
  });
  return { idCityCode, idSeq };
}
