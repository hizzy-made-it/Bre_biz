import { settleSession, verifyWebhook } from "@/lib/stripe";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 512 * 1024 || !verifyWebhook(raw, request.headers.get("stripe-signature"))) return new Response("Invalid signature", { status: 400 });
  try {
    const event = JSON.parse(raw) as { type?: string; data?: { object?: Record<string, unknown> } };
    if (event.data?.object && ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired"].includes(event.type ?? "")) {
      const session = event.data.object;
      settleSession(event.type === "checkout.session.async_payment_failed" ? { ...session, status: "expired", payment_status: "unpaid" } : session);
    }
    return new Response("ok");
  } catch {
    return new Response("Could not process", { status: 500 });
  }
}
