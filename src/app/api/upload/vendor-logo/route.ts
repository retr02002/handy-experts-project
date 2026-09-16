import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { putObject, deleteObject, ownerFolderName } from "@/lib/storage/objectStorage";
import { VENDOR_LOGO_MAX_BYTES } from "@/lib/constants";

export const runtime = "nodejs";

// Raster-only, no PDF/SVG — a logo embeds directly into @react-pdf/renderer's
// <Image> for invoices and ID cards, which cannot render SVG and has no
// vector-to-raster conversion step in this project.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "VENDOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    const extension = ALLOWED_IMAGE_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG or WEBP." }, { status: 400 });
    }
    if (file.size > VENDOR_LOGO_MAX_BYTES) {
      return NextResponse.json(
        { error: `That image is too large. Max ${VENDOR_LOGO_MAX_BYTES / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, companyName: true, logoStorageKey: true },
    });
    if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 403 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putObject({
      folder: "docs",
      prefix: `vendor/${ownerFolderName(vendor.companyName, vendor.id)}/logo`,
      extension,
      body: buffer,
      contentType: file.type,
    });

    if (vendor.logoStorageKey) {
      await deleteObject(vendor.logoStorageKey).catch(() => {});
    }

    await prisma.$transaction([
      prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: { logoUrl: stored.url, logoStorageKey: stored.key },
      }),
      // Keeps the navbar avatar (which reads User.image, same as a
      // technician's KYC photo) in sync with the vendor's own logo.
      prisma.user.update({ where: { id: session.user.id }, data: { image: stored.url } }),
    ]);

    return NextResponse.json({ url: stored.url });
  } catch (error) {
    console.error("Vendor logo upload error:", error);
    return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 });
  }
}
