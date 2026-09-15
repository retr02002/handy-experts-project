import { getObjectBytes, isLegacyLocalUrl } from "@/lib/storage/objectStorage";
import { PDF_MAX_EMBEDDED_PHOTOS } from "@/lib/constants";

export interface EmbeddedImage {
  /** data: URI — react-pdf's <Image> takes these directly, no network fetch during render. */
  dataUri: string;
}

interface PhotoLike {
  storageKey: string;
  url: string;
  contentType?: string;
}

/**
 * Turns stored photos into inline data URIs for the PDF.
 *
 * Reads from the bucket directly rather than fetching its own public URL:
 * no HTTP round trip, no dependency on the bucket being public, and no
 * chance of a signed URL expiring mid-render.
 *
 * Every failure is absorbed — one unreadable photo must never turn a
 * customer's invoice into a 500. Legacy /uploads/... rows (written before
 * the bucket existed, pointing at files that no longer exist) are skipped
 * outright rather than retried.
 */
export async function embedPhotos(photos: PhotoLike[]): Promise<EmbeddedImage[]> {
  const usable = photos.filter((p) => !isLegacyLocalUrl(p.url)).slice(0, PDF_MAX_EMBEDDED_PHOTOS);

  const results = await Promise.allSettled(
    usable.map(async (p) => {
      const { body, contentType } = await getObjectBytes(p.storageKey);
      return { dataUri: `data:${p.contentType || contentType};base64,${body.toString("base64")}` };
    })
  );

  return results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
}

/** Single-image variant for the signature. Returns null rather than throwing. */
export async function embedOne(photo: PhotoLike | null): Promise<EmbeddedImage | null> {
  if (!photo || isLegacyLocalUrl(photo.url)) return null;
  try {
    const { body, contentType } = await getObjectBytes(photo.storageKey);
    return { dataUri: `data:${photo.contentType || contentType};base64,${body.toString("base64")}` };
  } catch {
    return null;
  }
}
