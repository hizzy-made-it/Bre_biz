import type { FoodMenuItem } from "./demo-types";

export const FOOD_CATEGORIES = ["Appetizers", "Mains", "Sides", "Desserts"] as const;

/** Fictional examples for the demo menu; descriptions avoid certification claims. */
export function createFoodMenuSeed(): FoodMenuItem[] {
  return [
    { id: "food-herbed-goat-cheese", name: "Herbed goat cheese crostini", description: "Whipped goat cheese, garden herbs, and roasted tomato on toasted baguette.", category: "Appetizers", dietaryNotes: "Contains dairy and wheat.", published: true },
    { id: "food-roasted-carrot", name: "Maple-roasted carrot bites", description: "Roasted baby carrots with orange, thyme, and toasted pepitas.", category: "Appetizers", dietaryNotes: "Contains pepitas.", published: true },
    { id: "food-lemon-chicken", name: "Lemon herb chicken", description: "Roasted chicken with lemon, parsley, and a light pan jus.", category: "Mains", dietaryNotes: "Prepared with chicken stock.", published: true },
    { id: "food-mushroom-risotto", name: "Wild mushroom risotto", description: "Creamy arborio rice with roasted mushrooms and fresh herbs.", category: "Mains", dietaryNotes: "Contains dairy; made with vegetable stock in this sample.", published: true },
    { id: "food-crispy-potatoes", name: "Crispy rosemary potatoes", description: "Golden potatoes tossed with rosemary and flaky salt.", category: "Sides", dietaryNotes: "No dietary notes supplied; confirm preparation details with the caterer.", published: true },
    { id: "food-market-greens", name: "Market greens salad", description: "Seasonal greens, sliced pear, and a bright cider vinaigrette.", category: "Sides", dietaryNotes: "Dressing ingredients should be confirmed with the caterer.", published: true },
    { id: "food-berry-shortcake", name: "Berry shortcake cups", description: "Vanilla cream and fresh berries layered with tender shortcake.", category: "Desserts", dietaryNotes: "Contains dairy and wheat.", published: true },
    { id: "food-chocolate-tart", name: "Dark chocolate tartlets", description: "Small chocolate ganache tarts finished with seasonal berries.", category: "Desserts", dietaryNotes: "Contains dairy and wheat.", published: true },
  ];
}
