"use client";
import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

const LIBRARY = [
  { path: "/images/celebration.webp", label: "Celebration" },
  { path: "/images/cocktails.webp", label: "Cocktails" },
  { path: "/images/details.webp", label: "Details" },
];

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await response.json() as { path?: string; error?: string };
  if (!response.ok || !data.path) throw new Error(data.error || "Upload failed");
  return data.path;
}

/** One click to upload a new photo, or pick one already on the site. */
export function ImageField({ label, value, onChange, allowEmpty = false }: { label: string; value: string; onChange: (path: string) => void; allowEmpty?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    try { onChange(await uploadImage(file)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Upload failed"); }
    finally { setBusy(false); if (input.current) input.current.value = ""; }
  }
  return <div className="image-field">
    <span className="image-field-label">{label}</span>
    <div className="image-field-row">
      <button type="button" className="image-field-preview" onClick={() => input.current?.click()} aria-label={`Upload a new photo for ${label}`}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void pick(e.dataTransfer.files[0]); }}>
        {value ? <img src={value} alt="" /> : <span><ImagePlus size={22} aria-hidden="true" /> Add photo</span>}
      </button>
      <div className="image-field-actions">
        <button type="button" className="button secondary" disabled={busy} onClick={() => input.current?.click()}><ImagePlus size={15} aria-hidden="true" />{busy ? "Uploading…" : value ? "Replace photo" : "Upload photo"}</button>
        <div className="image-field-library" aria-label="Or choose a site photo">
          {LIBRARY.map((image) => <button type="button" key={image.path} className={value === image.path ? "active" : ""} onClick={() => onChange(image.path)} title={image.label}><img src={image.path} alt={image.label} /></button>)}
        </div>
        {allowEmpty && value && <button type="button" className="text-link" onClick={() => onChange("")}><Trash2 size={13} aria-hidden="true" /> Remove photo</button>}
        <small className="muted">Drag a photo here or click. JPG, PNG, WebP or GIF up to 10 MB.</small>
        {error && <p className="form-error" role="alert">{error}</p>}
      </div>
    </div>
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(e) => void pick(e.target.files?.[0])} />
  </div>;
}
