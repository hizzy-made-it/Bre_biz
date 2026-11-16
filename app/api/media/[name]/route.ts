import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MEDIA_TYPES, mediaDir } from "@/lib/media";
export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const match = /^([0-9a-f-]{36})\.(jpg|png|webp|gif)$/.exec(name);
  if (!match) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(join(mediaDir(), name));
    return new Response(new Uint8Array(data), { headers: {
      "Content-Type": MEDIA_TYPES[match[2]],
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
