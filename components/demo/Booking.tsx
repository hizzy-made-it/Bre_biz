"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Check, Clock3, ShieldCheck } from "lucide-react";
import type { PublicSite } from "@/lib/demo-types";

type Created = { type: string; date: string; time: string; guests: number; location: string };

type Service = string;
type BookingValues = {
  service: Service;
  type: string;
  date: string;
  time: string;
  guests: string;
  location: string;
  budget: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const legacyServices: Service[] = ["Event planning", "Planning + bar"];
const times = ["14:00", "15:00", "16:00", "17:00", "17:30", "18:00", "18:30", "19:00"];

const initialValues = (service: string, services: string[]): BookingValues => ({
  service: [...services, ...legacyServices].includes(service) ? service : services[0] ?? "",
  type: "", date: "", time: "", guests: "", location: "", budget: "",
  name: "", email: "", phone: "", notes: "",
});

function localDateString(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function Booking({ initialService, site, onSaved }: {
  initialService: string;
  site: PublicSite;
  onSaved: (site: PublicSite) => void;
}) {
  const services = site.services.map((service) => service.title);
  const [values, setValues] = useState<BookingValues>(() => initialValues(initialService, services));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [website, setWebsite] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const serviceOptions = legacyServices.includes(initialService) && !services.includes(initialService)
    ? [...services, initialService]
    : services;
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localDateString(tomorrow);
  }, []);
  const unavailable = useMemo(() => new Set(site.bookedSlots
    .filter((slot) => slot.date === values.date)
    .map((slot) => slot.time)), [site.bookedSlots, values.date]);

  const set = (key: keyof BookingValues, value: string) => setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || created) return;
    setError("");
    if (unavailable.has(values.time)) {
      setError("That date and time is already booked. Please choose another time.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(),
          type: values.type.trim(), service: values.service, date: values.date, time: values.time,
          guests: Number(values.guests), location: values.location.trim(), budget: values.budget.trim(), notes: values.notes.trim(), website,
        }),
      });
      const data = await response.json() as { error?: string; inquiry?: Created; site?: PublicSite };
      if (!response.ok) throw new Error(data.error || "We couldn't send your inquiry. Please try again.");
      if (data.site) onSaved(data.site);
      setCreated(data.inquiry ?? { type: values.type, date: values.date, time: values.time, guests: Number(values.guests), location: values.location });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't send your inquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return <section className="booking-shell" aria-labelledby="booking-success-title">
      <div className="success-state">
        <span className="success-icon"><Check aria-hidden="true" /></span>
        <p className="small-label">Inquiry received</p>
        <h1 id="booking-success-title">Thank you for sharing your story.</h1>
        <p>We’ve received your details and will be in touch soon to talk through your plans. Your date is not reserved until we confirm it with you.</p>
        <div className="panel booking-confirmation">
          <strong>{created.type}</strong><span>{created.date} · {timeLabel(created.time)}</span>
          <span>{created.guests} guests · {created.location}</span>
        </div>
        <a className="button secondary" href="#home">Back to home</a>
      </div>
    </section>;
  }

  return <div className="booking-shell inquiry-shell">
    <aside className="booking-aside">
      <p className="small-label">Wander &amp; Revel Event Services</p>
      <p className="inquiry-tagline">A Place for Every Story</p>
      <h1>Tell us your story.</h1>
      <p>Share a few details about the gathering you have in mind.</p>
      <div className="booking-note"><ShieldCheck size={19} aria-hidden="true" /><span>Sending this form starts a conversation. Your date is confirmed once we’ve talked through the details together.</span></div>
    </aside>
    <div className="booking-main inquiry-main">
      <form className="inquiry-form" onSubmit={submit}>
        <label className="visually-hidden" aria-hidden="true">Leave this empty<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
        <section className="inquiry-section" aria-labelledby="inquiry-service-title">
          <p className="small-label">Your event</p>
          <h2 id="inquiry-service-title">What are you dreaming up?</h2>
          <label className="field inquiry-fieldset">Service you need<select required value={values.service} onChange={(event) => set("service", event.target.value)}>
            {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
          </select></label>
          <div className="form-grid">
            <label className="field full-width">What are you celebrating?<input required maxLength={100} value={values.type} onChange={(e) => set("type", e.target.value)} placeholder="A wedding, birthday, or just because…" /></label>
            <label className="field">Event date<input required type="date" min={minDate} value={values.date} onChange={(e) => { set("date", e.target.value); set("time", ""); }} /></label>
            <label className="field">Approximate start time<select required value={values.time} onChange={(e) => set("time", e.target.value)} disabled={!values.date}>
              <option value="">{values.date ? "Choose a start time" : "Choose a date first"}</option>
              {times.map((time) => <option key={time} value={time} disabled={unavailable.has(time)}>{timeLabel(time)}{unavailable.has(time) ? " · unavailable" : ""}</option>)}
            </select><small className="muted"><Clock3 size={13} aria-hidden="true" /> Need a different time? Mention it in the notes.</small></label>
            <label className="field">Estimated guest count<input required type="number" min="1" max="10000" step="1" value={values.guests} onChange={(e) => set("guests", e.target.value)} placeholder="e.g. 60" /></label>
            <label className="field">Location or venue<input required maxLength={240} value={values.location} onChange={(e) => set("location", e.target.value)} placeholder="Venue name or city" /></label>
            <label className="field full-width">Approximate budget <span className="muted">(optional)</span><input maxLength={100} value={values.budget} onChange={(e) => set("budget", e.target.value)} placeholder="A range, if you have one" /></label>
          </div>
        </section>
        <section className="inquiry-section" aria-labelledby="inquiry-contact-title">
          <p className="small-label">Your details</p>
          <h2 id="inquiry-contact-title">How can we reach you?</h2>
          <div className="form-grid">
            <label className="field full-width">Your name<input required autoComplete="name" maxLength={120} value={values.name} onChange={(e) => set("name", e.target.value)} /></label>
            <label className="field">Email address<input required type="email" autoComplete="email" maxLength={254} value={values.email} onChange={(e) => set("email", e.target.value)} /></label>
            <label className="field">Phone <span className="muted">(optional)</span><input type="tel" autoComplete="tel" maxLength={40} value={values.phone} onChange={(e) => set("phone", e.target.value)} /></label>
            <label className="field full-width">Anything else you’d like to share? <span className="muted">(optional)</span><textarea rows={4} maxLength={3000} value={values.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Style, accessibility needs, or any other helpful details" /></label>
          </div>
        </section>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="form-actions">
          <p className="muted inquiry-disclosure">We’ll reply by email or phone.</p>
          <button className="button primary" type="submit" disabled={busy}>{busy ? "Sending…" : "Send inquiry"} <ArrowRight size={16} aria-hidden="true" /></button>
        </div>
      </form>
    </div>
  </div>;
}

function timeLabel(time: string) {
  const [hourText, minute] = time.split(":");
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}
