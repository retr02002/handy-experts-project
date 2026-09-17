/**
 * Logical top-level folders inside the bucket. Keys are prefixed with these.
 * "platform" is for admin-managed global files (e.g. the vendor agreement
 * template) — deliberately not under "docs", since anything under docs/ is
 * routed to the authenticated file-serving proxy, and a blank template has
 * nothing sensitive in it; every vendor needs to fetch it to print.
 */
export type StorageFolder = "services" | "job" | "payments" | "docs" | "platform";

export interface StorageProvider {
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<{ body: Buffer; contentType: string }>;
  delete(key: string): Promise<void>;
}

export interface StoredObject {
  /** Provider-side path, e.g. "job/abc123/before/1736-uuid.jpg". Persist this. */
  key: string;
  /** What the app renders/links. Provider-independent by design — see objectStorage.publicUrl. */
  url: string;
}
