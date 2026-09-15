import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { putObject } from "@/lib/storage/objectStorage";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
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
      return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WEBP, or GIF." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: `File too large. Max size is ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putObject({
      folder: "payments",
      extension,
      body: buffer,
      contentType: file.type,
    });

    return NextResponse.json({ url: stored.url, key: stored.key });
  } catch (error) {
    console.error("Payment screenshot upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
