import { randomUUID } from "node:crypto";
import { primaryOrigin } from "@/lib/auth";
import { json, readJson, sameOriginOr403 } from "@/lib/http";
import { currentClient, portalView } from "@/lib/portal";
import { changeSite } from "@/lib/site-store";
import { createCheckout, stripeReady } from "@/lib/stripe";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request, 1024);
  if ("response" in body) return body.response;
  const blocked = sameOriginOr403(request);
  if (blocked) return blocked;
  const found = await currentClient();
  if (!found) return json({ error: "Please sign in" }, 401);
  if (!stripeReady()) return json({ error: "Online payments aren't available yet. Please contact us to pay." }, 503);
  const view = portalView(found.client, found.state, true);
  const kind = (body.value as { kind?: unknown })?.kind;
  const amount = kind === "deposit" ? view.depositDue : kind === "balance" ? view.balance : 0;
  if (!(amount >= 0.5)) return json({ error: "There's nothing due for that payment right now." }, 400);
  const paymentId = randomUUID();
  try {
    const origin = request.headers.get("origin") ?? primaryOrigin();
    const description = `${kind === "deposit" ? "Deposit" : "Payment"} · ${found.client.eventTitle || "Your event"} · Wander & Revel Event Services`;
    const checkout = await createCheckout({ amount, clientId: found.client.id, paymentId, email: found.client.email, description, origin });
    changeSite((state) => ({ ...state, payments: [{
      id: paymentId, clientId: found.client.id, amount, method: "card", status: "pending",
      note: kind === "deposit" ? "Online deposit" : "Online payment", stripeSessionId: checkout.id, createdAt: new Date().toISOString(),
    }, ...state.payments] }));
    return json({ url: checkout.url });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Could not start the payment." }, 502);
  }
}
