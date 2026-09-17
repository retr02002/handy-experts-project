import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { putObject, deleteObject } from "@/lib/storage/objectStorage";
import { PLATFORM_DOCUMENT_MAX_BYTES } from "@/lib/constants";
import type { PlatformDocumentType } from "@prisma/client";

export const runtime = "nodejs";

// A formal document meant to be printed and hand-signed — PDF only, no
// photo/image upload here (that's the vendor's own signed-copy path,
// via /api/upload/kyc-document with documentType AGREEMENT instead).
const ALLOWED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
};

const PLATFORM_DOCUMENT_TYPES = new Set<string>(["VENDOR_AGREEMENT"]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const type = String(formData.get("type") ?? "");

    if (!PLATFORM_DOCUMENT_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Unsupported file type. Use PDF." }, { status: 400 });
    }
    if (file.size > PLATFORM_DOCUMENT_MAX_BYTES) {
      return NextResponse.json(
        { error: `That file is too large. Max ${PLATFORM_DOCUMENT_MAX_BYTES / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putObject({
      folder: "platform",
      prefix: type.toLowerCase().replace(/_/g, "-"),
      extension,
      body: buffer,
      contentType: file.type,
    });

    const existing = await prisma.platformDocument.findUnique({
      where: { type: type as PlatformDocumentType },
      select: { storageKey: true },
    });

    const document = await prisma.platformDocument.upsert({
      where: { type: type as PlatformDocumentType },
      create: {
        type: type as PlatformDocumentType,
        url: stored.url,
        storageKey: stored.key,
        contentType: file.type,
        sizeBytes: buffer.byteLength,
        uploadedByName: session.user.name || "Admin",
      },
      update: {
        url: stored.url,
        storageKey: stored.key,
        contentType: file.type,
        sizeBytes: buffer.byteLength,
        uploadedByName: session.user.name || "Admin",
        uploadedAt: new Date(),
      },
      select: { url: true, uploadedAt: true, uploadedByName: true },
    });

    if (existing?.storageKey && existing.storageKey !== stored.key) {
      await deleteObject(existing.storageKey).catch(() => {});
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("Platform document upload error:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
