import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { StorageProvider } from "./types";

/**
 * Talks the S3 wire protocol to whatever endpoint S3_ENDPOINT points at —
 * here, the project's Prisma bucket. Nothing in this file is specific to
 * Amazon; S3 is just the protocol most object stores implement.
 *
 * forcePathStyle is on because non-AWS S3 endpoints almost universally
 * address buckets as `{endpoint}/{bucket}/{key}` rather than the
 * virtual-host style (`{bucket}.{endpoint}/{key}`) AWS itself prefers.
 */
let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 storage is not configured (S3_ENDPOINT / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY)");
  }
  client = new S3Client({
    endpoint,
    // S3-compatible providers generally ignore the region but the protocol
    // requires one to sign with, so "auto" is the conventional placeholder.
    region: process.env.S3_REGION || "auto",
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
  return client;
}

function bucket(): string {
  const name = process.env.S3_BUCKET;
  if (!name) throw new Error("S3 storage is not configured (S3_BUCKET)");
  return name;
}

export const s3Provider: StorageProvider = {
  async put(key, body, contentType) {
    await getClient().send(
      new PutObjectCommand({
        Bucket: bucket(),
        Key: key,
        Body: body,
        ContentType: contentType,
        // Keys embed a timestamp + uuid, so a given key's bytes never
        // change — safe to let browsers and the CDN hold them forever.
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
  },

  async get(key) {
    const res = await getClient().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    if (!res.Body) throw new Error(`Object not found: ${key}`);
    const bytes = await res.Body.transformToByteArray();
    return { body: Buffer.from(bytes), contentType: res.ContentType || "application/octet-stream" };
  },

  async delete(key) {
    await getClient().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
  },
};
