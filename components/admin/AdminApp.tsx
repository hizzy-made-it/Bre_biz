"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownToLine, Check, ExternalLink, LogOut, X } from "lucide-react";
import type { DemoState, PaymentStatus } from "@/lib/demo-types";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Studio } from "@/components/demo/Studio";
import { Planner } from "@/components/demo/Planner";
import { ClientsSheet } from "./ClientsSheet";
import { MenuEditor } from "./MenuEditor";
import { ContentEditor, ServicesEditor } from "./ContentEditor";
import { dateLabel, downloadCsv, money, timeLabel } from "./format";

const TABS = ["Dashboard", "Clients", "Inquiries", "Event plans", "Menus", "Services & pricing", "Website text & photos", "Gallery", "Journal", "Payments"] as const;
type Tab = (typeof TABS)[number];

export default function AdminApp() {
  const [state, setState] = useState<DemoState | null>(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [planId, setPlanId] = useState("");
  const version = useRef(0);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin", { cache: "no-store" });
    if (response.status === 401) { location.reload(); return; }
    const data = await response.json() as { state: DemoState; version: number; stripeReady: boolean; error?: string };
    if (!response.ok) { setError(data.error || "Could not load"); return; }
    version.current = data.version; setState(data.state); setStripeReady(data.stripeReady); setError("");
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 4500); return () => clearTimeout(t); }, [notice]);
  useEffect(() => { const sync = () => { const hash = decodeURIComponent(location.hash.slice(1)); const match = TABS.find((t) => t === hash); if (match) setTab(match); }; sync(); addEventListener("hashchange", sync); return () => removeEventListener("hashchange", sync); }, []);
  const go = (next: Tab) => { location.hash = encodeURIComponent(next); setTab(next); window.scrollTo({ top: 0 }); };

  const mutate = useCallback(async (action: string, payload: unknown): Promise<DemoState> => {
    setBusy(true);
    try {
      const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, payload, version: version.current }) });
      const data = await response.json() as { state: DemoState; version: number; error?: string };
      if (response.status === 401) { location.reload(); throw new Error("Signed out"); }
      if (!response.ok) { if (response.status === 409) await load(); throw new Error(data.error || "Could not save"); }
      version.current = data.version; setState(data.state);
      return data.state;
    } finally { setBusy(false); }
  }, [load]);

  const openPlan = (id: string) => { setPlanId(id); go("Event plans"); };
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); location.reload(); }

  const newInquiries = state?.inquiries.filter((item) => item.status === "new").length ?? 0;

  return <div className="admin">
    <header className="admin-header">
      <a href="/admin" className="brand-logo-link" aria-label="Admin home"><BrandLogo /></a>
      <span className="admin-badge">Owner admin</span>
      <div className="admin-header-actions"><a className="button secondary" href="/" target="_blank" rel="noopener"><ExternalLink size={14} aria-hidden="true" /> View site</a><ThemeToggle /><button className="button secondary" onClick={() => void logout()}><LogOut size={14} aria-hidden="true" /> Sign out</button></div>
    </header>
    <div className="admin-body">
      <nav className="admin-nav" aria-label="Admin sections">{TABS.map((item) => <button key={item} className={tab === item ? "active" : ""} aria-current={tab === item ? "page" : undefined} onClick={() => go(item)}>{item}{item === "Inquiries" && newInquiries > 0 && <span className="admin-count">{newInquiries}</span>}</button>)}</nav>
      <main className="admin-main" id="main">
        {error && <div className="form-error" role="alert">{error} <button className="text-link" onClick={() => void load()}>Retry</button></div>}
        {!state ? <p className="muted">Loading…</p> : <>
          {tab === "Dashboard" && <Dashboard state={state} stripeReady={stripeReady} go={go} />}
          {tab === "Clients" && <ClientsSheet state={state} mutate={mutate} busy={busy} onNotice={setNotice} openPlan={openPlan} />}
          {tab === "Inquiries" && <Studio key="inq" initialTab="Inquiries" state={state} mutate={mutate} busy={busy} ready onNotice={setNotice} openPlanner={openPlan} onClientCreated={() => go("Clients")} />}
          {tab === "Gallery" && <Studio key="gal" initialTab="Highlights" state={state} mutate={mutate} busy={busy} ready onNotice={setNotice} openPlanner={openPlan} />}
          {tab === "Journal" && <Studio key="jou" initialTab="Journal" state={state} mutate={mutate} busy={busy} ready onNotice={setNotice} openPlanner={openPlan} />}
          {tab === "Event plans" && <Planner state={state} mutate={mutate} busy={busy} ready selectedId={planId} onSelect={setPlanId} onNotice={setNotice} book={() => go("Clients")} />}
          {tab === "Menus" && <MenuEditor state={state} mutate={mutate} busy={busy} onNotice={setNotice} />}
          {tab === "Services & pricing" && <ServicesEditor state={state} mutate={mutate} busy={busy} onNotice={setNotice} />}
          {tab === "Website text & photos" && <ContentEditor state={state} mutate={mutate} busy={busy} onNotice={setNotice} />}
          {tab === "Payments" && <Payments state={state} mutate={mutate} busy={busy} stripeReady={stripeReady} onNotice={setNotice} />}
        </>}
      </main>
    </div>
    {notice && <div className="toast" role="status"><Check size={18} />{notice}<button className="icon-button" aria-label="Dismiss" onClick={() => setNotice("")}><X size={16} /></button></div>}
  </div>;
}

function paidMap(state: DemoState) {
  const map = new Map<string, number>();
  for (const p of state.payments) if (p.status === "paid") map.set(p.clientId, (map.get(p.clientId) ?? 0) + p.amount);
  return map;
}

function Dashboard({ state, stripeReady, go }: { state: DemoState; stripeReady: boolean; go: (tab: Tab) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const paid = paidMap(state);
  const upcoming = state.clients.filter((c) => c.status === "booked" && c.eventDate >= today).sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const month = today.slice(0, 7);
  const collected = state.payments.filter((p) => p.status === "paid" && p.createdAt.slice(0, 7) === month).reduce((s, p) => s + p.amount, 0);
  const outstanding = state.clients.filter((c) => c.status !== "cancelled").reduce((s, c) => s + Math.max(0, c.total - (paid.get(c.id) ?? 0)), 0);
  const newInquiries = state.inquiries.filter((i) => i.status === "new");
  return <section aria-labelledby="dash-title">
    <div className="admin-section-head"><div><h2 id="dash-title">Welcome back</h2><p className="muted">Here’s what’s happening with Wander &amp; Revel.</p></div></div>
    <div className="stats-grid">
      <button className="stat-card" onClick={() => go("Inquiries")}><span>New inquiries</span><strong>{newInquiries.length}</strong></button>
      <button className="stat-card" onClick={() => go("Clients")}><span>Upcoming events</span><strong>{upcoming.length}</strong></button>
      <button className="stat-card" onClick={() => go("Payments")}><span>Collected this month</span><strong>{money(collected)}</strong></button>
      <button className="stat-card" onClick={() => go("Clients")}><span>Outstanding balances</span><strong>{money(outstanding)}</strong></button>
    </div>
    {!stripeReady && <div className="panel setup-note"><h3>Turn on card payments</h3><p>Clients can already see their balance. To let them pay by card from their page, add your Stripe keys in Railway: <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_WEBHOOK_SECRET</code>. Until then, record cash, check or Venmo payments on each client.</p></div>}
    <div className="workspace-grid">
      <div className="panel"><h3>Coming up</h3>{upcoming.length ? <ul className="dash-list">{upcoming.slice(0, 8).map((c) => <li key={c.id}><span><strong>{c.eventTitle || c.name}</strong><small>{c.name} · {c.guests || "?"} guests · {c.venue || "Venue TBD"}</small></span><span>{dateLabel(c.eventDate)}<small>{timeLabel(c.startTime)}</small></span></li>)}</ul> : <p className="muted">No booked events ahead yet.</p>}</div>
      <div className="panel"><h3>Newest inquiries</h3>{newInquiries.length ? <ul className="dash-list">{newInquiries.slice(0, 6).map((i) => <li key={i.id}><span><strong>{i.name}</strong><small>{i.type} · {i.guests} guests</small></span><span>{dateLabel(i.date)}</span></li>)}</ul> : <p className="muted">You’re all caught up.</p>}
        <button className="text-link" onClick={() => go("Inquiries")}>Review inquiries</button></div>
    </div>
  </section>;
}

function Payments({ state, mutate, busy, stripeReady, onNotice }: { state: DemoState; mutate: (a: string, p: unknown) => Promise<DemoState>; busy: boolean; stripeReady: boolean; onNotice: (t: string) => void }) {
  const names = new Map(state.clients.map((c) => [c.id, c.name]));
  const rows = state.payments;
  const total = rows.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  return <section aria-labelledby="pay-title">
    <div className="admin-section-head"><div><h2 id="pay-title">Payments</h2><p className="muted">Card payments from the client page appear here automatically{stripeReady ? "" : " once Stripe is connected"}. Record cash or other payments from a client’s row on the Clients tab.</p></div>
      <div className="admin-actions"><button className="button secondary" onClick={() => downloadCsv("wander-revel-payments.csv", [["Date", "Client", "Amount", "Method", "Status", "Note"], ...rows.map((p) => [p.createdAt.slice(0, 10), names.get(p.clientId) ?? "Deleted client", p.amount, p.method, p.status, p.note])])}><ArrowDownToLine size={15} aria-hidden="true" /> Export CSV</button></div></div>
    <p className="muted">{money(total)} collected in total.</p>
    {rows.length === 0 ? <div className="empty-state"><h2>No payments yet</h2></div> :
    <div className="table-wrap"><table><thead><tr><th>Date</th><th>Client</th><th>Amount</th><th>Method</th><th>Note</th><th>Status</th></tr></thead><tbody>
      {rows.map((p) => <tr key={p.id}><td>{new Date(p.createdAt).toLocaleDateString()}</td><td>{names.get(p.clientId) ?? "Deleted client"}</td><td className="num">{money(p.amount)}</td><td>{p.method}</td><td>{p.note}</td>
        <td><select aria-label="Payment status" value={p.status} disabled={busy} onChange={(e) => void mutate("updatePaymentStatus", { id: p.id, status: e.target.value as PaymentStatus }).then(() => onNotice("Payment updated"))}>{["pending", "paid", "failed", "refunded"].map((s) => <option key={s}>{s}</option>)}</select></td></tr>)}
    </tbody></table></div>}
  </section>;
}
