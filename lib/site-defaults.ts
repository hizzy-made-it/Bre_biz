import type { ServiceItem } from "./demo-types";

export type ContentField = {
  key: string;
  label: string;
  group: "Home" | "About" | "Services" | "Menus" | "Contact & footer";
  kind: "text" | "textarea" | "image";
  default: string;
};

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
  { key: "services.noteTitle", label: "Pricing note headline", group: "Services", kind: "text", default: "Good plans start with a conversation." },
  { key: "services.note", label: "Pricing note text", group: "Services", kind: "textarea", default: "You don’t need every detail figured out. Tell us your date, location, guest count, and what you have in mind. Share a budget range if you’d like. Scope, availability, and pricing are confirmed in a personal proposal." },

  { key: "food.title", label: "Food menu headline", group: "Menus", kind: "text", default: "Food menu" },
  { key: "food.lead", label: "Food menu subtitle", group: "Menus", kind: "text", default: "A collection of menu ideas for celebrations and time together." },
  { key: "bar.title", label: "Bar menu headline", group: "Menus", kind: "text", default: "Bar menu" },
  { key: "bar.lead", label: "Bar menu subtitle", group: "Menus", kind: "text", default: "Cocktails, zero-proof favorites and bar packages for your gathering." },
  { key: "menu.note", label: "Menu fine print", group: "Menus", kind: "text", default: "Menus and pricing are personalized for each event and confirmed in your proposal." },

  { key: "contact.email", label: "Contact email (shown in footer)", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.phone", label: "Contact phone (shown in footer)", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.instagram", label: "Instagram link", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.facebook", label: "Facebook link", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.area", label: "Service area", group: "Contact & footer", kind: "text", default: "" },
  { key: "footer.tagline", label: "Footer tagline", group: "Contact & footer", kind: "text", default: "A Place for Every Story." },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  { title: "Wedding & day-of coordination", description: "Be present for the moments that matter. Thoughtful coordination brings your plans, people, and timeline together.", details: "Wedding-day timelines, vendor coordination, and support with the details of your celebration.", price: "" },
  { title: "Mobile bartending", description: "A welcoming bar, beautifully considered drinks, and something for every guest to enjoy.", details: "A personalized bar experience, cocktail and alcohol-free menu ideas, and thoughtful setup.", price: "" },
  { title: "Private parties & special events", description: "From an intimate dinner to a milestone celebration, make space for good company and meaningful moments.", details: "Support for birthdays, showers, anniversaries, gatherings, and other occasions worth celebrating.", price: "" },
  { title: "Setup, styling & teardown", description: "The finishing touches make a difference. Let the setting feel as considered as the occasion.", details: "Help bringing your décor and layout together, arranging event details, and packing down afterward.", price: "" },
  { title: "Customized event support", description: "A little guidance or an extra pair of hands. We start with what you need and build from there.", details: "A flexible scope shaped around your priorities, your plans, and a budget you feel comfortable discussing.", price: "" },
];

export const LEGACY_SERVICES = ["Event planning", "Planning + bar"];

export function contentDefaults(): Record<string, string> {
  return Object.fromEntries(CONTENT_FIELDS.map((field) => [field.key, field.default]));
}

/** Read a content value with its default, so newly added fields work on older saved sites. */
export function readContent(content: Record<string, string>, key: string): string {
  if (Object.prototype.hasOwnProperty.call(content, key)) return content[key];
  return CONTENT_FIELDS.find((field) => field.key === key)?.default ?? "";
}
