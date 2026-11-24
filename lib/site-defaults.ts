import type { ServiceItem } from "./demo-types";

export const CONTENT_GROUPS = ["Home", "About", "Services", "Mobile bar", "Events we celebrate", "Partner with us", "Menus", "Contact & footer"] as const;
export type ContentGroup = (typeof CONTENT_GROUPS)[number];

export type ContentField = {
  key: string;
  label: string;
  group: ContentGroup;
  kind: "text" | "textarea" | "image";
  default: string;
};

/** The Compass Collections: content key, default name, subtitle and description. */
export const COMPASS_KEYS: [string, string, string, string][] = [
  ["north", "Revel North", "The Essentials", "Professional bartender-only service for clients who already have their bar and supplies handled."],
  ["east", "Wander East", "The Signature", "Bartending with essential bar supplies and a little more support."],
  ["south", "Revel South", "The Elevated", "An enhanced bar experience with customized beverage planning, expanded supplies, and thoughtful presentation."],
  ["west", "Wander West", "The Complete Experience", "Our most comprehensive service level, with expanded staffing, setup, supplies, and bar coordination for larger celebrations."],
];

export const EVENT_CATEGORY_DEFAULTS: [string, string, string][] = [
  ["Weddings & Elopements", "From an intimate elopement to a full guest list, we help your day feel calm, personal and beautifully put together.", "/images/celebration.webp"],
  ["Private Parties & Milestones", "Birthdays, anniversaries, graduations and just-because gatherings, celebrated with warmth and good company.", "/images/cocktails.webp"],
  ["Corporate Events & Mixers", "Team celebrations, client evenings and open houses with easy flow and a welcoming bar.", "/images/details.webp"],
  ["Bridal & Baby Showers", "Sweet, relaxed gatherings with thoughtful details, styled tables and drinks everyone can enjoy.", "/images/details.webp"],
  ["Markets & Community Events", "Craft fairs, vendor markets and community days, with bar service and setup support that scales.", "/images/celebration.webp"],
  ["Fundraisers & Special Events", "Galas, benefits and one-of-a-kind occasions, handled with care so the cause stays center stage.", "/images/cocktails.webp"],
];

/** Every editable piece of public copy and imagery. Keys are stable; labels are for the owner. */
export const CONTENT_FIELDS: ContentField[] = [
  { key: "home.caption", label: "Small caption above the headline", group: "Home", kind: "text", default: "Wander & Revel Event Services" },
  { key: "home.title", label: "Main headline", group: "Home", kind: "text", default: "A Place for Every Story." },
  { key: "home.lead", label: "Headline subtitle", group: "Home", kind: "text", default: "Thoughtful celebrations, beautifully brought together." },
  { key: "home.body", label: "Intro paragraph", group: "Home", kind: "textarea", default: "From wedding days to just-because gatherings, we help bring your vision to life with warmth, care, and room for what makes it yours." },
  { key: "home.heroImage", label: "Main photo", group: "Home", kind: "image", default: "/images/details.webp" },
  { key: "home.heroCaption", label: "Main photo caption", group: "Home", kind: "text", default: "Imagine the gathering. Make it your own." },
  { key: "home.welcomeTitle", label: "Welcome section headline", group: "Home", kind: "text", default: "Every celebration begins with your story." },
  { key: "home.welcomeBody", label: "Welcome section text", group: "Home", kind: "textarea", default: "The people you love. The moments you want to remember. The details that feel like you. We believe a beautiful event starts with listening, then finding a thoughtful way to bring it all together." },
  { key: "home.servicesTitle", label: "Services section headline", group: "Home", kind: "text", default: "A little support. A world of possibility." },
  { key: "home.servicesBody", label: "Services section text", group: "Home", kind: "textarea", default: "Choose the help that feels right for your occasion. We’ll start with your priorities and shape the details around them." },
  { key: "home.galleryNote", label: "Gallery note", group: "Home", kind: "text", default: "Event inspiration imagery." },
  { key: "invite.title", label: "Closing call-to-action headline", group: "Home", kind: "text", default: "Let’s make room for your story." },
  { key: "invite.body", label: "Closing call-to-action text", group: "Home", kind: "text", default: "Big plans, small gatherings, and all the possibilities in between." },

  { key: "about.title", label: "Page headline", group: "About", kind: "text", default: "Thoughtful by nature. Personal by design." },
  { key: "about.image", label: "Photo", group: "About", kind: "image", default: "/images/celebration.webp" },
  { key: "about.storyTitle", label: "Story headline", group: "About", kind: "text", default: "A celebration that feels like you." },
  { key: "about.story", label: "Story (blank line between paragraphs)", group: "About", kind: "textarea", default: "Wander & Revel is built around a simple philosophy: every celebration is unique, and every story deserves a place to unfold.\n\nOur role is to listen to your vision and help bring it to life. Whether you’re gathering a few favorite people or planning a wedding day, we approach the details with the same care.\n\nWe believe professional support can feel warm and approachable. Share your priorities, your ideas, and your budget. Together, those are the starting point for an event that feels personal and thoughtfully put together." },
  { key: "about.value1Title", label: "Value 1 headline", group: "About", kind: "text", default: "Listen first." },
  { key: "about.value1", label: "Value 1 text", group: "About", kind: "textarea", default: "The best starting point is you: what you love, what matters most, and how you want the day to feel." },
  { key: "about.value2Title", label: "Value 2 headline", group: "About", kind: "text", default: "Care for the details." },
  { key: "about.value2", label: "Value 2 text", group: "About", kind: "textarea", default: "A considered plan makes room for connection, from the first welcome to the last goodnight." },
  { key: "about.value3Title", label: "Value 3 headline", group: "About", kind: "text", default: "Make room for possibility." },
  { key: "about.value3", label: "Value 3 text", group: "About", kind: "textarea", default: "Beautiful experiences take many forms. We welcome different ideas, celebrations, and budgets." },

  { key: "services.title", label: "Page headline", group: "Services", kind: "text", default: "Your vision. Thoughtfully supported." },
  { key: "services.lead", label: "Page subtitle", group: "Services", kind: "text", default: "From the first idea to the final details, choose the support your celebration needs." },
  { key: "services.image", label: "Photo", group: "Services", kind: "image", default: "/images/celebration.webp" },
  { key: "services.gridTitle", label: "Services grid headline", group: "Services", kind: "text", default: "Everything we offer." },
  { key: "services.gridLead", label: "Services grid subtitle", group: "Services", kind: "textarea", default: "Choose one service or bring a few together. Every celebration is quoted around your plans." },
  { key: "services.noteTitle", label: "Pricing note headline", group: "Services", kind: "text", default: "Good plans start with a conversation." },
  { key: "services.note", label: "Pricing note text", group: "Services", kind: "textarea", default: "You don’t need every detail figured out. Tell us your date, location, guest count, and what you have in mind. Share a budget range if you’d like. Scope, availability, and pricing are confirmed in a personal proposal." },

  { key: "bar.caption", label: "Small caption", group: "Mobile bar", kind: "text", default: "Mobile bar services" },
  { key: "bar.collectionsTitle", label: "Collections headline", group: "Mobile bar", kind: "text", default: "The Compass Collections." },
  { key: "bar.collectionsLead", label: "Collections subtitle", group: "Mobile bar", kind: "textarea", default: "Four levels of bar service, so you can choose the support that fits your celebration." },
  { key: "bar.dryHire", label: "Dry-hire and quote note", group: "Mobile bar", kind: "textarea", default: "Wander & Revel is a dry-hire mobile bar: you purchase and provide all alcohol, and we bring the service, setup and care. Every collection is custom quoted based on guest count, hours, staffing, supplies and event needs." },
  ...COMPASS_KEYS.flatMap(([key, title, subtitle, body]): ContentField[] => [
    { key: `bar.${key}.title`, label: `${title}: name`, group: "Mobile bar", kind: "text", default: title },
    { key: `bar.${key}.subtitle`, label: `${title}: subtitle`, group: "Mobile bar", kind: "text", default: subtitle },
    { key: `bar.${key}.body`, label: `${title}: description`, group: "Mobile bar", kind: "textarea", default: body },
  ]),
  { key: "bar.onsite.title", label: "Standalone bartending: name", group: "Mobile bar", kind: "text", default: "On-Site Bartending" },
  { key: "bar.onsite.body", label: "Standalone bartending: description", group: "Mobile bar", kind: "textarea", default: "Already have a bar or venue? Book professional bartenders on their own, for any celebration." },

  { key: "events.caption", label: "Small caption", group: "Events we celebrate", kind: "text", default: "Events we celebrate" },
  { key: "events.title", label: "Page headline", group: "Events we celebrate", kind: "text", default: "Every kind of gathering. All in good hands." },
  { key: "events.lead", label: "Page subtitle", group: "Events we celebrate", kind: "textarea", default: "We’re not just a wedding company or a mobile bar. From a backyard birthday to a 200-guest wedding, we help bring all kinds of gatherings together." },
  ...EVENT_CATEGORY_DEFAULTS.flatMap(([title, body, image], index): ContentField[] => [
    { key: `events.cat${index + 1}.title`, label: `Category ${index + 1}: name`, group: "Events we celebrate", kind: "text", default: title },
    { key: `events.cat${index + 1}.body`, label: `Category ${index + 1}: description`, group: "Events we celebrate", kind: "textarea", default: body },
    { key: `events.cat${index + 1}.image`, label: `Category ${index + 1}: photo`, group: "Events we celebrate", kind: "image", default: image },
  ]),

  { key: "partner.caption", label: "Small caption", group: "Partner with us", kind: "text", default: "For venues & event professionals" },
  { key: "partner.title", label: "Headline", group: "Partner with us", kind: "text", default: "Partner with us." },
  { key: "partner.body", label: "Text", group: "Partner with us", kind: "textarea", default: "Venues, planners and fellow event pros: we’d love to work together. Recommend Wander & Revel for bartending, coordination and event support, and let’s make every celebration easier for your clients." },
  { key: "partner.button", label: "Button text", group: "Partner with us", kind: "text", default: "Start a partnership conversation" },

  { key: "food.title", label: "Food menu headline", group: "Menus", kind: "text", default: "Food menu" },
  { key: "food.lead", label: "Food menu subtitle", group: "Menus", kind: "text", default: "A collection of menu ideas for celebrations and time together." },
  { key: "bar.title", label: "Bar menu headline", group: "Menus", kind: "text", default: "Bar menu" },
  { key: "bar.lead", label: "Bar menu subtitle", group: "Menus", kind: "text", default: "Cocktails, zero-proof favorites and bar packages for your gathering." },
  { key: "menu.note", label: "Menu fine print", group: "Menus", kind: "text", default: "Menus and pricing are personalized for each event and confirmed in your proposal." },

  { key: "contact.email", label: "Contact email (shown in footer)", group: "Contact & footer", kind: "text", default: "info@wanderandrevelevents.com" },
  { key: "contact.phone", label: "Contact phone (shown in footer)", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.instagram", label: "Instagram link", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.facebook", label: "Facebook link", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.area", label: "Service area", group: "Contact & footer", kind: "text", default: "" },
  { key: "footer.tagline", label: "Footer tagline", group: "Contact & footer", kind: "text", default: "A Place for Every Story." },
  { key: "footer.ctaTitle", label: "Footer headline", group: "Contact & footer", kind: "text", default: "Let’s make something worth celebrating." },
  { key: "footer.ctaButton", label: "Footer button text", group: "Contact & footer", kind: "text", default: "Let’s Plan Your Event" },
];

/** The original five services. A saved site still using exactly these is moved to the expanded list. */
export const ORIGINAL_SERVICE_TITLES = [
  "Wedding & day-of coordination",
  "Mobile bartending",
  "Private parties & special events",
  "Setup, styling & teardown",
  "Customized event support",
];

export const MOBILE_BAR_SERVICE = "Mobile Bar Services";

export const DEFAULT_SERVICES: ServiceItem[] = [
  { title: "Event Planning & Coordination", description: "From the first idea to the final toast, we help shape the plan, the timeline and the details so you can enjoy the day.", details: "Planning support, vendor coordination and a clear timeline built around your priorities.", price: "", image: "/images/details.webp" },
  { title: "Wedding & Day-of Coordination", description: "Be present for the moments that matter. We keep your people, vendors and timeline moving on the day.", details: "Wedding-day timelines, vendor check-ins, ceremony cues and calm support from start to finish.", price: "", image: "/images/celebration.webp" },
  { title: MOBILE_BAR_SERVICE, description: "A welcoming, dry-hire mobile bar with professional bartenders, thoughtful drinks and something for every guest.", details: "Choose from the Compass Collections, or book on-site bartending for a bar you already have.", price: "", image: "/images/cocktails.webp" },
  { title: "Wedding Officiant & Ceremonies", description: "A ceremony that sounds like the two of you, led with warmth for weddings, elopements and vow renewals.", details: "Ceremony planning, personalized vows support and an officiant on the day.", price: "", image: "/images/celebration.webp" },
  { title: "Event Setup & Teardown", description: "Let the setting feel as considered as the occasion, then leave the packing down to us.", details: "Layout, décor placement, event details and a full teardown afterward.", price: "", image: "/images/details.webp" },
  { title: "Event Staffing", description: "Friendly, professional hands for service, guest flow and everything in between.", details: "Servers, attendants and event support staff scaled to your guest count.", price: "", image: "/images/cocktails.webp" },
  { title: "Grazing Tables & Charcuterie", description: "Generous, beautifully styled spreads that invite guests to linger and mingle.", details: "Grazing tables and charcuterie displays sized and styled for your gathering.", price: "", image: "/images/details.webp" },
  { title: "Craft Fairs & Vendor Markets", description: "Bar service, setup and event support for markets, fairs and community gatherings.", details: "Support for vendor markets, pop-ups and community events, large or small.", price: "", image: "/images/celebration.webp" },
];

export const LEGACY_SERVICES = ["Event planning", "Planning + bar", ...ORIGINAL_SERVICE_TITLES];

export const PARTNER_OPTION = "Venue or vendor partnership";

export const EVENT_TYPES = [
  "Wedding",
  "Elopement",
  "Private party or milestone",
  "Corporate event or mixer",
  "Bridal or baby shower",
  "Market or community event",
  "Fundraiser or special event",
  "Something else",
];

/** Mobile bar choices offered in the inquiry form, using the owner's current names. */
export function barServiceOptions(content: Record<string, string>): string[] {
  return [
    ...COMPASS_KEYS.map(([key]) => `${readContent(content, `bar.${key}.title`)} · ${readContent(content, `bar.${key}.subtitle`)}`),
    readContent(content, "bar.onsite.title"),
  ].filter(Boolean);
}

/** Every service a visitor may pick in the inquiry form. */
export function inquiryServiceOptions(services: ServiceItem[], content: Record<string, string>): string[] {
  return [...new Set([...services.map((service) => service.title), ...barServiceOptions(content), PARTNER_OPTION])];
}

export function contentDefaults(): Record<string, string> {
  return Object.fromEntries(CONTENT_FIELDS.map((field) => [field.key, field.default]));
}

/** Read a content value with its default, so newly added fields work on older saved sites. */
export function readContent(content: Record<string, string>, key: string): string {
  if (Object.prototype.hasOwnProperty.call(content, key)) return content[key];
  return CONTENT_FIELDS.find((field) => field.key === key)?.default ?? "";
}
