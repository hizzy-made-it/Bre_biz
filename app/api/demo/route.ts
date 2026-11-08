import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { demoStates } from "../../../db/schema";
import { getDemoUser, originAllowed } from "../../demo-auth";
import { createDemoSeed } from "../../../lib/demo-seed";
import { createFoodMenuSeed, FOOD_CATEGORIES } from "../../../lib/food-menu";
import type {
  DemoActionRequest,
  DemoState,
  DemoStateResponse,
  Event,
  EventBudgetItem,
  EventFoodItem,
  EventTask,
  EventTimelineItem,
  Highlight,
  FoodCategory,
  FoodMenuItem,
  Inquiry,
  InquiryStatus,
  Post,
} from "../../../lib/demo-types";

const MAX_BODY_BYTES = 128 * 1024;
const SERVICES = ["Event planning", "Mobile bartending", "Planning + bar"] as const;
const STATUSES = ["new", "contacted", "confirmed", "declined"] as const;
const HIGHLIGHT_CATEGORIES = ["Weddings", "Private parties", "Corporate"] as const;
const IMAGE_PATHS = [
  "/images/celebration.webp",
  "/images/cocktails.webp",
  "/images/details.webp",
] as const;
const CLIENT_TIME_ZONE = "America/New_York";

class ValidationError extends Error {}

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
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

function validImage(value: unknown): string {
  if (typeof value !== "string" || !IMAGE_PATHS.includes(value as (typeof IMAGE_PATHS)[number])) {
    throw new ValidationError("image must be one of the supplied demo image paths");
  }
  return value;
}

function validateInquiryInput(payload: Record<string, unknown>): Omit<Inquiry, "id" | "createdAt" | "eventId" | "status"> {
  const name = requiredString(payload.name, "name", 120);
  const email = requiredString(payload.email, "email", 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("email must be a valid email address");
  }
  const date = validDate(payload.date, "date");
  if (date <= currentClientDate()) {
    throw new ValidationError("date must be in the future");
  }
  return {
    name,
    email,
    phone: optionalString(payload.phone, "phone", 40),
    type: payload.type === undefined || payload.type === null || payload.type === ""
      ? "Event inquiry"
      : requiredString(payload.type, "type", 100),
    service: oneOf(payload.service, SERVICES, "service"),
    date,
    time: validTime(payload.time, "time"),
    guests: integerInRange(payload.guests, "guests", 1, 10000),
    location: requiredString(payload.location, "location", 240),
    budget: optionalString(payload.budget, "budget", 100),
    notes: optionalString(payload.notes, "notes", 3000),
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
  };
}

function updateState(state: DemoState, request: DemoActionRequest): DemoState {
  if (!isRecord(request.payload)) throw new ValidationError("payload must be an object");
  const payload = request.payload;
  switch (request.action) {
    case "createInquiry": {
      const input = validateInquiryInput(payload);
      const busy = state.inquiries.some((inquiry) =>
        inquiry.status !== "declined" && inquiry.date === input.date && inquiry.time === input.time,
      );
      if (busy) throw new ValidationError("That date and time are already reserved in this demo workspace");
      const id = crypto.randomUUID();
      const eventId = crypto.randomUUID();
      const event: Event = {
        id: eventId,
        title: `${input.type} · ${input.name}`,
        date: input.date,
        venue: input.location,
        guests: input.guests,
        notes: input.notes || `Demo event created from the inquiry. Requested service: ${input.service}.`,
        drinks: [],
        tasks: [
          { id: crypto.randomUUID(), title: "Confirm event details with the host", done: false },
          { id: crypto.randomUUID(), title: "Prepare a service and setup plan", done: false },
        ],
        timeline: [{ id: crypto.randomUUID(), time: input.time, title: "Event start" }],
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
        item.id !== id && item.status !== "declined" && item.date === target.date && item.time === target.time,
      )) throw new ValidationError("That date and time are already reserved in this demo workspace");
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
        throw new ValidationError("That date and time are already reserved in this demo workspace");
      }
      return {
        ...state,
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
      throw new ValidationError("action is not supported");
  }
}

function responseFor(row: { state: string; version: number }): DemoStateResponse {
  let state: unknown;
  try {
    state = JSON.parse(row.state);
  } catch {
    throw new Error("Stored demo state is invalid JSON");
  }
  if (!isDemoState(state)) throw new Error("Stored demo state has an invalid shape");
  return { state: normalizeState(state), version: row.version };
}

function isDemoState(value: unknown): value is DemoState {
  return isRecord(value) && Array.isArray(value.inquiries) && Array.isArray(value.events) &&
    Array.isArray(value.posts) && Array.isArray(value.highlights);
}

function normalizeState(value: Record<string, unknown>): DemoState {
  const events = value.events as unknown[];
  if (events.some((event) => !isRecord(event))) throw new Error("Stored demo events have an invalid shape");
  if (value.foodMenu !== undefined && !Array.isArray(value.foodMenu)) throw new Error("Stored food menu has an invalid shape");
  // Missing means a legacy workspace. An explicit [] is intentional and stays empty.
  const rawMenu = value.foodMenu === undefined ? createFoodMenuSeed() : value.foodMenu;
  if (rawMenu.length > 100) throw new Error("Stored food menu exceeds its item limit");
  const seenMenuIds = new Set<string>();
  const foodMenu = rawMenu.map((raw) => {
    const parsed = validateFoodMenuItem(raw);
    if (!parsed.id) throw new Error("Stored food menu item has no id");
    if (seenMenuIds.has(parsed.id)) throw new Error("Stored food menu has duplicate ids");
    seenMenuIds.add(parsed.id);
    return { ...parsed, id: parsed.id };
  });
  const normalizedEvents = (events as Record<string, unknown>[]).map((event) =>
    validateEvent({ ...event, foods: event.foods === undefined ? [] : event.foods }),
  );
  return { ...value, events: normalizedEvents, foodMenu } as DemoState;
}

async function getOrCreateUserState(userId: string) {
  const db = getDb();
  await db.insert(demoStates).values({
    userId,
    state: JSON.stringify(createDemoSeed()),
    version: 1,
  }).onConflictDoNothing({ target: demoStates.userId });
  const [row] = await db.select({ state: demoStates.state, version: demoStates.version })
    .from(demoStates).where(eq(demoStates.userId, userId)).limit(1);
  if (!row) throw new Error("Could not initialize demo state");
  return row;
}

function validUserId(value: string): string {
  if (value.length > 512) throw new Error("Authenticated user identifier is too long");
  return value;
}

async function authenticate() {
  const user = await getDemoUser();
  if (!user) return { response: Response.json({ error: "Authentication required" }, { status: 401 }) };
  try {
    return { userId: validUserId(user.userId) };
  } catch {
    return { response: Response.json({ error: "Invalid authenticated user" }, { status: 401 }) };
  }
}

function rejectCrossOrigin(request: Request): Response | null {
  try {
    if (originAllowed(request, false)) return null;
    return Response.json({ error: "Cross-origin requests are not allowed" }, { status: 403 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "APP_ORIGIN is not configured correctly." }, { status: 503 });
  }
}

async function readBoundedBody(
  request: Request,
): Promise<{ raw: string } | { error: "oversized" | "unreadable" }> {
  const reader = request.body?.getReader();
  if (!reader) return { raw: "" };

  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > MAX_BODY_BYTES) {
        try {
          await reader.cancel("Request body exceeds 128 KB");
        } catch {
          // The request is already being rejected; cancellation is best effort.
        }
        return { error: "oversized" };
      }
      chunks.push(value);
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // Preserve the original read failure.
    }
    return { error: "unreadable" };
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { raw: new TextDecoder().decode(bytes) };
}

export async function GET() {
  if (process.env.DEMO_SESSION_SECRET === undefined) return Response.json({ error: "Demo session setup is incomplete" }, { status: 503 });
  const auth = await authenticate();
  if (auth.response) return auth.response;
  try {
    const row = await getOrCreateUserState(auth.userId);
    return Response.json(responseFor(row), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch {
    return Response.json({ error: "Demo state is unavailable" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Drain mutation bodies before early auth/origin responses to avoid the Cloudflare
  // Worker connection reuse issue: https://github.com/cloudflare/workerd/issues/1730
  // and https://github.com/cloudflare/workerd/issues/7634.
  const body = await readBoundedBody(request);
  if ("error" in body) {
    return body.error === "oversized"
      ? Response.json({ error: "Request body exceeds 128 KB" }, { status: 413 })
      : badRequest("Request body could not be read");
  }

  const crossOrigin = rejectCrossOrigin(request);
  if (crossOrigin) return crossOrigin;
  const auth = await authenticate();
  if (auth.response) return auth.response;

  let input: unknown;
  try {
    input = JSON.parse(body.raw);
  } catch {
    return badRequest("Request body must be valid JSON");
  }
  if (!isRecord(input) || typeof input.action !== "string" || !isRecord(input.payload) ||
      typeof input.version !== "number" || !Number.isSafeInteger(input.version) || input.version < 1) {
    return badRequest("Expected action, object payload, and positive integer version");
  }

  try {
    const db = getDb();
    const row = await getOrCreateUserState(auth.userId);
    if (row.version !== input.version) return Response.json({ error: "Demo state changed; reload and try again", version: row.version }, { status: 409 });

    let current: DemoState;
    try {
      current = responseFor(row).state;
    } catch {
      return Response.json({ error: "Demo state is unavailable" }, { status: 500 });
    }

    let next: DemoState;
    try {
      next = updateState(current, input as DemoActionRequest);
    } catch (error) {
      if (error instanceof ValidationError) return badRequest(error.message);
      return badRequest("Invalid action payload");
    }

    const changed = await db.update(demoStates).set({
      state: JSON.stringify(next),
      version: sql`${demoStates.version} + 1`,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    }).where(and(eq(demoStates.userId, auth.userId), eq(demoStates.version, input.version)))
      .returning({ state: demoStates.state, version: demoStates.version });
    if (!changed[0]) return Response.json({ error: "Demo state changed; reload and try again" }, { status: 409 });
    return Response.json(responseFor(changed[0]));
  } catch {
    return Response.json({ error: "Demo state is unavailable" }, { status: 500 });
  }
}
