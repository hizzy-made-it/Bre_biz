"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Mail, MapPin, MessagesSquare, Phone } from "lucide-react";
import type { PublicSite } from "@/lib/demo-types";
import { barServiceOptions, BUDGET_RANGES, EVENT_TYPES, PARTNER_OPTION, readContent } from "@/lib/site-defaults";
import { Sprig, Swash } from "@/components/BrandPages";

type Created = { type: string; date: string; guests: number; location: string };

type BookingValues = {
  type: string;
  date: string;
  guests: string;
  location: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const legacyServices = ["Event planning", "Planning + bar"];
const empty: BookingValues = { type: "", date: "", guests: "", location: "", budget: "", name: "", email: "", phone: "", notes: "" };

function localDateString(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Only real https links are shown. */
const safeLink = (value: string) => /^https:\/\/[^\s"<>]+$/.test(value) ? value : "";
const handle = (url: string) => url.replace(/^https:\/\/(www\.)?[^/]+\/?/, "").replace(/\/$/, "");

export function Booking({ initialService, site, onSaved }: {
  initialService: string;
  site: PublicSite;
  onSaved: (site: PublicSite) => void;
}) {
  const c = (key: string) => readContent(site.content, key);
  const mainServices = site.services.map((service) => service.title);
  const barServices = barServiceOptions(site.content).filter((option) => !mainServices.includes(option));
  const allServices = [...mainServices, ...barServices, PARTNER_OPTION, ...legacyServices];
  const [selected, setSelected] = useState<string[]>(() => allServices.includes(initialService) ? [initialService] : []);
  const [values, setValues] = useState<BookingValues>(empty);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [website, setWebsite] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const partner = selected.length === 1 && selected[0] === PARTNER_OPTION;
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localDateString(tomorrow);
  }, []);

  const set = (key: keyof BookingValues, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const toggle = (service: string) => setSelected((current) => current.includes(service) ? current.filter((s) => s !== service) : [...current, service]);

  const email = c("contact.email");
  const phone = c("contact.phone");
  const area = c("contact.area");
  const instagram = safeLink(c("contact.instagram"));
  const facebook = safeLink(c("contact.facebook"));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || created) return;
    setError("");
    if (selected.length === 0) {
      setError("Please choose at least one service you’re interested in.");
      return;
    }
    const [primary, ...others] = selected;
    const extra = others.length ? `Also interested in: ${others.join(", ")}` : "";
    const notes = [values.notes.trim(), extra].filter(Boolean).join("\n\n");
    setBusy(true);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(),
          type: partner ? "" : values.type.trim(), service: partner ? PARTNER_OPTION : primary,
          ...(partner ? {} : { date: values.date, guests: Number(values.guests) }),
          location: values.location.trim(), budget: values.budget, notes: notes.slice(0, 3000), website,
        }),
      });
      const data = await response.json() as { error?: string; inquiry?: Created; site?: PublicSite };
      if (!response.ok) throw new Error(data.error || "We couldn't send your inquiry. Please try again.");
      if (data.site) onSaved(data.site);
      setCreated(data.inquiry ?? { type: values.type, date: values.date, guests: Number(values.guests), location: values.location });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send your inquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const banner = <section className="wr-banner inquiry dark" aria-labelledby="inquiry-title">
    <img src={c("inquiry.image")} alt="" width={1536} height={1024} fetchPriority="high" />
    <div className="wr-banner-copy">
      <h1 id="inquiry-title">{c("inquiry.title")}</h1>
      <Swash />
      <p className="wr-italic">{c("inquiry.lead")}</p>
    </div>
  </section>;

  if (created) {
    return <>{banner}<section className="booking-shell" aria-labelledby="booking-success-title">
      <div className="success-state">
        <span className="success-icon"><Check aria-hidden="true" /></span>
        <p className="small-label">Inquiry received</p>
        <h2 id="booking-success-title">{created.date ? "Thank you for sharing your story." : "Thank you for reaching out."}</h2>
        <p>{created.date ? "We’ve received your details and will be in touch soon to talk through your plans. Your date is not reserved until we confirm it with you." : "We’ve received your note and will be in touch soon to talk about working together."}</p>
        <div className="panel booking-confirmation">
          <strong>{created.type}</strong>{created.date && <span>{created.date}</span>}
          <span>{created.guests ? `${created.guests} guests · ` : ""}{created.location}</span>
        </div>
        <a className="wr-button outline" href="#home">Back to home</a>
      </div>
    </section></>;
  }

  return <>
    {banner}
    <div className="wr-inquiry">
      <aside className="wr-contact">
        <p className="wr-eyebrow"><span>Get in touch</span></p>
        <ul className="wr-contact-list">
          {email && <li><Mail size={24} strokeWidth={1.4} aria-hidden="true" /><div><strong>Email</strong><a href={`mailto:${email}`}>{email}</a></div></li>}
          {phone && <li><Phone size={24} strokeWidth={1.4} aria-hidden="true" /><div><strong>Phone</strong><a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a></div></li>}
          {area && <li><MapPin size={24} strokeWidth={1.4} aria-hidden="true" /><div><strong>Serving</strong><span>{area}</span></div></li>}
        </ul>
        {(instagram || facebook) && <>
          <span className="wr-rule" aria-hidden="true" />
          <p className="wr-eyebrow"><span>Follow along</span></p>
          <ul className="wr-contact-list compact">
            {instagram && <li><a href={instagram} target="_blank" rel="noopener">Instagram{handle(instagram) && <span> · @{handle(instagram)}</span>}</a></li>}
            {facebook && <li><a href={facebook} target="_blank" rel="noopener">Facebook · Wander &amp; Revel Event Services</a></li>}
          </ul>
        </>}
        <Sprig className="contact" />
      </aside>
      <form className="wr-form" onSubmit={submit} aria-labelledby="form-title">
        <h2 id="form-title">Event Inquiry</h2>
        <label className="visually-hidden" aria-hidden="true">Leave this empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
        <div className="wr-form-grid">
          <label className="wr-field">Full Name <i aria-hidden="true">*</i><input required autoComplete="name" maxLength={120} value={values.name} onChange={(e) => set("name", e.target.value)} /></label>
          <label className="wr-field">Email Address <i aria-hidden="true">*</i><input required type="email" autoComplete="email" maxLength={254} value={values.email} onChange={(e) => set("email", e.target.value)} /></label>
          <label className="wr-field">Phone Number <i aria-hidden="true">*</i><input required type="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={(e) => set("phone", e.target.value)} /></label>
          {!partner && <label className="wr-field">Event Type <i aria-hidden="true">*</i><select required value={values.type} onChange={(e) => set("type", e.target.value)}>
            <option value="">Select an option</option>
            {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select></label>}
          {!partner && <label className="wr-field">Event Date (or Estimated Timeframe) <i aria-hidden="true">*</i><input required type="date" min={minDate} value={values.date} onChange={(e) => set("date", e.target.value)} /><small>Not sure yet? Pick your best guess and mention it below.</small></label>}
          <label className="wr-field">{partner ? "Venue or Business Name, and City" : "Event Location (City/Venue)"} <i aria-hidden="true">*</i><input required maxLength={240} value={values.location} onChange={(e) => set("location", e.target.value)} /></label>
          {!partner && <label className="wr-field">Estimated Guest Count <i aria-hidden="true">*</i><input required type="number" min="1" max="10000" step="1" value={values.guests} onChange={(e) => set("guests", e.target.value)} /></label>}
          <div className="wr-field">
            <span id="services-label">Services You’re Interested In <i aria-hidden="true">*</i></span>
            <details className="wr-multi">
              <summary aria-describedby="services-label">{selected.length ? selected.join(", ") : "Select all that apply"}<ChevronDown size={16} aria-hidden="true" /></summary>
              <fieldset aria-labelledby="services-label">
                {mainServices.map((service) => <label key={service}><input type="checkbox" checked={selected.includes(service)} onChange={() => toggle(service)} />{service}</label>)}
                {barServices.length > 0 && <p>Mobile bar · The Compass Collections</p>}
                {barServices.map((service) => <label key={service}><input type="checkbox" checked={selected.includes(service)} onChange={() => toggle(service)} />{service}</label>)}
                <p>Venues &amp; event professionals</p>
                <label><input type="checkbox" checked={selected.includes(PARTNER_OPTION)} onChange={() => toggle(PARTNER_OPTION)} />{PARTNER_OPTION}</label>
              </fieldset>
            </details>
          </div>
          {!partner && <label className="wr-field full">Estimated Budget <span className="muted">(Optional)</span><select value={values.budget} onChange={(e) => set("budget", e.target.value)}>
            <option value="">Select a range</option>
            {BUDGET_RANGES.map((range) => <option key={range} value={range}>{range}</option>)}
          </select></label>}
          <label className="wr-field full">{partner ? "How Would You Like to Work Together?" : "Tell Us About Your Vision"} <i aria-hidden="true">*</i><textarea required rows={5} maxLength={2800} value={values.notes} onChange={(e) => set("notes", e.target.value)} placeholder={partner ? "Tell us about your venue or business and what your clients usually need…" : "Share any details, ideas, or inspiration for your event…"} /></label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="wr-button wide" type="submit" disabled={busy}>{busy ? "Sending…" : "Send my inquiry"} <ArrowRight size={18} aria-hidden="true" /></button>
        <p className="wr-form-note">Sending this form starts a conversation. Your date is confirmed once we’ve talked through the details together.</p>
      </form>
    </div>
    <section className="wr-next" aria-labelledby="next-title">
      <div><h2 id="next-title">What Happens Next?</h2><Swash /></div>
      <ol>
        <li><Mail size={36} strokeWidth={1.2} aria-hidden="true" /><span>1. {c("inquiry.step1")}</span></li>
        <li><CalendarDays size={36} strokeWidth={1.2} aria-hidden="true" /><span>2. {c("inquiry.step2")}</span></li>
        <li><MessagesSquare size={36} strokeWidth={1.2} aria-hidden="true" /><span>3. {c("inquiry.step3")}</span></li>
      </ol>
    </section>
  </>;
}
