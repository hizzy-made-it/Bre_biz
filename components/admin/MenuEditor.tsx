"use client";
import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/food-menu";
import { BAR_CATEGORIES, type DemoState } from "@/lib/demo-types";
import { ImageField } from "./ImageField";

type Mutate = (action: string, payload: unknown) => Promise<DemoState>;
type Kind = "food" | "bar";
type Item = { id?: string; name: string; description: string; category: string; price: string; image: string; published: boolean; dietaryNotes?: string };

export function MenuEditor({ state, mutate, busy, onNotice }: { state: DemoState; mutate: Mutate; busy: boolean; onNotice: (t: string) => void }) {
  const [kind, setKind] = useState<Kind>("food");
  const [draft, setDraft] = useState<Item | null>(null);
  const [error, setError] = useState("");
  const items: Item[] = kind === "food" ? state.foodMenu : state.barMenu;
  const categories: readonly string[] = kind === "food" ? FOOD_CATEGORIES : BAR_CATEGORIES;
  const saveAction = kind === "food" ? "saveFoodMenuItem" : "saveBarMenuItem";

  async function save(item: Item, notice: string) {
    setError("");
    try {
      const payload = kind === "food" ? { ...item, dietaryNotes: item.dietaryNotes ?? "" } : { id: item.id, name: item.name, description: item.description, category: item.category, price: item.price, image: item.image, published: item.published };
      await mutate(saveAction, payload);
      onNotice(notice);
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save"); return false; }
  }
  async function remove(item: Item) {
    if (!item.id || !confirm(`Delete “${item.name}” from the menu?`)) return;
    try { await mutate(kind === "food" ? "deleteFoodMenuItem" : "deleteBarMenuItem", { id: item.id }); onNotice("Item deleted"); if (draft?.id === item.id) setDraft(null); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete"); }
  }
  const blank = (): Item => ({ name: "", description: "", category: categories[0], price: "", image: "", published: true, ...(kind === "food" ? { dietaryNotes: "" } : {}) });

  return <section aria-labelledby="menus-title">
    <div className="admin-section-head">
      <div><h2 id="menus-title">Food &amp; bar menus</h2><p className="muted">Add dishes and drinks with a photo and price. The eye icon shows or hides an item on the website instantly.</p></div>
      <div className="admin-actions"><button className="button primary" onClick={() => setDraft(blank())}><Plus size={15} aria-hidden="true" /> Add {kind === "food" ? "dish" : "drink"}</button></div>
    </div>
    <div className="filter-tabs">{(["food", "bar"] as const).map((value) => <button key={value} className={kind === value ? "active" : ""} aria-pressed={kind === value} onClick={() => { setKind(value); setDraft(null); }}>{value === "food" ? `Food menu (${state.foodMenu.length})` : `Bar menu (${state.barMenu.length})`}</button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="studio-split menu-admin">
      <div>
        {categories.map((category) => {
          const group = items.filter((item) => item.category === category);
          return <div key={category} className="menu-admin-group">
            <h3>{category} <span className="muted">({group.length})</span></h3>
            {group.length === 0 && <p className="muted">Nothing here yet.</p>}
            {group.map((item) => <div key={item.id} className={draft?.id === item.id ? "menu-admin-row selected" : "menu-admin-row"}>
              <span className="menu-admin-thumb">{item.image ? <img src={item.image} alt="" /> : <span aria-hidden="true">—</span>}</span>
              <span className="menu-admin-name"><strong>{item.name}</strong><small>{item.price || "No price shown"}</small></span>
              <button className="icon-button" disabled={busy} aria-label={item.published ? `Hide ${item.name} from website` : `Show ${item.name} on website`} title={item.published ? "Shown on website — click to hide" : "Hidden — click to show"}
                onClick={() => void save({ ...item, published: !item.published }, item.published ? "Hidden from website" : "Now on the website")}>{item.published ? <Eye size={17} /> : <EyeOff size={17} className="muted" />}</button>
              <button className="icon-button" aria-label={`Edit ${item.name}`} onClick={() => setDraft({ ...item })}><Pencil size={16} /></button>
              <button className="icon-button" aria-label={`Delete ${item.name}`} disabled={busy} onClick={() => void remove(item)}><Trash2 size={16} /></button>
            </div>)}
          </div>;
        })}
      </div>
      <div className="editor-panel">
        {draft ? <form onSubmit={(e) => { e.preventDefault(); void save(draft, draft.id ? "Menu item saved" : "Added to the menu").then((ok) => { if (ok) setDraft(null); }); }}>
          <h2>{draft.id ? "Edit item" : kind === "food" ? "New dish" : "New drink"}</h2>
          <div className="form-grid">
            <label className="field full-width">Name<input required maxLength={120} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label className="field">Category<select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="field">Price <span className="muted">(as shown)</span><input maxLength={60} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="$12 / guest" /></label>
            <label className="field full-width">Description<textarea rows={3} maxLength={500} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
            {kind === "food" && <label className="field full-width">Dietary notes<input maxLength={300} value={draft.dietaryNotes ?? ""} onChange={(e) => setDraft({ ...draft, dietaryNotes: e.target.value })} placeholder="Contains dairy…" /></label>}
            <div className="full-width"><ImageField label="Photo" value={draft.image} allowEmpty onChange={(image) => setDraft({ ...draft, image })} /></div>
            <label className="field full-width check-field"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> Show on the website</label>
          </div>
          <div className="form-actions"><button type="button" className="button secondary" onClick={() => setDraft(null)}>Cancel</button><button className="button primary" disabled={busy}><Save size={15} aria-hidden="true" /> Save</button></div>
        </form> : <div className="editor-placeholder"><h3>Pick an item to edit</h3><p className="muted">Or add a new {kind === "food" ? "dish" : "drink"} with the button above.</p></div>}
      </div>
    </div>
  </section>;
}
