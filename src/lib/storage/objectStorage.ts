import crypto from "crypto";
import { s3Provider } from "./provider.s3";
import { localDiskProvider } from "./provider.localDisk";
import type { StorageFolder, StoredObject, StorageProvider } from "./types";

export type { StorageFolder, StoredObject } from "./types";

/**
 * The only storage module the rest of the app imports. Swapping bucket
 * providers means editing provider.*.ts and this one switch — no call site
 * changes, and no stored URL in the database ever becomes wrong, because
 * the URLs we persist point at our own /api/files route rather than at any
 * provider's hostname.
 */
function provider(): StorageProvider {
  // Falls back to disk only when the bucket genuinely isn't configured, so
  // a local checkout works before credentials are set without anyone
  // having to flip a flag.
  return process.env.S3_ENDPOINT ? s3Provider : localDiskProvider;
}

/** Stable, provider-independent URL for a stored object. */
export function publicUrl(key: string): string {
  return `/api/files/${key}`;
}

/** Inverse of publicUrl, for the file-serving route and for deletes driven off a stored URL. */
export function storageKeyFromUrl(url: string): string | null {
  if (!url.startsWith("/api/files/")) return null;
  const key = url.slice("/api/files/".length);
  return isSafeKey(key) ? key : null;
}

/** Pre-bucket URLs written when uploads went to public/uploads on local disk. */
export function isLegacyLocalUrl(url: string): boolean {
  return url.startsWith("/uploads/");
}

/**
 * Keys come from our own code, but the file-serving route takes one from
 * the URL — so anything that could climb out of the bucket prefix or hit an
 * absolute path gets rejected before it reaches the provider.
 */
export function isSafeKey(key: string): boolean {
  if (!key || key.length > 512) return false;
  if (key.startsWith("/") || key.includes("..") || key.includes("\\")) return false;
  return /^[A-Za-z0-9/._-]+$/.test(key);
}

/**
 * Human-browsable bucket folder for a technician/vendor — a slugified name
 * with a short id suffix only to disambiguate two people who share a name,
 * e.g. "mohammed-razzaq-70nk" instead of the bare 25-character id. The
 * file-serving route (/api/files/docs/[...key]) never parses this string
 * back apart — it resolves the real owner by looking up the exact storage
 * key in the database instead — so this suffix only has to be short and
 * visually distinct, not machine-decodable.
 */
export function ownerFolderName(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const shortId = id.slice(-6);
  return slug ? `${slug}-${shortId}` : id;
}

export async function putObject(input: {
  folder: StorageFolder;
  extension: string;
  body: Buffer;
  contentType: string;
  /** Optional sub-path within the folder, e.g. `${serviceCallId}/before`. */
  prefix?: string;
}): Promise<StoredObject> {
  const segment = input.prefix ? `${input.prefix.replace(/^\/+|\/+$/g, "")}/` : "";
  const key = `${input.folder}/${segment}${Date.now()}-${crypto.randomUUID()}.${input.extension}`;
  if (!isSafeKey(key)) throw new Error("Refusing to write an unsafe storage key");
  await provider().put(key, input.body, input.contentType);
  return { key, url: publicUrl(key) };
}

/** Server-side read — used by the file route and by PDF image embedding (no HTTP round trip, no ACL dependency). */
export async function getObjectBytes(key: string): Promise<{ body: Buffer; contentType: string }> {
  if (!isSafeKey(key)) throw new Error("Unsafe storage key");
  return provider().get(key);
}

export async function deleteObject(key: string): Promise<void> {
  if (!isSafeKey(key)) return;
  await provider().delete(key);
}
