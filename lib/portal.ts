import "server-only";
import { clientSession, sessionMatchesCode } from "./auth";
import { loadSite, paidTotal } from "./site-store";
import type { Client, DemoState } from "./demo-types";

export async function currentClient(): Promise<{ client: Client; state: DemoState } | null> {
  const session = await clientSession();
  if (!session) return null;
  const { state } = loadSite();
  const client = state.clients.find((item) => item.id === session.clientId);
  // Resetting a client's code signs out every device that used the old one.
  if (!client || client.status === "cancelled" || !sessionMatchesCode(session, client.portalCode)) return null;
  return { client, state };
}

export function portalView(client: Client, state: DemoState, stripeReady: boolean) {
  const event = client.eventId ? state.events.find((item) => item.id === client.eventId) : undefined;
  const paid = paidTotal(state, client.id);
  return {
    client: {
      name: client.name, email: client.email, phone: client.phone, eventTitle: client.eventTitle, service: client.service,
      eventDate: client.eventDate, startTime: client.startTime, endTime: client.endTime, venue: client.venue, guests: client.guests,
      status: client.status, total: client.total, deposit: client.deposit, clientNotes: client.clientNotes, updates: client.updates,
    },
    plan: event ? {
      timeline: [...event.timeline].sort((a, b) => a.time.localeCompare(b.time)),
      foods: event.foods.map(({ name, category, notes }) => ({ name, category, notes })),
      drinks: event.drinks,
    } : null,
    payments: state.payments.filter((item) => item.clientId === client.id && item.status !== "failed")
      .map(({ id, amount, method, status, createdAt }) => ({ id, amount, method, status, createdAt })),
    paid,
    balance: Math.max(0, Math.round((client.total - paid) * 100) / 100),
    depositDue: Math.max(0, Math.round((client.deposit - paid) * 100) / 100),
    stripeReady,
    contact: { email: state.content["contact.email"] ?? "", phone: state.content["contact.phone"] ?? "" },
  };
}
export type PortalView = ReturnType<typeof portalView>;
