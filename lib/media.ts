import "server-only";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MEDIA_TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };

export function mediaDir() {
  const db = process.env.DATABASE_PATH ?? "/data/demo.sqlite";
  const dir = db === ":memory:" ? resolve(".data/uploads") : join(dirname(resolve(db)), "uploads");
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Identify an image by its first bytes rather than trusting the browser's label. */
export function sniffImage(bytes: Uint8Array): string | null {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  if (starts(0xff, 0xd8, 0xff)) return "jpg";
  if (starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (starts(0x47, 0x49, 0x46, 0x38)) return "gif";
  if (starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "webp";
  return null;
}
