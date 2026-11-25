import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { getSqlite } from "../db";
import { createDemoSeed } from "./demo-seed";
import { createFoodMenuSeed, FOOD_CATEGORIES } from "./food-menu";
import { CONTENT_FIELDS, DEFAULT_HIGHLIGHTS, DEFAULT_SERVICES, inquiryServiceOptions, LEGACY_SERVICES, ORIGINAL_SERVICE_TITLES, PARTNER_OPTION, PREVIOUS_SERVICE_TITLES } from "./site-defaults";
import {
  BAR_CATEGORIES,
  HIGHLIGHT_CATEGORIES,
  type BarMenuItem,
  type Client,
  type ClientStatus,
  type DemoActionRequest,
  type DemoState,
  type DemoStateResponse,
  type Event,
  type EventBudgetItem,
  type EventFoodItem,
  type EventTask,
  type EventTimelineItem,
  type Highlight,
  type FoodCategory,
  type FoodMenuItem,
  type Inquiry,
  type InquiryStatus,
  type Payment,
  type Post,
  type PublicSite,
  type ServiceItem,
} from "./demo-types";

export const SITE_KEY = "site";
const MAX_BODY_BYTES = 128 * 1024;
const STATUSES = ["new", "contacted", "confirmed", "declined"] as const;
const IMAGE_PATHS = [
  "/images/celebration.webp",
  "/images/cocktails.webp",
  "/images/details.webp",
] as const;
/** Wander & Revel event photos shipped with the site, in public/images/wr. */
const SITE_PHOTO_PATH = /^\/images\/wr\/[a-z0-9-]+\.webp$/;
const UPLOAD_PATH = /^\/api\/media\/[0-9a-f-]{36}\.(?:jpg|png|webp|gif)$/;
const CLIENT_TIME_ZONE = "America/New_York";

export class ValidationError extends Error {}

export function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(
  value: unknown,
  label: string,
  max: number,
  min = 1,
): string {
  if (typeof value !== "string") throw new ValidationError(`${label} must be text`);
  const result = value.trim();
  if (result.length < min) throw new ValidationError(`${label} is required`);
  if (result.length > max) throw new ValidationError(`${label} is too long`);
  if (/<\s*\/?\s*[a-z][^>]*>/i.test(result)) {
    throw new ValidationError(`${label} cannot contain HTML`);
  }
  return result;
}

function optionalString(value: unknown, label: string, max: number): string {
  if (value === undefined || value === null || value === "") return "";
  return requiredString(value, label, max, 0);
}

function oneOf<const Values extends readonly string[]>(
  value: unknown,
  values: Values,
  label: string,
): Values[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new ValidationError(`${label} is invalid`);
  }
  return value as Values[number];
}

function integerInRange(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new ValidationError(`${label} must be a whole number from ${min} to ${max}`);
  }
  return value;
}

function money(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 10_000_000) {
    throw new ValidationError(`${label} must be a valid non-negative amount`);
  }
  return Math.round(value * 100) / 100;
}

function validDate(value: unknown, label: string): string {
  const date = requiredString(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError(`${label} must use YYYY-MM-DD format`);
  }
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new ValidationError(`${label} is not a valid calendar date`);
  }
  return date;
}

function currentClientDate(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CLIENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function validTime(value: unknown, label: string): string {
  const time = requiredString(value, label, 5);
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new ValidationError(`${label} must use 24-hour HH:MM format`);
  }
  return time;
}

function validId(value: unknown, label = "id"): string {
  const id = requiredString(value, label, 100);
  if (!/^[\w.-]+$/.test(id)) throw new ValidationError(`${label} is invalid`);
  return id;
}

export function validImage(value: unknown, allowEmpty = false): string {
  if (allowEmpty && (value === "" || value === undefined || value === null)) return "";
  if (typeof value === "string" && (IMAGE_PATHS.includes(value as (typeof IMAGE_PATHS)[number]) || SITE_PHOTO_PATH.test(value) || UPLOAD_PATH.test(value))) return value;
  throw new ValidationError("image must be a supplied site image or an uploaded photo");
}

export function validateInquiryInput(payload: Record<string, unknown>, serviceTitles: readonly string[]): Omit<Inquiry, "id" | "createdAt" | "eventId" | "status"> {
  const name = requiredString(payload.name, "name", 120);
  const email = requiredString(payload.email, "email", 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("email must be a valid email address");
  }
  const service = oneOf(payload.service, [...serviceTitles, ...LEGACY_SERVICES], "service");
  const type = payload.type === undefined || payload.type === null || payload.type === ""
    ? (service === PARTNER_OPTION ? "Partnership inquiry" : "Event inquiry")
    : requiredString(payload.type, "type", 100);
  const common = {
    name,
    email,
    phone: optionalString(payload.phone, "phone", 40),
    type,
    service,
    location: requiredString(payload.location, "location", 240),
    budget: optionalString(payload.budget, "budget", 100),
    notes: optionalString(payload.notes, "notes", 3000),
  };
  // Venues and vendors asking to partner have no event date or guest count.
  if (service === PARTNER_OPTION) return { ...common, date: "", time: "", guests: 0 };
  const date = validDate(payload.date, "date");
  if (date <= currentClientDate()) {
    throw new ValidationError("date must be in the future");
  }
  return {
    ...common,
    date,
    // A start time is optional; without one the date alone is held for the conversation.
    time: payload.time === undefined || payload.time === null || payload.time === "" ? "" : validTime(payload.time, "time"),
    guests: integerInRange(payload.guests, "guests", 1, 10000),
  };
}

function validateEvent(value: unknown): Event {
  if (!isRecord(value)) throw new ValidationError("event must be an object");
  const list = <T>(raw: unknown, label: string, max: number, parse: (item: unknown) => T): T[] => {
    if (!Array.isArray(raw) || raw.length > max) throw new ValidationError(`${label} must be a list of at most ${max} items`);
    return raw.map(parse);
  };
  const tasks = list<EventTask>(value.tasks, "tasks", 100, (raw) => {
    if (!isRecord(raw) || typeof raw.done !== "boolean") throw new ValidationError("each task needs a title and done flag");
    return { id: validId(raw.id, "task id"), title: requiredString(raw.title, "task title", 180), done: raw.done };
  });
  const timeline = list<EventTimelineItem>(value.timeline, "timeline", 100, (raw) => {
    if (!isRecord(raw)) throw new ValidationError("each timeline item must be an object");
    return { id: validId(raw.id, "timeline id"), time: validTime(raw.time, "timeline time"), title: requiredString(raw.title, "timeline title", 180) };
  });
  const budgetItems = list<EventBudgetItem>(value.budgetItems, "budgetItems", 100, (raw) => {
    if (!isRecord(raw)) throw new ValidationError("each budget item must be an object");
    return {
      id: validId(raw.id, "budget id"),
      name: requiredString(raw.name, "budget item name", 120),
      estimated: money(raw.estimated, "estimated"),
      actual: money(raw.actual, "actual"),
    };
  });
  const drinks = list<string>(value.drinks, "drinks", 100, (raw) => requiredString(raw, "drink", 120));
  const foodIds = new Set<string>();
  const foods = list<EventFoodItem>(value.foods, "foods", 100, (raw) => {
    if (!isRecord(raw)) throw new ValidationError("each food selection must be an object");
    const id = validId(raw.id, "food selection id");
    if (foodIds.has(id)) throw new ValidationError("food selection ids must be unique");
    foodIds.add(id);
    return {
      id,
      menuItemId: raw.menuItemId === null ? null : validId(raw.menuItemId, "menu item id"),
      name: requiredString(raw.name, "food selection name", 120),
      category: oneOf(raw.category, FOOD_CATEGORIES, "food category") as FoodCategory,
      notes: optionalString(raw.notes, "food selection notes", 500),
    };
  });
  return {
    id: validId(value.id, "event id"),
    title: requiredString(value.title, "event title", 160),
    date: validDate(value.date, "event date"),
    venue: requiredString(value.venue, "venue", 240),
    guests: integerInRange(value.guests, "guests", 1, 10000),
    notes: optionalString(value.notes, "notes", 3000),
    drinks,
    tasks,
    timeline,
    budgetItems,
    foods,
  };
}

function validateFoodMenuItem(value: unknown): Omit<FoodMenuItem, "id"> & { id?: string } {
  if (!isRecord(value)) throw new ValidationError("food menu item must be an object");
  if (typeof value.published !== "boolean") throw new ValidationError("published must be true or false");
  return {
    ...(value.id === undefined ? {} : { id: validId(value.id, "food menu item id") }),
    name: requiredString(value.name, "food name", 120),
    description: optionalString(value.description, "food description", 500),
    category: oneOf(value.category, FOOD_CATEGORIES, "food category") as FoodCategory,
    dietaryNotes: optionalString(value.dietaryNotes, "dietary notes", 300),
    published: value.published,
    price: optionalString(value.price, "price", 60),
    image: validImage(value.image, true),
  };
}

function validatePost(value: unknown): Omit<Post, "id"> & { id?: string } {
  if (!isRecord(value)) throw new ValidationError("post must be an object");
  if (typeof value.published !== "boolean") throw new ValidationError("published must be true or false");
  return {
    ...(value.id === undefined ? {} : { id: validId(value.id, "post id") }),
    title: requiredString(value.title, "title", 180),
    category: requiredString(value.category, "category", 60),
    excerpt: requiredString(value.excerpt, "excerpt", 500),
    body: requiredString(value.body, "body", 20000),
    image: validImage(value.image),
    published: value.published,
    readTime: requiredString(value.readTime, "readTime", 40),
  };
}

function validateHighlight(value: unknown): Omit<Highlight, "id"> & { id?: string } {
  if (!isRecord(value)) throw new ValidationError("highlight must be an object");
  return {
    ...(value.id === undefined ? {} : { id: validId(value.id, "highlight id") }),
    title: requiredString(value.title, "title", 180),
    category: oneOf(value.category, HIGHLIGHT_CATEGORIES, "category"),
    description: requiredString(value.description, "description", 1000),
    image: validImage(value.image),
    guests: integerInRange(value.guests, "guests", 1, 10000),
    inspiration: value.inspiration === undefined ? true : value.inspiration === true,
  };
}

export function updateState(state: DemoState, request: DemoActionRequest): DemoState {
  if (!isRecord(request.payload)) throw new ValidationError("payload must be an object");
  const payload = request.payload;
  switch (request.action) {
    case "createInquiry": {
      const input = validateInquiryInput(payload, inquiryServiceOptions(state.services, state.content));
      if (input.service === PARTNER_OPTION) {
        const inquiry: Inquiry = { ...input, id: crypto.randomUUID(), status: "new", createdAt: new Date().toISOString(), eventId: null };
        return { ...state, inquiries: [inquiry, ...state.inquiries] };
      }
      const busy = state.inquiries.some((inquiry) =>
        inquiry.status !== "declined" && input.time !== "" && inquiry.date === input.date && inquiry.time === input.time,
      );
      if (busy) throw new ValidationError("That date and time are already booked");
      const id = crypto.randomUUID();
      const eventId = crypto.randomUUID();
      const event: Event = {
        id: eventId,
        title: `${input.type} · ${input.name}`,
        date: input.date,
        venue: input.location,
        guests: input.guests,
        notes: input.notes || `Created from the website inquiry. Requested service: ${input.service}.`,
        drinks: [],
        tasks: [
          { id: crypto.randomUUID(), title: "Confirm event details with the host", done: false },
          { id: crypto.randomUUID(), title: "Prepare a service and setup plan", done: false },
        ],
        timeline: input.time ? [{ id: crypto.randomUUID(), time: input.time, title: "Event start" }] : [],
        budgetItems: [],
        foods: [],
      };
      const inquiry: Inquiry = {
        ...input,
        id,
        status: "new",
        createdAt: new Date().toISOString(),
        eventId,
      };
      return { ...state, inquiries: [inquiry, ...state.inquiries], events: [event, ...state.events] };
    }
    case "updateInquiry": {
      const id = validId(payload.id, "inquiry id");
      const status = oneOf(payload.status, STATUSES, "status") as InquiryStatus;
      const target = state.inquiries.find((item) => item.id === id);
      if (!target) throw new ValidationError("inquiry not found");
      if (status !== "declined" && state.inquiries.some((item) =>
        item.id !== id && item.status !== "declined" && target.time !== "" && item.date === target.date && item.time === target.time,
      )) throw new ValidationError("That date and time are already booked");
      return { ...state, inquiries: state.inquiries.map((item) => item.id === id ? { ...item, status } : item) };
    }
    case "updateEvent": {
      const previous = state.events.find((item) => item.id === payload.id);
      if (!previous) throw new ValidationError("event not found");
      // Older open clients do not send the food field. Preserve the current snapshot.
      const event = validateEvent({ ...payload, foods: payload.foods === undefined ? previous.foods : payload.foods });
      const linkedInquiries = state.inquiries.filter((item) => item.eventId === event.id);
      if (previous.date !== event.date && linkedInquiries.some((linked) =>
        linked.status !== "declined" && state.inquiries.some((other) =>
          other.eventId !== event.id && other.status !== "declined" &&
          other.date === event.date && other.time === linked.time,
        ),
      )) {
        throw new ValidationError("That date and time are already booked");
      }
      return {
        ...state,
        clients: state.clients.map((client) => client.eventId === event.id ? logEventChanges(client, previous, event) : client),
        events: state.events.map((item) => item.id === event.id ? event : item),
        inquiries: state.inquiries.map((item) => item.eventId === event.id
          ? { ...item, date: event.date, location: event.venue, guests: event.guests }
          : item),
      };
    }
    case "saveFoodMenuItem": {
      const input = validateFoodMenuItem(payload);
      if (input.id) {
        if (!state.foodMenu.some((item) => item.id === input.id)) throw new ValidationError("food menu item not found");
        return { ...state, foodMenu: state.foodMenu.map((item) => item.id === input.id ? { ...input, id: input.id } : item) };
      }
      if (state.foodMenu.length >= 100) throw new ValidationError("food menu can contain at most 100 items");
      const item: FoodMenuItem = { ...input, id: crypto.randomUUID() };
      return { ...state, foodMenu: [...state.foodMenu, item] };
    }
    case "deleteFoodMenuItem": {
      const id = validId(payload.id, "food menu item id");
      if (!state.foodMenu.some((item) => item.id === id)) throw new ValidationError("food menu item not found");
      // Events keep their own snapshots, including after catalog removal.
      return { ...state, foodMenu: state.foodMenu.filter((item) => item.id !== id) };
    }
    case "savePost": {
      const input = validatePost(payload);
      const post: Post = { ...input, id: input.id ?? crypto.randomUUID() };
      return { ...state, posts: input.id
        ? state.posts.map((item) => item.id === post.id ? post : item).concat(state.posts.some((item) => item.id === post.id) ? [] : [post])
        : [post, ...state.posts] };
    }
    case "deletePost": {
      const id = validId(payload.id, "post id");
      return { ...state, posts: state.posts.filter((item) => item.id !== id) };
    }
    case "saveHighlight": {
      const input = validateHighlight(payload);
      const highlight: Highlight = { ...input, id: input.id ?? crypto.randomUUID() };
      return { ...state, highlights: input.id
        ? state.highlights.map((item) => item.id === highlight.id ? highlight : item).concat(state.highlights.some((item) => item.id === highlight.id) ? [] : [highlight])
        : [highlight, ...state.highlights] };
    }
    case "deleteHighlight": {
      const id = validId(payload.id, "highlight id");
      return { ...state, highlights: state.highlights.filter((item) => item.id !== id) };
    }
    default:
      return updateBusinessState(state, request.action, payload);
  }
}

export function responseFor(row: { state: string; version: number }): DemoStateResponse {
  let state: unknown;
  try {
    state = JSON.parse(row.state);
  } catch {
    throw new Error("Stored site state is invalid JSON");
  }
  if (!isDemoState(state)) throw new Error("Stored site state has an invalid shape");
  return { state: normalizeState(state), version: row.version };
}

function isDemoState(value: unknown): value is DemoState {
  return isRecord(value) && Array.isArray(value.inquiries) && Array.isArray(value.events) &&
    Array.isArray(value.posts) && Array.isArray(value.highlights);
}

/** Older photos get an inspiration flag; the sample photos move into the new gallery categories. */
function migrateHighlight(item: Highlight): Highlight {
  const demo = item.id.startsWith("highlight-demo-");
  const category = demo && item.category === "Private parties" ? "Private celebrations"
    : demo && item.category === "Corporate" ? "Event details"
    : item.category;
  return { ...item, category, inspiration: item.inspiration ?? (demo || item.title.startsWith("Demo ")) };
}

/** Sites still on the untouched original five services move to the expanded list; edited lists are kept. */
function migrateServices(value: unknown): ServiceItem[] {
  if (!Array.isArray(value)) return DEFAULT_SERVICES;
  const services = value as ServiceItem[];
  const matches = (titles: string[]) => services.length === titles.length &&
    services.every((service, index) => service.title === titles[index] && !service.price);
  return matches(ORIGINAL_SERVICE_TITLES) || matches(PREVIOUS_SERVICE_TITLES) ? DEFAULT_SERVICES : services;
}

/** A gallery still holding only the original sample photos shows Wander & Revel's own event photos instead. */
const FIRST_PHOTO_SET = ["wedding-couple-arch", "wedding-ceremony", "wedding-couple-shore", "wedding-guests", "fair-hall", "balloon-door", "dessert-table", "fair-florist", "photo-booth", "fair-hall-draped", "balloon-wall", "fair-aisle", "fair-apothecary", "fair-kids-booth", "fair-aisle-candles", "fair-shoppers", "fair-blankets", "fair-vendor", "fair-beauty-booth"].map((id) => `wr-${id}`);
function migrateHighlights(value: Highlight[]): Highlight[] {
  // Only samples, or exactly the first supplied photo set (Nov 25 2026): refresh to the current photo set.
  const ids = value.map((item) => item.id);
  const firstSet = ids.length === FIRST_PHOTO_SET.length && FIRST_PHOTO_SET.every((id) => ids.includes(id));
  const samplesOnly = firstSet || value.every((item) => item.id.startsWith("highlight-demo-"));
  return samplesOnly ? DEFAULT_HIGHLIGHTS : value.map(migrateHighlight);
}

function normalizeState(value: Record<string, unknown>): DemoState {
  const events = value.events as unknown[];
  if (events.some((event) => !isRecord(event))) throw new Error("Stored site events have an invalid shape");
  if (value.foodMenu !== undefined && !Array.isArray(value.foodMenu)) throw new Error("Stored food menu has an invalid shape");
  // Missing means a legacy workspace. An explicit [] is intentional and stays empty.
  const rawMenu = value.foodMenu === undefined ? createFoodMenuSeed() : value.foodMenu;
  if (rawMenu.length > 100) throw new Error("Stored food menu exceeds its item limit");
  const seenMenuIds = new Set<string>();
  const foodMenu = rawMenu.map((raw) => {
    const parsed = validateFoodMenuItem(isRecord(raw) ? { price: "", image: "", ...raw } : raw);
    if (!parsed.id) throw new Error("Stored food menu item has no id");
    if (seenMenuIds.has(parsed.id)) throw new Error("Stored food menu has duplicate ids");
    seenMenuIds.add(parsed.id);
    return { ...parsed, id: parsed.id };
  });
  const normalizedEvents = (events as Record<string, unknown>[]).map((event) =>
    validateEvent({ ...event, foods: event.foods === undefined ? [] : event.foods }),
  );
  return {
    ...value,
    events: normalizedEvents,
    foodMenu,
    barMenu: Array.isArray(value.barMenu) ? value.barMenu as BarMenuItem[] : [],
    services: migrateServices(value.services),
    highlights: migrateHighlights(value.highlights as Highlight[]),
    content: isRecord(value.content) ? value.content as Record<string, string> : {},
    clients: Array.isArray(value.clients) ? (value.clients as Client[]).map((client) => ({ ...client, updates: client.updates ?? [] })) : [],
    payments: Array.isArray(value.payments) ? value.payments as Payment[] : [],
  } as DemoState;
}


// ---------------------------------------------------------------------------
// Business actions: menus, site content, clients and payments.
// ---------------------------------------------------------------------------

const CLIENT_STATUSES = ["lead", "booked", "completed", "cancelled"] as const;
const PAYMENT_METHODS = ["card", "cash", "check", "other"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newPortalCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

function optionalDate(value: unknown, label: string): string {
  if (value === "" || value === undefined || value === null) return "";
  return validDate(value, label);
}
function optionalTime(value: unknown, label: string): string {
  if (value === "" || value === undefined || value === null) return "";
  return validTime(value, label);
}
function validEmail(value: unknown): string {
  const email = requiredString(value, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("email must be a valid email address");
  return email;
}
function update(message: string) {
  return { id: randomUUID(), at: new Date().toISOString(), message };
}

function logEventChanges(client: Client, before: Event, after: Event): Client {
  const notes: string[] = [];
  if (before.date !== after.date) notes.push(`Event date changed to ${after.date}.`);
  if (before.guests !== after.guests) notes.push(`Guest count changed from ${before.guests} to ${after.guests}.`);
  if (before.venue !== after.venue) notes.push(`Venue changed to ${after.venue}.`);
  const names = (items: { name: string }[]) => items.map((item) => item.name);
  const addedFood = names(after.foods).filter((name) => !names(before.foods).includes(name));
  const removedFood = names(before.foods).filter((name) => !names(after.foods).includes(name));
  if (addedFood.length) notes.push(`Added to food menu: ${addedFood.join(", ")}.`);
  if (removedFood.length) notes.push(`Removed from food menu: ${removedFood.join(", ")}.`);
  const addedDrinks = after.drinks.filter((name) => !before.drinks.includes(name));
  const removedDrinks = before.drinks.filter((name) => !after.drinks.includes(name));
  if (addedDrinks.length) notes.push(`Added to bar menu: ${addedDrinks.join(", ")}.`);
  if (removedDrinks.length) notes.push(`Removed from bar menu: ${removedDrinks.join(", ")}.`);
  if (JSON.stringify(before.timeline) !== JSON.stringify(after.timeline)) notes.push("The event schedule was updated.");
  if (!notes.length) return client;
  return {
    ...client,
    eventDate: after.date,
    venue: after.venue,
    guests: after.guests,
    updates: [...notes.map(update), ...client.updates].slice(0, 200),
  };
}

function validateBarItem(value: unknown): Omit<BarMenuItem, "id"> & { id?: string } {
  if (!isRecord(value)) throw new ValidationError("bar item must be an object");
  if (typeof value.published !== "boolean") throw new ValidationError("published must be true or false");
  return {
    ...(value.id === undefined ? {} : { id: validId(value.id, "bar item id") }),
    name: requiredString(value.name, "name", 120),
    description: optionalString(value.description, "description", 500),
    category: oneOf(value.category, BAR_CATEGORIES, "category"),
    price: optionalString(value.price, "price", 60),
    image: validImage(value.image, true),
    published: value.published,
  };
}

function validateClient(value: Record<string, unknown>, previous?: Client): Client {
  const total = value.total === undefined ? previous?.total ?? 0 : money(value.total, "total");
  const deposit = value.deposit === undefined ? previous?.deposit ?? 0 : money(value.deposit, "deposit");
  if (deposit > total && total > 0) throw new ValidationError("deposit cannot be more than the total");
  return {
    id: previous?.id ?? randomUUID(),
    name: requiredString(value.name, "name", 120),
    email: validEmail(value.email),
    phone: optionalString(value.phone, "phone", 40),
    eventTitle: optionalString(value.eventTitle, "event", 160),
    service: optionalString(value.service, "service", 120),
    eventDate: optionalDate(value.eventDate, "event date"),
    startTime: optionalTime(value.startTime, "start time"),
    endTime: optionalTime(value.endTime, "end time"),
    venue: optionalString(value.venue, "venue", 240),
    guests: value.guests === undefined || value.guests === "" ? previous?.guests ?? 0 : integerInRange(value.guests, "guests", 0, 10000),
    status: oneOf(value.status ?? previous?.status ?? "lead", CLIENT_STATUSES, "status") as ClientStatus,
    total,
    deposit,
    internalNotes: optionalString(value.internalNotes, "internal notes", 5000),
    clientNotes: optionalString(value.clientNotes, "client notes", 5000),
    eventId: previous?.eventId ?? null,
    portalCode: previous?.portalCode ?? newPortalCode(),
    updates: previous?.updates ?? [],
    createdAt: previous?.createdAt ?? new Date().toISOString(),
  };
}

function clientChangeNotes(before: Client, after: Client): string[] {
  const notes: string[] = [];
  if (before.eventDate !== after.eventDate) notes.push(`Event date set to ${after.eventDate || "to be decided"}.`);
  if (before.startTime !== after.startTime || before.endTime !== after.endTime) notes.push(`Event time updated to ${[after.startTime, after.endTime].filter(Boolean).join("–") || "to be decided"}.`);
  if (before.guests !== after.guests) notes.push(`Guest count updated to ${after.guests}.`);
  if (before.venue !== after.venue) notes.push(`Venue updated to ${after.venue || "to be decided"}.`);
  if (before.total !== after.total) notes.push(`Event total updated to $${after.total.toFixed(2)}.`);
  if (before.status !== after.status) notes.push(`Booking status: ${after.status}.`);
  return notes;
}

function emptyEventFor(client: Client): Event {
  return {
    id: randomUUID(),
    title: client.eventTitle || `${client.name} event`,
    date: client.eventDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    venue: client.venue || "To be decided",
    guests: Math.max(1, client.guests),
    notes: "",
    drinks: [],
    tasks: [],
    timeline: client.startTime ? [{ id: randomUUID(), time: client.startTime, title: "Event start" }] : [],
    budgetItems: [],
    foods: [],
  };
}

function updateBusinessState(state: DemoState, action: string, payload: Record<string, unknown>): DemoState {
  switch (action) {
    case "saveBarMenuItem": {
      const input = validateBarItem(payload);
      if (input.id) {
        if (!state.barMenu.some((item) => item.id === input.id)) throw new ValidationError("bar item not found");
        return { ...state, barMenu: state.barMenu.map((item) => item.id === input.id ? { ...input, id: input.id } : item) };
      }
      if (state.barMenu.length >= 150) throw new ValidationError("bar menu can contain at most 150 items");
      return { ...state, barMenu: [...state.barMenu, { ...input, id: randomUUID() }] };
    }
    case "deleteBarMenuItem": {
      const id = validId(payload.id);
      return { ...state, barMenu: state.barMenu.filter((item) => item.id !== id) };
    }
    case "saveContent": {
      if (!isRecord(payload.values)) throw new ValidationError("values must be an object");
      const content = { ...state.content };
      for (const [key, raw] of Object.entries(payload.values)) {
        const field = CONTENT_FIELDS.find((item) => item.key === key);
        if (!field) throw new ValidationError(`unknown content field ${key}`);
        content[key] = field.kind === "image"
          ? validImage(raw)
          : optionalString(raw, field.label, field.kind === "textarea" ? 5000 : 300);
      }
      return { ...state, content };
    }
    case "saveServices": {
      if (!Array.isArray(payload.services) || payload.services.length < 1 || payload.services.length > 20) throw new ValidationError("add between 1 and 20 services");
      const titles = new Set<string>();
      const services = payload.services.map((raw): ServiceItem => {
        if (!isRecord(raw)) throw new ValidationError("each service must be an object");
        const title = requiredString(raw.title, "service name", 100);
        if (titles.has(title.toLowerCase())) throw new ValidationError("service names must be unique");
        titles.add(title.toLowerCase());
        return {
          title,
          description: optionalString(raw.description, "service summary", 600),
          details: optionalString(raw.details, "service details", 1200),
          price: optionalString(raw.price, "service price", 80),
          image: validImage(raw.image, true),
        };
      });
      return { ...state, services };
    }
    case "saveClient": {
      const previous = payload.id === undefined ? undefined : state.clients.find((item) => item.id === payload.id);
      if (payload.id !== undefined && !previous) throw new ValidationError("client not found");
      const client = validateClient(payload, previous);
      if (state.clients.some((item) => item.id !== client.id && item.email === client.email && item.status !== "cancelled" && client.status !== "cancelled" && item.eventDate === client.eventDate))
        throw new ValidationError("a client with this email already has an event on that date");
      if (!previous) {
        if (state.clients.length >= 5000) throw new ValidationError("client list is full");
        return { ...state, clients: [{ ...client, updates: [update("Your booking record was created.")] }, ...state.clients] };
      }
      const notes = clientChangeNotes(previous, client);
      const next = { ...client, updates: [...notes.map(update), ...previous.updates].slice(0, 200) };
      const events = next.eventId ? state.events.map((event) => event.id === next.eventId ? {
        ...event,
        date: next.eventDate || event.date,
        venue: next.venue || event.venue,
        guests: next.guests > 0 ? next.guests : event.guests,
      } : event) : state.events;
      return { ...state, events, clients: state.clients.map((item) => item.id === next.id ? next : item) };
    }
    case "deleteClient": {
      const id = validId(payload.id);
      return { ...state, clients: state.clients.filter((item) => item.id !== id) };
    }
    case "resetPortalCode": {
      const id = validId(payload.id);
      if (!state.clients.some((item) => item.id === id)) throw new ValidationError("client not found");
      return { ...state, clients: state.clients.map((item) => item.id === id ? { ...item, portalCode: newPortalCode() } : item) };
    }
    case "addClientUpdate": {
      const id = validId(payload.id);
      const message = requiredString(payload.message, "update", 1000);
      if (!state.clients.some((item) => item.id === id)) throw new ValidationError("client not found");
      return { ...state, clients: state.clients.map((item) => item.id === id ? { ...item, updates: [update(message), ...item.updates].slice(0, 200) } : item) };
    }
    case "createEventPlan": {
      const id = validId(payload.id);
      const client = state.clients.find((item) => item.id === id);
      if (!client) throw new ValidationError("client not found");
      if (client.eventId && state.events.some((event) => event.id === client.eventId)) return state;
      const event = emptyEventFor(client);
      return { ...state, events: [event, ...state.events], clients: state.clients.map((item) => item.id === id ? { ...item, eventId: event.id } : item) };
    }
    case "convertInquiry": {
      const id = validId(payload.id);
      const inquiry = state.inquiries.find((item) => item.id === id);
      if (!inquiry) throw new ValidationError("inquiry not found");
      const existing = state.clients.find((client) => client.eventId && client.eventId === inquiry.eventId);
      if (existing) return state;
      const client: Client = {
        id: randomUUID(), name: inquiry.name, email: inquiry.email.toLowerCase(), phone: inquiry.phone,
        eventTitle: inquiry.type, service: inquiry.service, eventDate: inquiry.date, startTime: inquiry.time, endTime: "",
        venue: inquiry.location, guests: inquiry.guests, status: "booked", total: 0, deposit: 0,
        internalNotes: [inquiry.budget && `Budget shared: ${inquiry.budget}`, inquiry.notes].filter(Boolean).join("\n"),
        clientNotes: "", eventId: inquiry.eventId, portalCode: newPortalCode(),
        updates: [update("Your booking was confirmed.")], createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        clients: [client, ...state.clients],
        inquiries: state.inquiries.map((item) => item.id === id ? { ...item, status: "confirmed" } : item),
      };
    }
    case "deleteInquiry": {
      const id = validId(payload.id);
      return { ...state, inquiries: state.inquiries.filter((item) => item.id !== id) };
    }
    case "recordPayment": {
      const clientId = validId(payload.clientId, "client");
      if (!state.clients.some((item) => item.id === clientId)) throw new ValidationError("client not found");
      const amount = money(payload.amount, "amount");
      if (amount <= 0) throw new ValidationError("amount must be more than zero");
      const payment: Payment = {
        id: randomUUID(), clientId, amount,
        method: oneOf(payload.method, PAYMENT_METHODS, "method"),
        status: oneOf(payload.status ?? "paid", PAYMENT_STATUSES, "status"),
        note: optionalString(payload.note, "note", 300), stripeSessionId: "", createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        payments: [payment, ...state.payments],
        clients: state.clients.map((item) => item.id === clientId && payment.status === "paid"
          ? { ...item, updates: [update(`Payment received: $${amount.toFixed(2)}. Thank you!`), ...item.updates] } : item),
      };
    }
    case "updatePaymentStatus": {
      const id = validId(payload.id);
      const status = oneOf(payload.status, PAYMENT_STATUSES, "status");
      if (!state.payments.some((item) => item.id === id)) throw new ValidationError("payment not found");
      return { ...state, payments: state.payments.map((item) => item.id === id ? { ...item, status } : item) };
    }
    case "deletePayment": {
      const id = validId(payload.id);
      return { ...state, payments: state.payments.filter((item) => item.id !== id) };
    }
    default:
      throw new ValidationError("action is not supported");
  }
}

export function paidTotal(state: DemoState, clientId: string): number {
  return Math.round(state.payments.filter((item) => item.clientId === clientId && item.status === "paid").reduce((sum, item) => sum + item.amount, 0) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Persistence: one shared site row with optimistic versioning.
// ---------------------------------------------------------------------------

function initialSite(): DemoState {
  // Keep the illustrative journal, gallery and food ideas; start with no sample customers.
  const seed = createDemoSeed();
  return {
    ...seed,
    inquiries: [],
    events: [],
    foodMenu: createFoodMenuSeed(),
    barMenu: [],
    services: DEFAULT_SERVICES,
    content: {},
    clients: [],
    payments: [],
  };
}

function readRow(): { state: string; version: number } {
  const sqlite = getSqlite();
  sqlite.prepare("INSERT OR IGNORE INTO demo_states (user_id, state, version) VALUES (?, ?, 1)").run(SITE_KEY, JSON.stringify(initialSite()));
  return sqlite.prepare("SELECT state, version FROM demo_states WHERE user_id = ?").get(SITE_KEY) as { state: string; version: number };
}

export function loadSite(): DemoStateResponse {
  return responseFor(readRow());
}

export class VersionConflict extends Error {}

/** Apply a change atomically. With expectedVersion, refuses to overwrite newer admin edits. */
export function changeSite(change: (state: DemoState) => DemoState, expectedVersion?: number): DemoStateResponse {
  const sqlite = getSqlite();
  const run = sqlite.transaction(() => {
    const row = readRow();
    if (expectedVersion !== undefined && row.version !== expectedVersion) throw new VersionConflict("The site changed in another tab. Reload and try again.");
    const next = change(responseFor(row).state);
    sqlite.prepare("UPDATE demo_states SET state = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND version = ?")
      .run(JSON.stringify(next), SITE_KEY, row.version);
    return { state: next, version: row.version + 1 };
  });
  return run.immediate();
}

export function publicSite(state: DemoState): PublicSite {
  return {
    posts: state.posts.filter((post) => post.published),
    highlights: state.highlights,
    foodMenu: state.foodMenu.filter((item) => item.published),
    barMenu: state.barMenu.filter((item) => item.published),
    services: state.services,
    content: state.content,
    bookedSlots: state.inquiries.filter((item) => item.status !== "declined").map((item) => ({ date: item.date, time: item.time })),
  };
}
