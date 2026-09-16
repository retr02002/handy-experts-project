"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/storage/objectStorage";
import type { ActionResponse } from "@/actions/auth.actions";
import type { KycDocumentType } from "@prisma/client";
import { issueTechnicianId } from "@/lib/structuredIds";
import { SERVICEABLE_CITIES, normalizeCityName, type ServiceableCity } from "@/lib/cities";

async function requireVendorId(): Promise<{ vendorId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return { vendorId: null, error: "Not signed in as a vendor" };
  }
  const profile = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { vendorId: null, error: "Vendor profile not found" };
  return { vendorId: profile.id, error: null };
}

async function requireTechnicianId(): Promise<{ technicianId: string | null; error: string | null }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { technicianId: null, error: "Not signed in as a technician" };
  }
  const profile = await prisma.technicianProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return { technicianId: null, error: "Technician profile not found" };
  return { technicianId: profile.id, error: null };
}

export interface KycDocSummary {
  id: string;
  documentType: KycDocumentType;
  label: string | null;
  url: string;
  contentType: string;
  uploadedAt: Date;
}

const DOC_SELECT = {
  id: true,
  documentType: true,
  label: true,
  url: true,
  contentType: true,
  uploadedAt: true,
} as const;

/** Own documents — technician session. */
export async function getMyTechnicianDocumentsAction(): Promise<ActionResponse<KycDocSummary[]>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error ?? "Not authorized" };

  const documents = await prisma.kycDocument.findMany({
    where: { technicianId },
    select: DOC_SELECT,
    orderBy: { uploadedAt: "desc" },
  });
  return { success: true, data: documents };
}

/** Own documents + logo — vendor session. */
export async function getMyVendorDocumentsAction(): Promise<
  ActionResponse<{ documents: KycDocSummary[]; logoUrl: string | null }>
> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error ?? "Not authorized" };

  const [documents, vendor] = await Promise.all([
    prisma.kycDocument.findMany({
      where: { vendorId },
      select: DOC_SELECT,
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.vendorProfile.findUnique({ where: { id: vendorId }, select: { logoUrl: true } }),
  ]);
  return { success: true, data: { documents, logoUrl: vendor?.logoUrl ?? null } };
}

/** Deletes one row and its storage object — owning technician/vendor only. */
export async function deleteKycDocumentAction(documentId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  const document = await prisma.kycDocument.findUnique({
    where: { id: documentId },
    select: { id: true, technicianId: true, vendorId: true, storageKey: true, documentType: true },
  });
  if (!document) return { success: false, error: "Document not found" };

  if (document.technicianId) {
    const { technicianId } = await requireTechnicianId();
    if (technicianId !== document.technicianId) return { success: false, error: "Not authorized" };
  } else if (document.vendorId) {
    const { vendorId } = await requireVendorId();
    if (vendorId !== document.vendorId) return { success: false, error: "Not authorized" };
  } else {
    return { success: false, error: "Not authorized" };
  }

  await deleteObject(document.storageKey).catch(() => {});
  await prisma.kycDocument.delete({ where: { id: documentId } });

  // Avoids leaving User.image pointing at a now-deleted object.
  if (document.technicianId && document.documentType === "PHOTO") {
    await prisma.user.update({ where: { id: session.user.id }, data: { image: null } });
  }

  return { success: true };
}

/** Clears the vendor's logo — vendor-self only. */
export async function deleteVendorLogoAction(): Promise<ActionResponse> {
  const { vendorId, error } = await requireVendorId();
  if (!vendorId) return { success: false, error: error ?? "Not authorized" };

  const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorId }, select: { logoStorageKey: true } });
  if (vendor?.logoStorageKey) {
    await deleteObject(vendor.logoStorageKey).catch(() => {});
  }

  const session = await getServerSession(authOptions);
  await prisma.$transaction([
    prisma.vendorProfile.update({ where: { id: vendorId }, data: { logoUrl: null, logoStorageKey: null } }),
    // Avoids leaving User.image pointing at a now-deleted logo — same
    // reasoning as the technician PHOTO delete path below.
    ...(session?.user?.id ? [prisma.user.update({ where: { id: session.user.id }, data: { image: null } })] : []),
  ]);
  return { success: true };
}

/**
 * Read-only, for the admin/vendor "Documents" tabs on a technician's detail
 * page. SUPER_ADMIN may read any technician's documents; a VENDOR may read
 * documents only for a technician who is their own.
 */
export async function getTechnicianDocumentsForAdminOrVendorAction(
  technicianId: string
): Promise<ActionResponse<KycDocSummary[]>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  if (session.user.role === "SUPER_ADMIN") {
    // allowed
  } else if (session.user.role === "VENDOR") {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    const owns =
      vendor && (await prisma.technicianProfile.findFirst({ where: { id: technicianId, vendorId: vendor.id }, select: { id: true } }));
    if (!owns) return { success: false, error: "Not authorized" };
  } else {
    return { success: false, error: "Not authorized" };
  }

  const documents = await prisma.kycDocument.findMany({
    where: { technicianId },
    select: DOC_SELECT,
    orderBy: { uploadedAt: "desc" },
  });
  return { success: true, data: documents };
}

/** Read-only, for the admin vendor detail page's "Documents" tab. SUPER_ADMIN only. */
export async function getVendorDocumentsForAdminAction(
  vendorId: string
): Promise<ActionResponse<{ documents: KycDocSummary[]; logoUrl: string | null }>> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPER_ADMIN") return { success: false, error: "Not authorized" };

  const [documents, vendor] = await Promise.all([
    prisma.kycDocument.findMany({
      where: { vendorId },
      select: DOC_SELECT,
      orderBy: { uploadedAt: "desc" },
    }),
    prisma.vendorProfile.findUnique({ where: { id: vendorId }, select: { logoUrl: true } }),
  ]);
  return { success: true, data: { documents, logoUrl: vendor?.logoUrl ?? null } };
}

/** Used by the mandatory first-login photo gate. Live DB read, not a cached flag. */
export async function hasTechnicianPhotoAction(): Promise<ActionResponse<{ hasPhoto: boolean }>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error ?? "Not authorized" };

  const photo = await prisma.kycDocument.findFirst({
    where: { technicianId, documentType: "PHOTO" },
    select: { id: true },
  });
  return { success: true, data: { hasPhoto: !!photo } };
}

/**
 * Used by the mandatory first-login city gate. A vendor-managed technician
 * never needs to be asked — the vendor's own city (a free-text field, not
 * constrained to SERVICEABLE_CITIES) is normalized and silently assigned
 * the moment it's known to normalize cleanly, no /select-city visit at all.
 * /select-city is reached only by freelance technicians, or the rare
 * vendor-managed one whose vendor's city text doesn't normalize (e.g. a
 * vendor outside the 5 serviceable cities) — a real gap this action
 * reports honestly rather than silently assigning something wrong.
 */
export async function hasTechnicianCityAction(): Promise<ActionResponse<{ hasCity: boolean }>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error ?? "Not authorized" };

  const profile = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    select: { city: true, vendor: { select: { city: true } } },
  });
  if (!profile) return { success: false, error: "Technician not found" };
  if (profile.city) return { success: true, data: { hasCity: true } };

  const normalizedVendorCity = normalizeCityName(profile.vendor?.city);
  if (normalizedVendorCity) {
    await prisma.$transaction(async (tx) => {
      await issueTechnicianId(tx, technicianId, normalizedVendorCity);
    });
    return { success: true, data: { hasCity: true } };
  }

  return { success: true, data: { hasCity: false } };
}

/** For /select-city's form: pre-fill from the vendor's city when it normalizes to one of SERVICEABLE_CITIES. */
export async function getVendorCityForTechnicianAction(): Promise<ActionResponse<{ vendorCity: string | null }>> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error ?? "Not authorized" };

  const profile = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    select: { vendor: { select: { city: true } } },
  });
  return { success: true, data: { vendorCity: normalizeCityName(profile?.vendor?.city) } };
}

/** /select-city's submit action — one-time, for technicians who predate the city field. */
export async function setTechnicianCityAction(city: string): Promise<ActionResponse> {
  const { technicianId, error } = await requireTechnicianId();
  if (!technicianId) return { success: false, error: error ?? "Not authorized" };

  if (!SERVICEABLE_CITIES.includes(city as ServiceableCity)) {
    return { success: false, error: "Select a valid city" };
  }

  await prisma.$transaction(async (tx) => {
    await issueTechnicianId(tx, technicianId, city as ServiceableCity);
  });

  return { success: true };
}
