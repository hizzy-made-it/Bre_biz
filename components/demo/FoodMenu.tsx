"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/food-menu";
import type { FoodCategory, FoodMenuItem } from "@/lib/demo-types";

type CategoryFilter = "All dishes" | FoodCategory;

export function FoodMenu({ items, onPlan }: { items: FoodMenuItem[]; onPlan: () => void }) {
  const [category, setCategory] = useState<CategoryFilter>("All dishes");
  const published = useMemo(() => items.filter((item) => item.published), [items]);
  const visible = useMemo(() => category === "All dishes" ? published : published.filter((item) => item.category === category), [published, category]);
  const availableCategories = FOOD_CATEGORIES.filter((value) => published.some((item) => item.category === value));

  return <section className="section food-menu-page" id="food-menu" aria-labelledby="food-menu-title">
    <header className="food-menu-intro">
      <p className="small-label">A table to gather around</p>
      <h1 id="food-menu-title">Food menu</h1>
      <p>Explore a small collection of menu ideas for celebrations and time together.</p>
      <p className="food-menu-disclosure"><strong>Sample concept menu</strong><span>Sample dishes for this concept. Personalize them in your event plan.</span></p>
    </header>

    {published.length > 0 && <nav className="food-menu-filters filter-tabs" aria-label="Filter sample dishes by category">
      <button type="button" className={category === "All dishes" ? "active" : ""} aria-pressed={category === "All dishes"} onClick={() => setCategory("All dishes")}>All dishes</button>
      {availableCategories.map((value) => <button type="button" key={value} className={category === value ? "active" : ""} aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</button>)}
    </nav>}

    {visible.length ? <div className="food-menu-grid">
      {(category === "All dishes" ? availableCategories : [category]).map((group) => {
        const dishes = visible.filter((item) => item.category === group);
        if (!dishes.length) return null;
        return <section className="food-menu-category" key={group} aria-labelledby={`food-menu-category-${group}`}>
          <p className="small-label">A few ideas for the table</p>
          <h2 id={`food-menu-category-${group}`}>{group}</h2>
          <div className="food-menu-category-items">
            {dishes.map((item) => <article className="food-menu-item" key={item.id}>
              <h3>{item.name}</h3>
              {item.description && <p>{item.description}</p>}
              {item.dietaryNotes && <p className="food-menu-dietary"><span>Dietary notes</span> {item.dietaryNotes}</p>}
            </article>)}
          </div>
        </section>;
      })}
    </div> : <div className="empty-state food-menu-empty">
      <h2>{published.length ? "No dishes in this category yet" : "The sample menu is being prepared"}</h2>
      <p>{published.length ? "Choose another category to browse the available sample dishes." : "Check back for menu inspiration, or start a food menu plan with a dish idea of your own."}</p>
      {published.length > 0 && <button className="button secondary" type="button" onClick={() => setCategory("All dishes")}>View all dishes</button>}
    </div>}

    <aside className="food-menu-cta" aria-label="Plan food ideas for an event">
      <div><p className="small-label">Planning a gathering?</p><h2>Shape a menu for your event</h2><p>Save dish ideas and notes in a private demo event plan.</p></div>
      <button className="button primary" type="button" onClick={onPlan}>Plan a menu <ArrowRight size={16} aria-hidden="true" /></button>
    </aside>
  </section>;
}
