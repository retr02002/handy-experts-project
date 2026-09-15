import { writeFile, readFile, mkdir, unlink } from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

/**
 * Dev-only fallback so `next dev` works before any bucket credentials
 * exist. Writes under .storage/ at the repo root rather than public/, so
 * files are only reachable through the same /api/files route the bucket
 * uses — keeping dev and production behaviour identical rather than having
 * one silently serve via static hosting.
 *
 * Never selected in production: Vercel's filesystem doesn't persist between
 * invocations, so anything written here would vanish.
 */
const root = () => path.join(process.cwd(), ".storage");

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export const localDiskProvider: StorageProvider = {
  async put(key, body) {
    const full = path.join(root(), key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
  },

  async get(key) {
    const body = await readFile(path.join(root(), key));
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    return { body, contentType: CONTENT_TYPES[ext] ?? "application/octet-stream" };
  },

  async delete(key) {
    await unlink(path.join(root(), key)).catch(() => {});
  },
};
