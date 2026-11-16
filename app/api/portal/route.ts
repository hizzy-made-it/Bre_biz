import { currentClient, portalView } from "@/lib/portal";
import { confirmSession, stripeReady } from "@/lib/stripe";
import { json } from "@/lib/http";
export const runtime = "nodejs";

export async function GET(request: Request) {
  let found = await currentClient();
  if (!found) return json({ error: "Please sign in" }, 401);
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (sessionId && stripeReady()) {
    try { await confirmSession(sessionId); found = await currentClient() ?? found; } catch { /* the webhook will settle it */ }
  }
  return json(portalView(found.client, found.state, stripeReady()));
}
