import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { putObject, deleteObject, ownerFolderName } from "@/lib/storage/objectStorage";
import { KYC_DOC_MAX_BYTES } from "@/lib/constants";
import type { KycDocumentType } from "@prisma/client";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const TECHNICIAN_DOC_TYPES = new Set<string>(["AADHAR", "PAN", "PHOTO", "SIGNATURE", "OTHER"]);
const VENDOR_DOC_TYPES = new Set<string>(["GST", "AADHAR", "PAN", "OTHER"]);
// AADHAR/PAN/GST/PHOTO/SIGNATURE are one-per-owner — a re-upload replaces
// the previous row. OTHER is open-ended ("more documentation") and always
// inserts a new row alongside any existing ones.
const SINGLETON_TYPES = new Set<string>(["AADHAR", "PAN", "GST", "PHOTO", "SIGNATURE"]);

const MAX_LABEL_LENGTH = 200;

/**
 * One shared route for both technician and vendor KYC uploads. The only
 * variables are caller identity and documentType, both of which collapse
 * into one auth branch + one enum allowlist — splitting into per-owner
 * routes would just duplicate the MIME/size validation for no gain.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const role = session.user.role;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const documentType = String(formData.get("documentType") ?? "");
    const rawLabel = formData.get("label");
    const label =
      typeof rawLabel === "string" && rawLabel.trim() ? rawLabel.trim().slice(0, MAX_LABEL_LENGTH) : null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WEBP or PDF." }, { status: 400 });
    }
    if (file.size > KYC_DOC_MAX_BYTES) {
      return NextResponse.json(
        { error: `That file is too large. Max ${KYC_DOC_MAX_BYTES / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    let ownerType: "technician" | "vendor";
    let ownerId: string;
    let ownerFolder: string;

    if (role === "TECHNICIAN") {
      if (!TECHNICIAN_DOC_TYPES.has(documentType)) {
        return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
      }
      const technician = await prisma.technicianProfile.findUnique({
        where: { userId },
        select: { id: true, user: { select: { name: true } } },
      });
      if (!technician) return NextResponse.json({ error: "Technician profile not found" }, { status: 403 });
      ownerType = "technician";
      ownerId = technician.id;
      ownerFolder = ownerFolderName(technician.user.name ?? "technician", ownerId);
    } else if (role === "VENDOR") {
      if (!VENDOR_DOC_TYPES.has(documentType)) {
        return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
      }
      const vendor = await prisma.vendorProfile.findUnique({
        where: { userId },
        select: { id: true, companyName: true },
      });
      if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 403 });
      ownerType = "vendor";
      ownerId = vendor.id;
      ownerFolder = ownerFolderName(vendor.companyName, ownerId);
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (documentType === "OTHER" && !label) {
      return NextResponse.json({ error: "Add a short label for this document" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putObject({
      folder: "docs",
      prefix: `${ownerType}/${ownerFolder}`,
      extension,
      body: buffer,
      contentType: file.type,
    });

    const ownerWhere = ownerType === "technician" ? { technicianId: ownerId } : { vendorId: ownerId };

    if (SINGLETON_TYPES.has(documentType)) {
      const existing = await prisma.kycDocument.findFirst({
        where: { ...ownerWhere, documentType: documentType as KycDocumentType },
        select: { id: true, storageKey: true },
      });
      if (existing) {
        await deleteObject(existing.storageKey).catch(() => {});
        await prisma.kycDocument.delete({ where: { id: existing.id } });
      }
    }

    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.kycDocument.create({
        data: {
          documentType: documentType as KycDocumentType,
          ...ownerWhere,
          url: stored.url,
          storageKey: stored.key,
          contentType: file.type,
          sizeBytes: buffer.byteLength,
          label: documentType === "OTHER" ? label : null,
        },
        select: { id: true, documentType: true, url: true, contentType: true, label: true, uploadedAt: true },
      });

      // Keeps the avatar shown everywhere else in the app (User.image) in
      // lockstep with the KYC photo rather than letting them diverge.
      if (ownerType === "technician" && documentType === "PHOTO") {
        await tx.user.update({ where: { id: userId }, data: { image: stored.url } });
      }

      return created;
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("KYC document upload error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
