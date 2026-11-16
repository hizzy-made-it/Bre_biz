"use client";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, CreditCard, LogOut, MapPin, Users } from "lucide-react";
import type { PortalView } from "@/lib/portal";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { dateLabel, money, timeLabel } from "@/components/admin/format";

export default function PortalApp({ initial }: { initial: PortalView }) {
  const [view, setView] = useState(initial);
  const [paying, setPaying] = useState("");
  const [error, setError] = useState("");
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("cancelled")) setBanner("Payment cancelled — nothing was charged.");
    const sessionId = params.get("session_id");
    if (params.get("paid") && sessionId) {
      setBanner("Thank you! Confirming your payment…");
      void fetch(`/api/portal?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" }).then(async (r) => {
        if (r.ok) { setView(await r.json()); setBanner("Thank you! Your payment was received."); }
      });
    }
    if (params.size) history.replaceState(null, "", "/portal");
  }, []);

  async function pay(kind: "deposit" | "balance") {
    setPaying(kind); setError("");
    try {
      const r = await fetch("/api/portal/pay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
      const data = await r.json() as { url?: string; error?: string };
      if (!r.ok || !data.url) throw new Error(data.error || "Could not start payment");
      location.href = data.url;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start payment"); setPaying(""); }
  }
  async function logout() { await fetch("/api/portal/logout", { method: "POST" }); location.reload(); }

  const { client, plan } = view;
  const first = client.name.split(" ")[0];
  const foodsByCategory = plan ? Array.from(new Set(plan.foods.map((f) => f.category))).map((category) => ({ category, items: plan.foods.filter((f) => f.category === category) })) : [];

  return <div className="portal">
    <header className="admin-header"><a href="/" className="brand-logo-link" aria-label="Wander & Revel home"><BrandLogo /></a><span className="admin-badge">Client page</span><div className="admin-header-actions"><ThemeToggle /><button className="button secondary" onClick={() => void logout()}><LogOut size={14} aria-hidden="true" /> Sign out</button></div></header>
    <main className="portal-main" id="main">
      {banner && <p className="portal-banner" role="status">{banner}</p>}
      <section className="portal-hero">
        <p className="small-label">Hi {first} · {client.status === "completed" ? "Thank you for celebrating with us" : "Your celebration"}</p>
        <h1>{client.eventTitle || "Your event"}</h1>
        <div className="portal-facts">
          <span><CalendarDays size={17} aria-hidden="true" />{dateLabel(client.eventDate)}</span>
          {(client.startTime || client.endTime) && <span><Clock3 size={17} aria-hidden="true" />{[timeLabel(client.startTime), timeLabel(client.endTime)].filter(Boolean).join(" – ")}</span>}
          <span><Users size={17} aria-hidden="true" />{client.guests ? `${client.guests} guests` : "Guest count TBD"}</span>
          <span><MapPin size={17} aria-hidden="true" />{client.venue || "Venue TBD"}</span>
        </div>
        {client.service && <p className="muted">{client.service}</p>}
      </section>

      <div className="portal-grid">
        <div>
          {client.clientNotes && <section className="panel"><h2>Notes from us</h2>{client.clientNotes.split(/\n+/).map((line, i) => <p key={i}>{line}</p>)}</section>}
          <section className="panel"><h2>Tentative schedule</h2>
            {plan?.timeline.length ? <ol className="portal-timeline">{plan.timeline.map((item, i) => <li key={i}><time>{timeLabel(item.time)}</time><span>{item.title}</span></li>)}</ol> : <p className="muted">We’ll share the run of show here as your plan comes together.</p>}
          </section>
          <section className="panel"><h2>Your menu</h2>
            {foodsByCategory.length ? foodsByCategory.map((group) => <div key={group.category} className="portal-menu-group"><h3>{group.category}</h3><ul>{group.items.map((f, i) => <li key={i}><strong>{f.name}</strong>{f.notes && <small>{f.notes}</small>}</li>)}</ul></div>) : <p className="muted">Food selections will appear here once they’re chosen.</p>}
            {plan?.drinks.length ? <div className="portal-menu-group"><h3>Bar</h3><ul>{plan.drinks.map((d, i) => <li key={i}><strong>{d}</strong></li>)}</ul></div> : null}
          </section>
        </div>
        <div>
          <section className="panel portal-pay"><h2>Payments</h2>
            <dl className="portal-money"><div><dt>Event total</dt><dd>{client.total ? money(client.total) : "To be confirmed"}</dd></div><div><dt>Paid so far</dt><dd>{money(view.paid)}</dd></div><div className="balance"><dt>Balance</dt><dd>{money(view.balance)}</dd></div></dl>
            {error && <p className="form-error" role="alert">{error}</p>}
            {view.stripeReady ? <div className="portal-pay-actions">
              {view.depositDue >= 0.5 && <button className="button primary" disabled={!!paying} onClick={() => void pay("deposit")}><CreditCard size={16} aria-hidden="true" />{paying === "deposit" ? "Opening secure checkout…" : `Pay deposit · ${money(view.depositDue)}`}</button>}
              {view.balance >= 0.5 && <button className={view.depositDue >= 0.5 ? "button secondary" : "button primary"} disabled={!!paying} onClick={() => void pay("balance")}><CreditCard size={16} aria-hidden="true" />{paying === "balance" ? "Opening secure checkout…" : `Pay full balance · ${money(view.balance)}`}</button>}
              {view.balance < 0.5 && client.total > 0 && <p className="status-pill confirmed">Paid in full — thank you!</p>}
              <small className="muted">Secure card checkout powered by Stripe.</small>
            </div> : view.balance > 0 && <p className="muted">Online payment is coming soon. Please contact us to arrange payment.</p>}
            {view.payments.length > 0 && <ul className="payment-list">{view.payments.map((p) => <li key={p.id}><span>{new Date(p.createdAt).toLocaleDateString()} · {p.method}</span><strong>{money(p.amount)}</strong><span className={`status-pill ${p.status === "paid" ? "confirmed" : "contacted"}`}>{p.status}</span></li>)}</ul>}
          </section>
          <section className="panel"><h2>Updates</h2>
            {client.updates.length ? <ul className="update-list">{client.updates.slice(0, 40).map((u) => <li key={u.id}><time>{new Date(u.at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time>{u.message}</li>)}</ul> : <p className="muted">Changes to your date, guests, schedule or menu will show here.</p>}
          </section>
          {(view.contact.email || view.contact.phone) && <section className="panel"><h2>Questions?</h2>{view.contact.email && <p><a href={`mailto:${view.contact.email}`}>{view.contact.email}</a></p>}{view.contact.phone && <p><a href={`tel:${view.contact.phone.replace(/[^\d+]/g, "")}`}>{view.contact.phone}</a></p>}</section>}
        </div>
      </div>
    </main>
  </div>;
}
