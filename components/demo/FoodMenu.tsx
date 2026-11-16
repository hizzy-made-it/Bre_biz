"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/food-menu";
import { BAR_CATEGORIES, type BarMenuItem, type FoodMenuItem } from "@/lib/demo-types";
import { readContent } from "@/lib/site-defaults";

type MenuKind = "Food" | "Bar";
type Dish = { id: string; name: string; description: string; category: string; price: string; image: string; dietaryNotes?: string };

/** Public food & bar menus. Only published items reach this component. */
export function FoodMenu({ items, barItems, content, onInquire }: { items: FoodMenuItem[]; barItems: BarMenuItem[]; content: Record<string, string>; onInquire: () => void }) {
  const hasBar = barItems.length > 0;
  const [kind, setKind] = useState<MenuKind>("Food");
  const [category, setCategory] = useState("All");
  const c = (key: string) => readContent(content, key);
  const list: Dish[] = kind === "Food" ? items : barItems;
  const categories: readonly string[] = (kind === "Food" ? FOOD_CATEGORIES : BAR_CATEGORIES).filter((value) => list.some((item) => item.category === value));
  const visible = useMemo(() => category === "All" ? list : list.filter((item) => item.category === category), [list, category]);
  const switchKind = (next: MenuKind) => { setKind(next); setCategory("All"); };

  return <section className="section food-menu-page" id="food-menu" aria-labelledby="food-menu-title">
    <header className="food-menu-intro">
      <p className="small-label">A table to gather around</p>
      <h1 id="food-menu-title">{kind === "Food" ? c("food.title") : c("bar.title")}</h1>
      <p>{kind === "Food" ? c("food.lead") : c("bar.lead")}</p>
      {c("menu.note") && <p className="food-menu-disclosure"><span>{c("menu.note")}</span></p>}
    </header>

    {hasBar && <nav className="filter-tabs menu-kind-tabs" aria-label="Choose a menu">
      {(["Food", "Bar"] as const).map((value) => <button type="button" key={value} className={kind === value ? "active" : ""} aria-pressed={kind === value} onClick={() => switchKind(value)}>{value === "Food" ? "Food menu" : "Bar menu"}</button>)}
    </nav>}

    {list.length > 0 && <nav className="food-menu-filters filter-tabs" aria-label="Filter by category">
      <button type="button" className={category === "All" ? "active" : ""} aria-pressed={category === "All"} onClick={() => setCategory("All")}>Everything</button>
      {categories.map((value) => <button type="button" key={value} className={category === value ? "active" : ""} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
    </nav>}

    {visible.length ? <div className="food-menu-grid">
      {(category === "All" ? categories : [category]).map((group) => {
        const dishes = visible.filter((item) => item.category === group);
        if (!dishes.length) return null;
        return <section className="food-menu-category" key={group} aria-labelledby={`menu-category-${group}`}>
          <h2 id={`menu-category-${group}`}>{group}</h2>
          <div className="food-menu-category-items">
            {dishes.map((item) => <article className={item.image ? "food-menu-item has-image" : "food-menu-item"} key={item.id}>
              {item.image && <img src={item.image} alt="" loading="lazy" className="menu-item-image" />}
              <div>
                <div className="menu-item-heading"><h3>{item.name}</h3>{item.price && <span className="menu-price">{item.price}</span>}</div>
                {item.description && <p>{item.description}</p>}
                {item.dietaryNotes && <p className="food-menu-dietary"><span>Dietary notes</span> {item.dietaryNotes}</p>}
              </div>
            </article>)}
          </div>
        </section>;
      })}
    </div> : <div className="empty-state food-menu-empty">
      <h2>The menu is being prepared</h2>
      <p>Check back soon, or tell us what you have in mind and we’ll shape a menu around it.</p>
    </div>}

    <aside className="food-menu-cta" aria-label="Plan a menu for your event">
      <div><p className="small-label">Planning a gathering?</p><h2>Let’s shape a menu for your event</h2><p>Share your date, guest count and favorites. We’ll put together a personalized proposal.</p></div>
      <button className="button primary" type="button" onClick={onInquire}>Start an inquiry <ArrowRight size={16} aria-hidden="true" /></button>
    </aside>
  </section>;
}
