import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { isAdmin } from "@/lib/auth";
import { json, sameOriginOr403 } from "@/lib/http";
import { MAX_UPLOAD_BYTES, mediaDir, sniffImage } from "@/lib/media";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = sameOriginOr403(request);
  if (blocked) return blocked;
  if (!(await isAdmin())) return json({ error: "Admin sign-in required" }, 401);
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES + 64 * 1024) return json({ error: "Photos must be 10 MB or smaller." }, 413);
  let file: FormDataEntryValue | null;
  try { file = (await request.formData()).get("file"); }
  catch { return json({ error: "Choose a photo to upload." }, 400); }
  if (!(file instanceof File)) return json({ error: "Choose a photo to upload." }, 400);
  if (file.size > MAX_UPLOAD_BYTES) return json({ error: "Photos must be 10 MB or smaller." }, 413);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = sniffImage(bytes);
  if (!ext) return json({ error: "Use a JPG, PNG, WebP or GIF photo." }, 400);
  const name = `${randomUUID()}.${ext}`;
  try { writeFileSync(join(mediaDir(), name), bytes, { flag: "wx" }); }
  catch { return json({ error: "The photo could not be saved." }, 500); }
  return json({ path: `/api/media/${name}` });
}
