import { NextResponse } from "next/server";
import { getObjectBytes, isSafeKey } from "@/lib/storage/objectStorage";

export const runtime = "nodejs";

/**
 * Serves anything in the bucket back through our own origin.
 *
 * Why proxy rather than hand out the provider's own URLs: the URL we store
 * in the database outlives whichever bucket we're on, so migrating
 * providers later never orphans an image; it works whether the bucket is
 * public-read or private; and it doesn't leak the endpoint or bucket name
 * into markup. The cost is a function invocation per cold image, which the
 * immutable cache header below removes for every subsequent request —
 * keys embed a timestamp and uuid, so a key's bytes never change.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params;
  const key = segments.join("/");

  if (!isSafeKey(key)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    const { body, contentType } = await getObjectBytes(key);
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
