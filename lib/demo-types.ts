export type InquiryStatus = "new" | "contacted" | "confirmed" | "declined";
export type EventTask = { id: string; title: string; done: boolean };
export type EventTimelineItem = { id: string; time: string; title: string };
export type EventBudgetItem = {
  id: string;
  name: string;
  estimated: number;
  actual: number;
};

export type FoodCategory = "Appetizers" | "Mains" | "Sides" | "Desserts";
export type FoodMenuItem = {
  id: string;
  name: string;
  description: string;
  category: FoodCategory;
  dietaryNotes: string;
  published: boolean;
  price: string;
  image: string;
};
export const BAR_CATEGORIES = ["Signature cocktails", "Mocktails", "Beer & wine", "Bar packages"] as const;
export type BarCategory = (typeof BAR_CATEGORIES)[number];
export type BarMenuItem = {
  id: string;
  name: string;
  description: string;
  category: BarCategory;
  price: string;
  image: string;
  published: boolean;
};
export type ServiceItem = { title: string; description: string; details: string; price: string; image?: string };
export type ClientStatus = "lead" | "booked" | "completed" | "cancelled";
export type ClientUpdate = { id: string; at: string; message: string };
export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventTitle: string;
  service: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  guests: number;
  status: ClientStatus;
  total: number;
  deposit: number;
  internalNotes: string;
  clientNotes: string;
  eventId: string | null;
  portalCode: string;
  updates: ClientUpdate[];
  createdAt: string;
};
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type Payment = {
  id: string;
  clientId: string;
  amount: number;
  method: "card" | "cash" | "check" | "other";
  status: PaymentStatus;
  note: string;
  stripeSessionId: string;
  createdAt: string;
};
export type EventFoodItem = {
  id: string;
  menuItemId: string | null;
  name: string;
  category: FoodCategory;
  notes: string;
};

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  service: string;
  date: string;
  time: string;
  guests: number;
  location: string;
  budget: string;
  notes: string;
  status: InquiryStatus;
  createdAt: string;
  eventId: string | null;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  venue: string;
  guests: number;
  notes: string;
  drinks: string[];
  tasks: EventTask[];
  timeline: EventTimelineItem[];
  budgetItems: EventBudgetItem[];
  foods: EventFoodItem[];
};

export type Post = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  body: string;
  image: string;
  published: boolean;
  readTime: string;
};

export type Highlight = {
  id: string;
  title: string;
  category: HighlightCategory;
  description: string;
  image: string;
  guests: number;
  /** True for inspiration imagery, false for photos from Wander & Revel's own events. */
  inspiration?: boolean;
};
export const HIGHLIGHT_CATEGORIES = [
  "Weddings",
  "Community Events",
  "Decor & Rentals",
  "Bar Service",
  "Events",
  "Mobile bar services",
  "Private celebrations",
  "Event details",
  "Behind the scenes",
  "Markets",
  "Private parties",
  "Corporate",
  "Venue Management",
  "Private Parties",
  "Halloween",
] as const;
/** Gallery groups shown as tabs, in order; older categories still show after these when used. */
export const GALLERY_CATEGORIES = ["Weddings", "Community Events", "Venue Management", "Private Parties", "Halloween", "Decor & Rentals", "Bar Service", "Events"] as const;
export type HighlightCategory = (typeof HIGHLIGHT_CATEGORIES)[number];

export type DemoState = {
  inquiries: Inquiry[];
  events: Event[];
  posts: Post[];
  highlights: Highlight[];
  foodMenu: FoodMenuItem[];
  barMenu: BarMenuItem[];
  services: ServiceItem[];
  content: Record<string, string>;
  clients: Client[];
  payments: Payment[];
};
/** What anonymous visitors receive: no inquiries, events, clients or payments. */
export type PublicSite = Pick<DemoState, "posts" | "highlights" | "foodMenu" | "barMenu" | "services" | "content"> & { bookedSlots: { date: string; time: string }[] };

export type DemoActionRequest = {
  action: string;
  payload: unknown;
  version: number;
};

export type DemoStateResponse = { state: DemoState; version: number };
