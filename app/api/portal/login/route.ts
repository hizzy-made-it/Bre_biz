import { CLIENT_COOKIE, clientKey, codesMatch, cookieHeader, createClientSession, recordFailure, tooManyAttempts } from "@/lib/auth";
import { json, readJson, sameOriginOr403 } from "@/lib/http";
import { loadSite } from "@/lib/site-store";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const blocked = sameOriginOr403(request);
  if (blocked) return blocked;
  const bucket = `portal:${clientKey(request)}`;
  if (tooManyAttempts(bucket, 10)) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  const body = await readJson(request, 2048);
  if ("response" in body) return body.response;
  const input = (body.value ?? {}) as { email?: unknown; code?: unknown };
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  try {
    const { state } = loadSite();
    const client = state.clients.find((item) => item.email === email && item.status !== "cancelled" && codesMatch(input.code, item.portalCode));
    if (!client) { recordFailure(bucket); return json({ error: "That email and access code don't match a booking." }, 401); }
    const session = createClientSession(client.id, client.portalCode);
    return json({ ok: true }, 200, { "Set-Cookie": cookieHeader(CLIENT_COOKIE, session.value, session.maxAge) });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Sign-in is unavailable." }, 503);
  }
}
