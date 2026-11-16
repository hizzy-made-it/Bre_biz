import { ADMIN_COOKIE, adminPasswordMatches, clientKey, cookieHeader, createAdminSession, recordFailure, tooManyAttempts } from "@/lib/auth";
import { json, readJson, sameOriginOr403 } from "@/lib/http";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = sameOriginOr403(request);
  if (blocked) return blocked;
  const bucket = `admin:${clientKey(request)}`;
  if (tooManyAttempts(bucket, 10)) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  const body = await readJson(request, 2048);
  if ("response" in body) return body.response;
  try {
    const password = typeof body.value === "object" && body.value ? (body.value as { password?: unknown }).password : undefined;
    if (!adminPasswordMatches(password)) { recordFailure(bucket); return json({ error: "That password wasn't accepted." }, 401); }
    const session = createAdminSession();
    return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(ADMIN_COOKIE, session.value, session.maxAge) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Admin sign-in is not configured." }, 503);
  }
}
