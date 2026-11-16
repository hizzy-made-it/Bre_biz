import { ADMIN_COOKIE, cookieHeader } from "@/lib/auth";
import { json, sameOriginOr403 } from "@/lib/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const blocked = sameOriginOr403(request);
  if (blocked) return blocked;
  return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(ADMIN_COOKIE, "", 0) });
}
