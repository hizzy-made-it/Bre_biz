import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { changeSite } from "./site-store";

export function stripeReady() { return Boolean(process.env.STRIPE_SECRET_KEY); }

async function stripe(path: string, init: { method?: string; form?: Record<string, string> } = {}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Online payments are not set up yet.");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${key}`, ...(init.form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body: init.form ? new URLSearchParams(init.form).toString() : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const data = await response.json() as Record<string, unknown> & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message ?? "The payment provider returned an error.");
  return data;
}

export async function createCheckout(input: { amount: number; clientId: string; paymentId: string; email: string; description: string; origin: string }) {
  const session = await stripe("checkout/sessions", { method: "POST", form: {
    mode: "payment",
    customer_email: input.email,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(Math.round(input.amount * 100)),
    "line_items[0][price_data][product_data][name]": input.description,
    "metadata[clientId]": input.clientId,
    "metadata[paymentId]": input.paymentId,
    "payment_intent_data[metadata][clientId]": input.clientId,
    "payment_intent_data[metadata][paymentId]": input.paymentId,
    success_url: `${input.origin}/portal?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/portal?cancelled=1`,
  } });
  return { id: String(session.id), url: String(session.url) };
}

/** Marks a pending payment paid once Stripe confirms it. Safe to call more than once. */
export function settleSession(session: Record<string, unknown>) {
  const metadata = (session.metadata ?? {}) as Record<string, string>;
  const paid = session.payment_status === "paid";
  const expired = session.status === "expired";
  if (!metadata.paymentId || (!paid && !expired)) return;
  changeSite((state) => {
    const payment = state.payments.find((item) => item.id === metadata.paymentId && item.stripeSessionId === session.id);
    if (!payment || payment.status !== "pending") return state;
    const status = paid ? "paid" as const : "failed" as const;
    return {
      ...state,
      payments: state.payments.map((item) => item.id === payment.id ? { ...item, status } : item),
      clients: paid ? state.clients.map((client) => client.id === payment.clientId ? {
        ...client,
        updates: [{ id: crypto.randomUUID(), at: new Date().toISOString(), message: `Card payment received: $${payment.amount.toFixed(2)}. Thank you!` }, ...client.updates],
      } : client) : state.clients,
    };
  });
}

export async function confirmSession(sessionId: string) {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return;
  settleSession(await stripe(`checkout/sessions/${sessionId}`));
}

export function verifyWebhook(raw: string, header: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((part) => part.split("=") as [string, string]).filter((pair) => pair.length === 2));
  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
  return header.split(",").filter((part) => part.startsWith("v1=")).some((part) => {
    const given = Buffer.from(part.slice(3)); const want = Buffer.from(expected);
    return given.length === want.length && timingSafeEqual(given, want);
  });
}
