"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/storage/objectStorage";
import type { ActionResponse } from "@/actions/auth.actions";
import type { PlatformDocumentType } from "@prisma/client";

export interface PlatformDocumentSummary {
  url: string;
  uploadedByName: string;
  uploadedAt: Date;
}

const SELECT = { url: true, uploadedByName: true, uploadedAt: true } as const;

/**
 * Any signed-in user may read this — a vendor needs the template's URL to
 * download and print it, and the file itself is already public via the
 * storage layer (see StorageFolder's "platform" comment), so gating the
 * metadata read would add nothing.
 */
export async function getVendorAgreementTemplateAction(): Promise<ActionResponse<PlatformDocumentSummary | null>> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Not signed in" };

  const doc = await prisma.platformDocument.findUnique({
    where: { type: "VENDOR_AGREEMENT" },
    select: SELECT,
  });
  return { success: true, data: doc ?? null };
}

export async function deletePlatformDocumentAction(type: PlatformDocumentType): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPER_ADMIN") return { success: false, error: "Not authorized" };

  const doc = await prisma.platformDocument.findUnique({ where: { type }, select: { storageKey: true } });
  if (!doc) return { success: true };

  await deleteObject(doc.storageKey).catch(() => {});
  await prisma.platformDocument.delete({ where: { type } });
  return { success: true };
}
