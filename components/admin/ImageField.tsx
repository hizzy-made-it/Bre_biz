"use client";
import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

const LIBRARY = [
  { path: "/images/celebration.webp", label: "Celebration" },
  { path: "/images/cocktails.webp", label: "Cocktails" },
  { path: "/images/details.webp", label: "Details" },
  { path: "/images/wr/balloon-door.webp", label: "Balloon door" },
  { path: "/images/wr/lake-wedding-lawn.webp", label: "A lake wedding" },
  { path: "/images/wr/lake-wedding-gazebo.webp", label: "Vows in the gazebo" },
  { path: "/images/wr/lake-wedding-vows.webp", label: "Exchanging vows" },
  { path: "/images/wr/lake-wedding-kiss.webp", label: "The first kiss" },
  { path: "/images/wr/lake-wedding-couple.webp", label: "Mr. and Mrs." },
  { path: "/images/wr/lake-wedding-family.webp", label: "Family by the lake" },
  { path: "/images/wr/lake-wedding-pup.webp", label: "The whole crew" },
  { path: "/images/wr/beach-sweetheart-table.webp", label: "Sweetheart table at sunset" },
  { path: "/images/wr/beach-arch-kiss.webp", label: "Under the floral arch" },
  { path: "/images/wr/beach-ceremony-guests.webp", label: "Ceremony on the beach" },
  { path: "/images/wr/beach-couple.webp", label: "By the water" },
  { path: "/images/wr/beach-toast.webp", label: "A toast to the newlyweds" },
  { path: "/images/wr/beach-table-setting.webp", label: "Reception table" },
  { path: "/images/wr/beach-cake.webp", label: "The wedding cake" },
  { path: "/images/wr/beach-reception-night.webp", label: "Reception under the lights" },
  { path: "/images/wr/hall-long-table.webp", label: "Chandeliers and long tables" },
  { path: "/images/wr/hall-table-setting.webp", label: "Set for dinner" },
  { path: "/images/wr/hall-floral-reception.webp", label: "A floral reception" },
  { path: "/images/wr/hall-red-cake.webp", label: "A celebration cake" },
  { path: "/images/wr/hall-buffet.webp", label: "Reception buffet" },
  { path: "/images/wr/venue-ceremony-gold.webp", label: "Ceremony set" },
  { path: "/images/wr/venue-ceremony-wood.webp", label: "Ready for guests" },
  { path: "/images/wr/venue-reception.webp", label: "Reception dinner" },
  { path: "/images/wr/venue-table.webp", label: "Table details" },
  { path: "/images/wr/venue-head-table.webp", label: "Head table" },
  { path: "/images/wr/venue-cake.webp", label: "Cake and cupcakes" },
  { path: "/images/wr/venue-cupcakes.webp", label: "Cupcake table" },
  { path: "/images/wr/venue-dessert-table.webp", label: "Dessert table" },
  { path: "/images/wr/venue-sweets.webp", label: "Sweets bar" },
  { path: "/images/wr/venue-welcome-cupcakes.webp", label: "Welcome treats" },
  { path: "/images/wr/fair-fox9.webp", label: "As seen on Fox 9" },
  { path: "/images/wr/fair-hall-wide.webp", label: "The fair in full swing" },
  { path: "/images/wr/fair-heart-door.webp", label: "Heart balloon door" },
  { path: "/images/wr/fair-photo-booth.webp", label: "Photo booth fun" },
  { path: "/images/wr/puppy-party.webp", label: "Puppy party" },
  { path: "/images/wr/brunch-table.webp", label: "Brunch spread" },
  { path: "/images/wr/patio-brunch.webp", label: "Patio brunch" },
  { path: "/images/wr/patio-table.webp", label: "Long table on the patio" },
  { path: "/images/wr/dessert-truffles.webp", label: "Dessert display" },
  { path: "/images/wr/cake-topper.webp", label: "Little details" },
  { path: "/images/wr/halloween-mummy.webp", label: "The mummy’s coffin" },
  { path: "/images/wr/halloween-vanity.webp", label: "A haunted vanity" },
  { path: "/images/wr/halloween-cabinet.webp", label: "The curiosity cabinet" },
  { path: "/images/wr/halloween-skeletons.webp", label: "Skeleton shelves" },
  { path: "/images/wr/halloween-potions.webp", label: "Potion cart" },
  { path: "/images/wr/halloween-broom-co.webp", label: "Salem Broom Co." },
  { path: "/images/wr/donut-display.webp", label: "Donut display" },
  { path: "/images/wr/floral-arch.webp", label: "Floral arch" },
  { path: "/images/wr/candelabra-table.webp", label: "Candelabras" },
  { path: "/images/wr/vintage-dresser.webp", label: "Vintage pieces" },
  { path: "/images/wr/white-cabinet.webp", label: "Display cabinet" },
  { path: "/images/wr/balloon-wall.webp", label: "Balloon wall" },
  { path: "/images/wr/dessert-table.webp", label: "Dessert table" },
  { path: "/images/wr/fair-aisle.webp", label: "Fair aisle" },
  { path: "/images/wr/fair-aisle-candles.webp", label: "Fair aisle candles" },
  { path: "/images/wr/fair-apothecary.webp", label: "Fair apothecary" },
  { path: "/images/wr/fair-beauty-booth.webp", label: "Fair beauty booth" },
  { path: "/images/wr/fair-blankets.webp", label: "Fair blankets" },
  { path: "/images/wr/fair-florist.webp", label: "Fair florist" },
  { path: "/images/wr/fair-hall.webp", label: "Fair hall" },
  { path: "/images/wr/fair-hall-draped.webp", label: "Fair hall draped" },
  { path: "/images/wr/fair-kids-booth.webp", label: "Fair kids booth" },
  { path: "/images/wr/fair-shoppers.webp", label: "Fair shoppers" },
  { path: "/images/wr/fair-vendor.webp", label: "Fair vendor" },
  { path: "/images/wr/photo-booth.webp", label: "Photo booth" },
  { path: "/images/wr/wedding-ceremony.webp", label: "Wedding ceremony" },
  { path: "/images/wr/wedding-couple-arch.webp", label: "Wedding couple arch" },
  { path: "/images/wr/wedding-couple-shore.webp", label: "Wedding couple shore" },
  { path: "/images/wr/wedding-guests.webp", label: "Wedding guests" },
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
