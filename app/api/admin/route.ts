import { changeSite, isRecord, loadSite, updateState, ValidationError, VersionConflict } from "@/lib/site-store";
import { isAdmin } from "@/lib/auth";
import { json, readJson, sameOriginOr403 } from "@/lib/http";
import type { DemoActionRequest } from "@/lib/demo-types";
export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdmin())) return json({ error: "Admin sign-in required" }, 401);
  try { return json({ ...loadSite(), stripeReady: Boolean(process.env.STRIPE_SECRET_KEY) }); }
  catch { return json({ error: "Site data is unavailable" }, 500); }
}

export async function POST(request: Request) {
  const body = await readJson(request, 256 * 1024);
  if ("response" in body) return body.response;
  const blocked = sameOriginOr403(request, false);
  if (blocked) return blocked;
  if (!(await isAdmin())) return json({ error: "Admin sign-in required" }, 401);
  const input = body.value;
  if (!isRecord(input) || typeof input.action !== "string" || !isRecord(input.payload) || !Number.isSafeInteger(input.version))
    return json({ error: "Expected action, payload and version" }, 400);
  try {
    const result = changeSite((state) => updateState(state, input as DemoActionRequest), input.version as number);
    return json({ ...result, stripeReady: Boolean(process.env.STRIPE_SECRET_KEY) });
  } catch (error) {
    if (error instanceof ValidationError) return json({ error: error.message }, 400);
    if (error instanceof VersionConflict) return json({ error: error.message }, 409);
    return json({ error: "Could not save. Please try again." }, 500);
  }
}
