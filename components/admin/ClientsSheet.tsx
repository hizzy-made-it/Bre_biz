"use client";
import { useMemo, useState } from "react";
import { ArrowDownToLine, Copy, ExternalLink, KeyRound, Plus, Save, Search, Trash2, X } from "lucide-react";
import type { Client, ClientStatus, DemoState } from "@/lib/demo-types";
import { dateLabel, downloadCsv, money, timeLabel } from "./format";

type Mutate = (action: string, payload: unknown) => Promise<DemoState>;
type Draft = {
  id?: string; name: string; email: string; phone: string; eventTitle: string; service: string; eventDate: string;
  startTime: string; endTime: string; venue: string; guests: string; status: ClientStatus; total: string; deposit: string;
  internalNotes: string; clientNotes: string;
};
const STATUSES: ClientStatus[] = ["lead", "booked", "completed", "cancelled"];

function toDraft(client: Client): Draft {
  return {
    id: client.id, name: client.name, email: client.email, phone: client.phone, eventTitle: client.eventTitle, service: client.service,
    eventDate: client.eventDate, startTime: client.startTime, endTime: client.endTime, venue: client.venue, guests: String(client.guests || ""),
    status: client.status, total: client.total ? String(client.total) : "", deposit: client.deposit ? String(client.deposit) : "",
    internalNotes: client.internalNotes, clientNotes: client.clientNotes,
  };
}
const blankDraft = (): Draft => ({ name: "", email: "", phone: "", eventTitle: "", service: "", eventDate: "", startTime: "", endTime: "", venue: "", guests: "", status: "booked", total: "", deposit: "", internalNotes: "", clientNotes: "" });
function toPayload(draft: Draft) {
  return { ...draft, guests: draft.guests === "" ? 0 : Number(draft.guests), total: draft.total === "" ? 0 : Number(draft.total), deposit: draft.deposit === "" ? 0 : Number(draft.deposit) };
}

export function ClientsSheet({ state, mutate, busy, onNotice, openPlan }: { state: DemoState; mutate: Mutate; busy: boolean; onNotice: (text: string) => void; openPlan: (eventId: string) => void }) {
  const [edits, setEdits] = useState<Record<string, Draft>>({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | ClientStatus>("all");
  const [openId, setOpenId] = useState<string | "new" | null>(null);
  const [error, setError] = useState("");

  const paid = useMemo(() => {
    const totals = new Map<string, number>();
    for (const payment of state.payments) if (payment.status === "paid") totals.set(payment.clientId, (totals.get(payment.clientId) ?? 0) + payment.amount);
    return totals;
  }, [state.payments]);
  const rows = useMemo(() => state.clients
    .filter((client) => status === "all" || client.status === status)
    .filter((client) => `${client.name} ${client.email} ${client.phone} ${client.eventTitle} ${client.venue}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.eventDate || "9999").localeCompare(b.eventDate || "9999")), [state.clients, status, search]);
  const dirtyIds = Object.keys(edits).filter((id) => state.clients.some((client) => client.id === id));
  const services = state.services.map((service) => service.title);

  const cell = (client: Client) => edits[client.id] ?? toDraft(client);
  const setCell = (client: Client, key: keyof Draft, value: string) => setEdits((current) => ({ ...current, [client.id]: { ...(current[client.id] ?? toDraft(client)), [key]: value } }));

  async function saveRows(ids: string[]) {
    setError("");
    try {
      for (const id of ids) {
        await mutate("saveClient", toPayload(edits[id]));
        setEdits((current) => { const next = { ...current }; delete next[id]; return next; });
      }
      onNotice(ids.length > 1 ? `${ids.length} clients saved` : "Client saved");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save"); }
  }

  function exportCsv() {
    downloadCsv("wander-revel-clients.csv", [
      ["Name", "Email", "Phone", "Event", "Service", "Date", "Start", "End", "Venue", "Guests", "Status", "Total", "Deposit", "Paid", "Balance", "Access code", "Internal notes"],
      ...rows.map((c) => { const p = paid.get(c.id) ?? 0; return [c.name, c.email, c.phone, c.eventTitle, c.service, c.eventDate, c.startTime, c.endTime, c.venue, c.guests, c.status, c.total, c.deposit, p, Math.max(0, c.total - p), c.portalCode, c.internalNotes]; }),
    ]);
  }

  const totals = rows.reduce((sum, c) => ({ total: sum.total + c.total, paid: sum.paid + (paid.get(c.id) ?? 0) }), { total: 0, paid: 0 });
  const open = openId === "new" ? null : state.clients.find((client) => client.id === openId) ?? null;

  return <section aria-labelledby="clients-title">
    <div className="admin-section-head">
      <div><h2 id="clients-title">Clients</h2><p className="muted">Every booked client in one sheet. Click any cell to edit, then save the row. Open a row for notes, payments and their login code.</p></div>
      <div className="admin-actions">
        <button className="button secondary" onClick={exportCsv}><ArrowDownToLine size={15} aria-hidden="true" /> Export CSV</button>
        <button className="button primary" onClick={() => setOpenId("new")}><Plus size={15} aria-hidden="true" /> Add client</button>
      </div>
    </div>
    <div className="sheet-toolbar">
      <label className="sheet-search"><Search size={15} aria-hidden="true" /><span className="sr-only">Search clients</span><input type="search" placeholder="Search name, email, venue…" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}><option value="all">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}</select>
      <span className="muted sheet-totals">{rows.length} clients · {money(totals.total)} booked · {money(totals.paid)} collected · {money(Math.max(0, totals.total - totals.paid))} outstanding</span>
      {dirtyIds.length > 0 && <button className="button primary" disabled={busy} onClick={() => void saveRows(dirtyIds)}><Save size={15} aria-hidden="true" /> Save {dirtyIds.length} change{dirtyIds.length > 1 ? "s" : ""}</button>}
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {state.clients.length === 0 ? <div className="empty-state"><h2>No clients yet</h2><p>Add a client, or confirm a website inquiry from the Inquiries tab to create one automatically.</p></div> :
    <div className="table-wrap sheet-wrap"><table className="sheet">
      <thead><tr>{["", "Name", "Email", "Phone", "Event", "Service", "Date", "Start", "End", "Venue", "Guests", "Status", "Total $", "Deposit $", "Paid", "Balance", "Access code"].map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.map((client) => {
        const d = cell(client); const dirty = Boolean(edits[client.id]); const p = paid.get(client.id) ?? 0;
        const input = (key: keyof Draft, type = "text", width?: number) => <input aria-label={`${key} for ${client.name}`} type={type} value={d[key] ?? ""} style={width ? { width } : undefined} onChange={(e) => setCell(client, key, e.target.value)} />;
        return <tr key={client.id} className={dirty ? "dirty-row" : undefined}>
          <td className="sheet-row-actions">{dirty ? <button className="button primary" disabled={busy} onClick={() => void saveRows([client.id])}>Save</button> : <button className="button secondary" onClick={() => setOpenId(client.id)}>Open</button>}</td>
          <td>{input("name", "text", 150)}</td><td>{input("email", "email", 190)}</td><td>{input("phone", "tel", 120)}</td>
          <td>{input("eventTitle", "text", 150)}</td>
          <td><select aria-label={`service for ${client.name}`} value={d.service} onChange={(e) => setCell(client, "service", e.target.value)}><option value="">—</option>{[...new Set([...services, d.service].filter(Boolean))].map((s) => <option key={s}>{s}</option>)}</select></td>
          <td>{input("eventDate", "date")}</td><td>{input("startTime", "time")}</td><td>{input("endTime", "time")}</td>
          <td>{input("venue", "text", 160)}</td><td>{input("guests", "number", 70)}</td>
          <td><select aria-label={`status for ${client.name}`} className={`status-select ${d.status}`} value={d.status} onChange={(e) => setCell(client, "status", e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
          <td>{input("total", "number", 90)}</td><td>{input("deposit", "number", 90)}</td>
          <td className="num">{money(p)}</td><td className={client.total - p > 0 ? "num owed" : "num"}>{money(Math.max(0, client.total - p))}</td>
          <td><code>{client.portalCode}</code></td>
        </tr>;
      })}</tbody>
    </table></div>}
    {openId && <ClientDrawer key={openId} client={open} state={state} mutate={mutate} busy={busy} onNotice={onNotice} onClose={() => setOpenId(null)} openPlan={openPlan} paid={open ? paid.get(open.id) ?? 0 : 0} onCreated={(id) => setOpenId(id)} />}
  </section>;
}

function ClientDrawer({ client, state, mutate, busy, onNotice, onClose, openPlan, paid, onCreated }: {
  client: Client | null; state: DemoState; mutate: Mutate; busy: boolean; onNotice: (t: string) => void; onClose: () => void; openPlan: (id: string) => void; paid: number; onCreated: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => client ? toDraft(client) : blankDraft());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [payment, setPayment] = useState({ amount: "", method: "cash", note: "" });
  const set = (key: keyof Draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const payments = client ? state.payments.filter((item) => item.clientId === client.id) : [];
  const services = state.services.map((service) => service.title);

  async function run(action: string, payload: unknown, done: string) {
    setError("");
    try { const next = await mutate(action, payload); onNotice(done); return next; }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save"); return null; }
  }
  async function save() {
    const before = new Set(state.clients.map((item) => item.id));
    const next = await run("saveClient", toPayload(draft), client ? "Client saved" : "Client added");
    if (next && !client) { const created = next.clients.find((item) => !before.has(item.id)); if (created) onCreated(created.id); }
  }
  const invite = client ? `Hi ${client.name.split(" ")[0]}! You can view your event details, menu and payments anytime at ${typeof window !== "undefined" ? window.location.origin : ""}/portal\nEmail: ${client.email}\nAccess code: ${client.portalCode}` : "";
  const field = (key: keyof Draft, label: string, type = "text", full = false) => <label className={full ? "field full-width" : "field"}>{label}<input type={type} value={draft[key] ?? ""} onChange={(e) => set(key, e.target.value)} /></label>;

  return <div className="drawer-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <aside className="drawer" role="dialog" aria-modal="true" aria-label={client ? client.name : "New client"}>
      <div className="drawer-head"><div><p className="small-label">{client ? "Client" : "New client"}</p><h2>{client?.name || "Add a client"}</h2></div><button className="icon-button" aria-label="Close" onClick={onClose}><X /></button></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-grid">
        {field("name", "Name")}{field("email", "Email", "email")}{field("phone", "Phone", "tel")}
        {field("eventTitle", "Event")}
        <label className="field">Service<select value={draft.service} onChange={(e) => set("service", e.target.value)}><option value="">—</option>{[...new Set([...services, draft.service].filter(Boolean))].map((s) => <option key={s}>{s}</option>)}</select></label>
        <label className="field">Status<select value={draft.status} onChange={(e) => set("status", e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
        {field("eventDate", "Event date", "date")}{field("guests", "Guests", "number")}{field("startTime", "Start time", "time")}{field("endTime", "End time", "time")}
        {field("venue", "Venue / address", "text", true)}
        {field("total", "Event total ($)", "number")}{field("deposit", "Deposit due ($)", "number")}
        <label className="field full-width">Notes the client can see<textarea rows={3} value={draft.clientNotes} onChange={(e) => set("clientNotes", e.target.value)} placeholder="Arrival details, what to prepare, reminders…" /></label>
        <label className="field full-width">Private notes (only you)<textarea rows={3} value={draft.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} /></label>
      </div>
      <div className="form-actions"><button className="button primary" disabled={busy} onClick={() => void save()}><Save size={15} aria-hidden="true" /> {client ? "Save changes" : "Add client"}</button></div>

      {client && <>
        <section className="drawer-section">
          <h3>Client login</h3>
          <p className="muted">Share this so {client.name.split(" ")[0]} can sign in at <strong>/portal</strong> with their email.</p>
          <div className="code-row"><code className="portal-code">{client.portalCode}</code>
            <button className="button secondary" onClick={() => { void navigator.clipboard.writeText(invite); onNotice("Invite copied — paste it into a text or email"); }}><Copy size={14} aria-hidden="true" /> Copy invite</button>
            <button className="button secondary" disabled={busy} onClick={() => { if (confirm("Make a new code? The old one stops working.")) void run("resetPortalCode", { id: client.id }, "New access code created"); }}><KeyRound size={14} aria-hidden="true" /> New code</button>
          </div>
        </section>

        <section className="drawer-section">
          <h3>Event plan</h3>
          <p className="muted">Schedule, food and bar choices from the plan show on the client’s page. Changes are logged for them automatically.</p>
          {client.eventId && state.events.some((event) => event.id === client.eventId)
            ? <button className="button secondary" onClick={() => openPlan(client.eventId!)}><ExternalLink size={14} aria-hidden="true" /> Open event plan</button>
            : <button className="button secondary" disabled={busy} onClick={() => void run("createEventPlan", { id: client.id }, "Event plan created")}><Plus size={14} aria-hidden="true" /> Create event plan</button>}
        </section>

        <section className="drawer-section">
          <h3>Payments</h3>
          <p className="muted">Total {money(client.total)} · Paid {money(paid)} · <strong>Balance {money(Math.max(0, client.total - paid))}</strong></p>
          {payments.length > 0 && <ul className="payment-list">{payments.map((item) => <li key={item.id}><span>{new Date(item.createdAt).toLocaleDateString()} · {item.method}{item.note ? ` · ${item.note}` : ""}</span><strong>{money(item.amount)}</strong><span className={`status-pill ${item.status === "paid" ? "confirmed" : item.status === "pending" ? "contacted" : "declined"}`}>{item.status}</span>
            {item.method !== "card" && <button className="icon-button" aria-label="Delete payment" onClick={() => { if (confirm("Delete this payment record?")) void run("deletePayment", { id: item.id }, "Payment removed"); }}><Trash2 size={14} /></button>}</li>)}</ul>}
          <form className="inline-add" onSubmit={(e) => { e.preventDefault(); void run("recordPayment", { clientId: client.id, amount: Number(payment.amount), method: payment.method, note: payment.note, status: "paid" }, "Payment recorded").then((ok) => { if (ok) setPayment({ amount: "", method: "cash", note: "" }); }); }}>
            <label className="field">Amount<input required type="number" min="0.01" step="0.01" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} /></label>
            <label className="field">Method<select value={payment.method} onChange={(e) => setPayment({ ...payment, method: e.target.value })}><option value="cash">Cash</option><option value="check">Check</option><option value="card">Card (in person)</option><option value="other">Other (Venmo, Zelle…)</option></select></label>
            <label className="field">Note<input value={payment.note} onChange={(e) => setPayment({ ...payment, note: e.target.value })} /></label>
            <button className="button secondary" disabled={busy}>Record payment</button>
          </form>
        </section>

        <section className="drawer-section">
          <h3>Updates for the client</h3>
          <p className="muted">Changes to date, guests, schedule and menus are posted here automatically. Add your own note too.</p>
          <form className="inline-add" onSubmit={(e) => { e.preventDefault(); void run("addClientUpdate", { id: client.id, message }, "Update posted").then((ok) => { if (ok) setMessage(""); }); }}>
            <label className="field">New update<input required maxLength={1000} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Final menu tasting confirmed for May 3" /></label>
            <button className="button secondary" disabled={busy}>Post</button>
          </form>
          <ul className="update-list">{client.updates.slice(0, 30).map((item) => <li key={item.id}><time>{new Date(item.at).toLocaleString()}</time>{item.message}</li>)}</ul>
        </section>

        <div className="form-actions"><button className="button danger" disabled={busy} onClick={() => { if (confirm(`Delete ${client.name}? This can't be undone.`)) void run("deleteClient", { id: client.id }, "Client deleted").then((ok) => { if (ok) onClose(); }); }}><Trash2 size={14} aria-hidden="true" /> Delete client</button></div>
        <p className="muted drawer-meta">{dateLabel(client.eventDate)} {timeLabel(client.startTime)}</p>
      </>}
    </aside>
  </div>;
}
