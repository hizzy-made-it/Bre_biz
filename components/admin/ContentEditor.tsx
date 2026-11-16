"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import type { DemoState, ServiceItem } from "@/lib/demo-types";
import { CONTENT_FIELDS, readContent, type ContentField } from "@/lib/site-defaults";
import { ImageField } from "./ImageField";

type Mutate = (action: string, payload: unknown) => Promise<DemoState>;
const GROUPS: ContentField["group"][] = ["Home", "About", "Services", "Menus", "Contact & footer"];

export function ContentEditor({ state, mutate, busy, onNotice }: { state: DemoState; mutate: Mutate; busy: boolean; onNotice: (t: string) => void }) {
  const [group, setGroup] = useState<ContentField["group"]>("Home");
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(CONTENT_FIELDS.map((f) => [f.key, readContent(state.content, f.key)])));
  const [error, setError] = useState("");
  const fields = CONTENT_FIELDS.filter((field) => field.group === group);
  const changed = CONTENT_FIELDS.filter((field) => values[field.key] !== readContent(state.content, field.key));

  async function save() {
    setError("");
    try { await mutate("saveContent", { values: Object.fromEntries(changed.map((field) => [field.key, values[field.key]])) }); onNotice("Website updated"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save"); }
  }

  return <section aria-labelledby="content-title">
    <div className="admin-section-head">
      <div><h2 id="content-title">Website text &amp; photos</h2><p className="muted">Edit any wording or photo on the public site. Changes go live as soon as you save.</p></div>
      <div className="admin-actions"><a className="button secondary" href="/" target="_blank" rel="noopener">View website</a><button className="button primary" disabled={busy || changed.length === 0} onClick={() => void save()}><Save size={15} aria-hidden="true" /> {changed.length ? `Publish ${changed.length} change${changed.length > 1 ? "s" : ""}` : "No changes"}</button></div>
    </div>
    <div className="filter-tabs">{GROUPS.map((g) => <button key={g} className={g === group ? "active" : ""} aria-pressed={g === group} onClick={() => setGroup(g)}>{g}</button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="panel content-fields">
      {fields.map((field) => {
        const isChanged = values[field.key] !== readContent(state.content, field.key);
        const reset = field.default !== values[field.key] && <button type="button" className="text-link" onClick={() => setValues({ ...values, [field.key]: field.default })}>Restore original</button>;
        if (field.kind === "image") return <div key={field.key} className={isChanged ? "content-field changed" : "content-field"}><ImageField label={field.label} value={values[field.key]} onChange={(path) => setValues({ ...values, [field.key]: path })} />{reset}</div>;
        return <label key={field.key} className={isChanged ? "field content-field changed" : "field content-field"}>{field.label}
          {field.kind === "textarea"
            ? <textarea rows={Math.min(10, Math.max(3, Math.ceil(values[field.key].length / 90)))} value={values[field.key]} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} />
            : <input value={values[field.key]} onChange={(e) => setValues({ ...values, [field.key]: e.target.value })} />}
          {reset}
        </label>;
      })}
    </div>
  </section>;
}

export function ServicesEditor({ state, mutate, busy, onNotice }: { state: DemoState; mutate: Mutate; busy: boolean; onNotice: (t: string) => void }) {
  const [services, setServices] = useState<ServiceItem[]>(() => state.services.map((s) => ({ ...s })));
  const [error, setError] = useState("");
  const dirty = JSON.stringify(services) !== JSON.stringify(state.services);
  const set = (index: number, key: keyof ServiceItem, value: string) => setServices(services.map((s, i) => i === index ? { ...s, [key]: value } : s));
  const move = (index: number, by: number) => { const next = [...services]; const [item] = next.splice(index, 1); next.splice(index + by, 0, item); setServices(next); };

  async function save() {
    setError("");
    try { await mutate("saveServices", { services }); onNotice("Services updated"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save"); }
  }
  return <section aria-labelledby="services-title">
    <div className="admin-section-head">
      <div><h2 id="services-title">Services &amp; pricing</h2><p className="muted">These appear on the Home and Services pages and in the inquiry form. Leave price blank to hide it.</p></div>
      <div className="admin-actions"><button className="button secondary" onClick={() => setServices([...services, { title: "", description: "", details: "", price: "" }])}><Plus size={15} aria-hidden="true" /> Add service</button><button className="button primary" disabled={busy || !dirty} onClick={() => void save()}><Save size={15} aria-hidden="true" /> Save services</button></div>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    {services.map((service, index) => <div className="panel service-edit" key={index}>
      <div className="form-grid">
        <label className="field">Service name<input value={service.title} maxLength={100} onChange={(e) => set(index, "title", e.target.value)} /></label>
        <label className="field">Price <span className="muted">(as shown)</span><input value={service.price} maxLength={80} placeholder="Starting at $…" onChange={(e) => set(index, "price", e.target.value)} /></label>
        <label className="field full-width">Short summary<textarea rows={2} value={service.description} maxLength={600} onChange={(e) => set(index, "description", e.target.value)} /></label>
        <label className="field full-width">What’s included<textarea rows={2} value={service.details} maxLength={1200} onChange={(e) => set(index, "details", e.target.value)} /></label>
      </div>
      <div className="service-edit-actions">
        <button className="icon-button" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} /></button>
        <button className="icon-button" aria-label="Move down" disabled={index === services.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} /></button>
        <button className="icon-button" aria-label="Remove service" disabled={services.length === 1} onClick={() => setServices(services.filter((_, i) => i !== index))}><Trash2 size={16} /></button>
      </div>
    </div>)}
  </section>;
}
