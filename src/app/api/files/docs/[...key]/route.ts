import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getObjectBytes, isSafeKey } from "@/lib/storage/objectStorage";

export const runtime = "nodejs";

/**
 * Authenticated sibling of /api/files/[...key] — everything else in the
 * bucket (job photos, payment screenshots, signatures) is served through
 * that unauthenticated proxy, protected only by an unguessable key. Aadhaar/
 * PAN/GST warrant an actual ownership check rather than security-by-
 * obscurity, so those stay gated here. A technician's PHOTO document and a
 * vendor's logo are different in kind — they're *meant* to be shown broadly
 * (avatars, ID cards, invoices, customer-facing tracking), same as every
 * other public asset in the bucket, so they're served with no session
 * required at all. That distinction matters mechanically too: Next's
 * built-in <Image> optimizer fetches the source image server-side with no
 * browser cookies, so a session-gated URL used as an avatar would always
 * fail to load.
 *
 * Ownership is resolved by looking up the exact storage key in the
 * database (KycDocument.storageKey / VendorProfile.logoStorageKey) rather
 * than parsing anything out of the URL's folder segment — the folder name
 * is purely a human-readable label (see ownerFolderName in
 * objectStorage.ts), not an encoding of the owner id.
 *
 * Next.js resolves the literal "docs" segment ahead of the top-level
 * catch-all, so any URL under /api/files/docs/... lands here instead of the
 * public proxy.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params;

  const [ownerType] = segments;
  if (ownerType !== "technician" && ownerType !== "vendor") {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const fullKey = `docs/${segments.join("/")}`;
  if (!isSafeKey(fullKey)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const resolved = await resolveDocsAsset(ownerType, fullKey);

  if (!resolved.isPublic) {
    if (!resolved.ownerId) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allowed = await isAllowed(session.user.id, session.user.role, ownerType, resolved.ownerId);
    if (!allowed) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
  }

  try {
    const { body, contentType } = await getObjectBytes(fullKey);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": resolved.isPublic ? "public, max-age=31536000, immutable" : "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}

interface ResolvedAsset {
  /** The owning technician/vendor id, or null if no DB row references this key. */
  ownerId: string | null;
  /** PHOTO documents and vendor logos are inherently public — see file-level comment. */
  isPublic: boolean;
}

async function resolveDocsAsset(ownerType: "technician" | "vendor", storageKey: string): Promise<ResolvedAsset> {
  const doc = await prisma.kycDocument.findFirst({
    where: { storageKey },
    select: { documentType: true, technicianId: true, vendorId: true },
  });
  if (doc) {
    return {
      ownerId: ownerType === "technician" ? doc.technicianId : doc.vendorId,
      isPublic: doc.documentType === "PHOTO",
    };
  }
  if (ownerType === "vendor") {
    const vendor = await prisma.vendorProfile.findFirst({ where: { logoStorageKey: storageKey }, select: { id: true } });
    if (vendor) return { ownerId: vendor.id, isPublic: true };
  }
  return { ownerId: null, isPublic: false };
}

async function isAllowed(
  userId: string,
  role: string | null | undefined,
  ownerType: "technician" | "vendor",
  ownerId: string
): Promise<boolean> {
  if (role === "SUPER_ADMIN") return true;

  if (ownerType === "vendor") {
    if (role !== "VENDOR") return false;
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId }, select: { id: true } });
    return vendor?.id === ownerId;
  }

  // ownerType === "technician"
  if (role === "TECHNICIAN") {
    const technician = await prisma.technicianProfile.findUnique({ where: { userId }, select: { id: true } });
    return technician?.id === ownerId;
  }
  if (role === "VENDOR") {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!vendor) return false;
    const technician = await prisma.technicianProfile.findFirst({
      where: { id: ownerId, vendorId: vendor.id },
      select: { id: true },
    });
    return !!technician;
  }
  return false;
}
