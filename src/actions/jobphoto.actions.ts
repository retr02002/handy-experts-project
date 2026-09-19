"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResponse } from "@/actions/auth.actions";
import { deleteObject } from "@/lib/storage/objectStorage";

export interface JobPhotoItem {
  id: string;
  phase: "BEFORE" | "AFTER";
  url: string;
  uploadedAt: string;
}

/**
 * Everyone with a legitimate stake in the job can see its photos: the
 * assigned technician (who took them), the owning vendor, the customer
 * whose property they show, and admin. Photos are evidence of work done —
 * unlike the customer's contact details, they stay visible to the
 * technician after completion.
 */
async function canViewJob(serviceCallId: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return false;
  if (session.user.role === "SUPER_ADMIN") return true;

  const call = await prisma.serviceCall.findUnique({
    where: { id: serviceCallId },
    select: {
      customerId: true,
      vendor: { select: { userId: true } },
      technician: { select: { userId: true } },
    },
  });
  if (!call) return false;

  return (
    call.customerId === session.user.id ||
    call.vendor?.userId === session.user.id ||
    call.technician?.userId === session.user.id
  );
}

export async function getJobPhotosAction(serviceCallId: string): Promise<ActionResponse<JobPhotoItem[]>> {
  if (!(await canViewJob(serviceCallId))) return { success: false, error: "Not authorized" };

  try {
    const rows = await prisma.jobPhoto.findMany({
      where: { serviceCallId },
      orderBy: { uploadedAt: "asc" },
      select: { id: true, phase: true, url: true, uploadedAt: true },
    });
    return {
      success: true,
      data: rows.map((r) => ({ id: r.id, phase: r.phase, url: r.url, uploadedAt: r.uploadedAt.toISOString() })),
    };
  } catch (err) {
    console.error("Get job photos error:", err);
    return { success: false, error: "Failed to load photos" };
  }
}

/**
 * Only the technician who took a photo can remove it, and only while the
 * job is still open — once it's completed these are the record of what was
 * done, and deleting them would let a disputed job be quietly rewritten.
 */
export async function deleteJobPhotoAction(photoId: string): Promise<ActionResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "TECHNICIAN") {
    return { success: false, error: "Not authorized" };
  }

  try {
    const photo = await prisma.jobPhoto.findUnique({
      where: { id: photoId },
      select: {
        storageKey: true,
        serviceCall: { select: { status: true, technician: { select: { userId: true } } } },
      },
    });
    if (!photo || photo.serviceCall.technician?.userId !== session.user.id) {
      return { success: false, error: "Photo not found" };
    }
    if (photo.serviceCall.status === "COMPLETED" || photo.serviceCall.status === "CANCELLED") {
      return { success: false, error: "Photos can't be removed once the job is closed." };
    }

    await prisma.jobPhoto.delete({ where: { id: photoId } });
    // Best-effort: an orphaned object costs pennies, a failed delete that
    // rolls back the row would leave a photo the technician can't remove.
    await deleteObject(photo.storageKey).catch(() => {});
    return { success: true };
  } catch (err) {
    console.error("Delete job photo error:", err);
    return { success: false, error: "Failed to remove photo" };
  }
}

export interface JobSignatureItem {
  url: string;
  signerName: string;
  signedAt: string;
}

export async function getJobSignatureAction(
  serviceCallId: string
): Promise<ActionResponse<JobSignatureItem | null>> {
  if (!(await canViewJob(serviceCallId))) return { success: false, error: "Not authorized" };

  try {
    const row = await prisma.jobSignature.findUnique({
      where: { serviceCallId },
      select: { url: true, signerName: true, signedAt: true },
    });
    return {
      success: true,
      data: row ? { url: row.url, signerName: row.signerName, signedAt: row.signedAt.toISOString() } : null,
    };
  } catch (err) {
    console.error("Get job signature error:", err);
    return { success: false, error: "Failed to load signature" };
  }
}
