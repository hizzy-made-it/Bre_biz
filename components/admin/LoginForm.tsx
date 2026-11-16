"use client";
import { useState, type FormEvent } from "react";

/** Shared sign-in form for the owner admin and the client portal. */
export function LoginForm({ endpoint, fields, submitLabel }: { endpoint: string; fields: { name: string; label: string; type: string; autoComplete: string }[]; submitLabel: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const data = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Sign-in failed");
      location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Sign-in failed"); setBusy(false); }
  }
  return <form className="access-form" onSubmit={submit}>
    {fields.map((field) => <label key={field.name} className="field">{field.label}<input required type={field.type} autoComplete={field.autoComplete} maxLength={254} value={values[field.name] ?? ""} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} /></label>)}
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button primary" disabled={busy}>{busy ? "Signing in…" : submitLabel}</button>
  </form>;
}
