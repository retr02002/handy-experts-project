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

const ALLOWED_VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = file.type in ALLOWED_VIDEO_TYPES;
    const extension = ALLOWED_IMAGE_TYPES[file.type] || ALLOWED_VIDEO_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WEBP, GIF, MP4, WEBM, or MOV." }, { status: 400 });
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max size is ${maxSize / (1024 * 1024)}MB.` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await putObject({
      folder: "services",
      prefix: isVideo ? "videos" : "images",
      extension,
      body: buffer,
      contentType: file.type,
    });

    return NextResponse.json({ url: stored.url, key: stored.key });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
