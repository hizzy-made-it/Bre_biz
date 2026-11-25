import type { Highlight, ServiceItem } from "./demo-types";

export const CONTENT_GROUPS = ["Home", "About", "Services", "Mobile bar", "Gallery", "Inquiry", "Events we celebrate", "Partner with us", "Menus", "Contact & footer"] as const;
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
  ["Weddings & Elopements", "From an intimate elopement to a full guest list, we help your day feel calm, personal and beautifully put together.", "/images/wr/wedding-couple-arch.webp"],
  ["Private Parties & Milestones", "Birthdays, anniversaries, graduations and just-because gatherings, celebrated with warmth and good company.", "/images/wr/dessert-table.webp"],
  ["Corporate Events & Mixers", "Team celebrations, client evenings and open houses with easy flow and a welcoming bar.", "/images/details.webp"],
  ["Bridal & Baby Showers", "Sweet, relaxed gatherings with thoughtful details, styled tables and drinks everyone can enjoy.", "/images/wr/balloon-door.webp"],
  ["Markets & Community Events", "Craft fairs, vendor markets and community days, with bar service and setup support that scales.", "/images/wr/fair-hall.webp"],
  ["Fundraisers & Special Events", "Galas, benefits and one-of-a-kind occasions, handled with care so the cause stays center stage.", "/images/cocktails.webp"],
];

/** Featured story shown beside each gallery group: category, headline, story, and what Wander & Revel did. */
export const GALLERY_FEATURES: [string, string, string, string][] = [
  ["Weddings", "A Destination Beach Wedding", "Barefoot on the sand with the ocean behind them, this couple said their vows surrounded by the family and friends who traveled to celebrate with them.", "Wander & Revel planned this destination wedding."],
  ["Community Events", "The Annual Galentine’s Craft Fair", "Going on seven years, this public craft fair brings local makers, florists and small businesses together under one roof, with balloon walls and photo moments for every guest. It has even been featured on Fox 9 News.", "Wander & Revel coordinates this fair every year."],
  ["Decor & Rentals", "Sweet Displays & Photo Moments", "Dessert tables, balloon walls and photo booth backdrops give guests something to gather around and remember.", "Decor and displays from Wander & Revel events."],
];
export function featureSlug(category: string): string {
  return category.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "");
}

/** Every editable piece of public copy and imagery. Keys are stable; labels are for the owner. */
export const CONTENT_FIELDS: ContentField[] = [
  { key: "home.caption", label: "Small caption above the headline", group: "Home", kind: "text", default: "Wander & Revel Event Services" },
  { key: "home.title", label: "Main headline", group: "Home", kind: "text", default: "A Place for Every Story." },
  { key: "home.lead", label: "Spaced-out line under the headline", group: "Home", kind: "text", default: "Thoughtfully planned. Beautifully celebrated. Uniquely yours." },
  { key: "home.body", label: "Intro paragraph", group: "Home", kind: "textarea", default: "At Wander & Revel Event Services, we believe the best celebrations are the ones that feel like you. From intimate gatherings to grand celebrations, we bring creativity, organization, and genuine hospitality to every occasion." },
  { key: "home.heroImage", label: "Main photo", group: "Home", kind: "image", default: "/images/wr/wedding-ceremony.webp" },
  { key: "home.heroCaption", label: "Main photo description (for screen readers)", group: "Home", kind: "text", default: "A beach wedding ceremony planned by Wander & Revel" },
  { key: "home.welcomeTitle", label: "Welcome section headline", group: "Home", kind: "text", default: "Every celebration begins with your story." },
  { key: "home.welcomeBody", label: "Welcome section text", group: "Home", kind: "textarea", default: "The people you love. The moments you want to remember. The details that feel like you. We believe a beautiful event starts with listening, then finding a thoughtful way to bring it all together." },
  { key: "home.galleryTitle", label: "Gallery strip headline", group: "Home", kind: "text", default: "Real celebrations." },
  { key: "home.galleryNote", label: "Gallery strip text", group: "Home", kind: "text", default: "Weddings, community events and the details in between, from events we have planned and coordinated." },
  { key: "invite.title", label: "Closing call-to-action headline", group: "Home", kind: "text", default: "Let’s make room for your story." },
  { key: "invite.body", label: "Closing call-to-action text", group: "Home", kind: "text", default: "Big plans, small gatherings, and all the possibilities in between." },

  { key: "about.title", label: "Page headline", group: "About", kind: "text", default: "Meet Wander & Revel" },
  { key: "about.script", label: "Handwritten line under the headline", group: "About", kind: "text", default: "A love for hospitality, meaningful connections, and the moments that bring people together." },
  { key: "about.intro", label: "Intro paragraph", group: "About", kind: "textarea", default: "Wander & Revel Event Services was created from a passion for celebrations that feel personal, intentional, and unforgettable. From intimate gatherings to grand celebrations, we bring creativity, organization, and genuine hospitality to every event." },
  { key: "about.image", label: "Top photo", group: "About", kind: "image", default: "/images/cocktails.webp" },
  { key: "about.storyImage", label: "Our story photo", group: "About", kind: "image", default: "/images/wr/dessert-table.webp" },
  { key: "about.storyTitle", label: "Story headline", group: "About", kind: "text", default: "More Than Just Events" },
  { key: "about.story", label: "Story (blank line between paragraphs)", group: "About", kind: "textarea", default: "With a background in hospitality, bartending, event operations, and coordination, we understand that successful events require more than beautiful decorations. They require thoughtful preparation, clear communication, flexibility, and attention to the details that guests may never see.\n\nWe believe celebrations should be personal, not one-size-fits-all. Whether you’re planning a wedding, hosting a private event, organizing a community gathering, or simply need an extra set of experienced hands, we’re here to help bring your vision to life." },
  { key: "about.mission", label: "Handwritten mission line", group: "About", kind: "text", default: "Our mission is simple: to make the planning process easier, the experience more enjoyable, and the memories unforgettable." },
  { key: "about.drive1", label: "What drives us 1", group: "About", kind: "text", default: "Genuine Hospitality" },
  { key: "about.drive2", label: "What drives us 2", group: "About", kind: "text", default: "Creativity & Fresh Ideas" },
  { key: "about.drive3", label: "What drives us 3", group: "About", kind: "text", default: "Professionalism & Reliability" },
  { key: "about.drive4", label: "What drives us 4", group: "About", kind: "text", default: "Inclusivity for All" },
  { key: "about.drive5", label: "What drives us 5", group: "About", kind: "text", default: "Adventure & Connection" },
  { key: "about.closingTitle", label: "Closing headline", group: "About", kind: "text", default: "Every Story Matters" },
  { key: "about.closingBody", label: "Closing text", group: "About", kind: "textarea", default: "From the big milestones to the simple moments, we’re honored to be a part of your story. Because every gathering, no matter the size, deserves to be thoughtfully planned and beautifully celebrated." },
  { key: "about.closingImage", label: "Closing photo", group: "About", kind: "image", default: "/images/wr/wedding-couple-shore.webp" },

  { key: "services.title", label: "Page headline", group: "Services", kind: "text", default: "Celebration Support for Every Occasion" },
  { key: "services.lead", label: "Page subtitle", group: "Services", kind: "textarea", default: "From bar service and event coordination to thoughtful details and meaningful ceremonies, Wander & Revel offers a range of services to bring your vision to life." },
  { key: "services.image", label: "Top photo", group: "Services", kind: "image", default: "/images/cocktails.webp" },
  { key: "services.experienceTitle", label: "Experience strip headline", group: "Services", kind: "text", default: "The Wander & Revel Experience" },
  { key: "services.exp1", label: "Experience 1", group: "Services", kind: "text", default: "Personalized Planning" },
  { key: "services.exp2", label: "Experience 2", group: "Services", kind: "text", default: "Professional Hospitality" },
  { key: "services.exp3", label: "Experience 3", group: "Services", kind: "text", default: "Attention to Detail" },
  { key: "services.exp4", label: "Experience 4", group: "Services", kind: "text", default: "Flexible & Customized" },
  { key: "services.ctaTitle", label: "Closing headline", group: "Services", kind: "text", default: "Let’s Plan Something Memorable" },
  { key: "services.ctaBody", label: "Closing text", group: "Services", kind: "textarea", default: "Tell us about your event and the services you’re interested in, and we’ll create a customized proposal for your celebration." },

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

  { key: "gallery.title", label: "Page headline", group: "Gallery", kind: "text", default: "Our Gallery" },
  { key: "gallery.script", label: "Handwritten line", group: "Gallery", kind: "text", default: "Real Celebrations. Thoughtfully Curated." },
  { key: "gallery.image", label: "Banner photo", group: "Gallery", kind: "image", default: "/images/wr/wedding-guests.webp" },
  ...GALLERY_FEATURES.flatMap(([category, title, body, credit]): ContentField[] => {
    const slug = featureSlug(category);
    return [
      { key: `gallery.${slug}.title`, label: `${category}: featured headline`, group: "Gallery", kind: "text", default: title },
      { key: `gallery.${slug}.body`, label: `${category}: featured story`, group: "Gallery", kind: "textarea", default: body },
      { key: `gallery.${slug}.credit`, label: `${category}: what we did`, group: "Gallery", kind: "textarea", default: credit },
    ];
  }),
  { key: "gallery.ctaTitle", label: "Closing headline", group: "Gallery", kind: "text", default: "Let’s Create Your Next Celebration" },
  { key: "gallery.ctaBody", label: "Closing text", group: "Gallery", kind: "text", default: "Inspired by what you see? Let’s bring your vision to life." },

  { key: "inquiry.title", label: "Page headline", group: "Inquiry", kind: "text", default: "Let’s Plan Your Event" },
  { key: "inquiry.lead", label: "Page subtitle", group: "Inquiry", kind: "textarea", default: "Tell us about your vision, and we’ll create a personalized proposal for your celebration." },
  { key: "inquiry.image", label: "Banner photo", group: "Inquiry", kind: "image", default: "/images/details.webp" },
  { key: "inquiry.step1", label: "Next step 1", group: "Inquiry", kind: "text", default: "We receive your inquiry" },
  { key: "inquiry.step2", label: "Next step 2", group: "Inquiry", kind: "text", default: "We review the details" },
  { key: "inquiry.step3", label: "Next step 3", group: "Inquiry", kind: "text", default: "We follow up with a custom proposal" },

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
  { key: "contact.instagram", label: "Instagram link (full https address)", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.facebook", label: "Facebook link (full https address)", group: "Contact & footer", kind: "text", default: "" },
  { key: "contact.area", label: "Service area", group: "Contact & footer", kind: "text", default: "Minnesota and surrounding areas. Travel may be available upon request." },
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

export const MOBILE_BAR_SERVICE = "Mobile Bartending & Bar Services";

/** Service titles from the Nov 2026 site; a saved site still using exactly these moves to the current list. */
export const PREVIOUS_SERVICE_TITLES = [
  "Event Planning & Coordination",
  "Wedding & Day-of Coordination",
  "Mobile Bar Services",
  "Wedding Officiant & Ceremonies",
  "Event Setup & Teardown",
  "Event Staffing",
  "Grazing Tables & Charcuterie",
  "Craft Fairs & Vendor Markets",
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  { title: MOBILE_BAR_SERVICE, description: "Professional bartending, curated cocktails, and seamless bar service for weddings, private events, and celebrations.", details: "", price: "", image: "/images/cocktails.webp" },
  { title: "Wedding & Day-of Coordination", description: "Thoughtful planning and event day management so you can be fully present and enjoy your celebration.", details: "", price: "", image: "/images/wr/wedding-ceremony.webp" },
  { title: "Private Event Planning", description: "From birthdays and anniversaries to corporate and milestone events, we help create gatherings that feel personal and unique.", details: "", price: "", image: "/images/wr/dessert-table.webp" },
  { title: "Craft Fair & Community Events", description: "Vendor coordination, event logistics, and on-site support to bring people, businesses, and communities together.", details: "", price: "", image: "/images/wr/fair-hall.webp" },
  { title: "Wedding Officiant Services", description: "Personalized, meaningful ceremonies that reflect your love story, whether traditional, intimate, or completely your own.", details: "", price: "", image: "/images/wr/wedding-couple-arch.webp" },
  { title: "Event Decor & Rentals", description: "Curated decor pieces and rental items to add warmth, style, and personality to your celebration.", details: "", price: "", image: "/images/wr/balloon-door.webp" },
  { title: "Event Setup & Teardown", description: "Let the setting feel as considered as the occasion, then leave the packing down to us.", details: "", price: "", image: "/images/wr/fair-hall-draped.webp" },
  { title: "Event Staffing", description: "Friendly, professional hands for service, guest flow and everything in between.", details: "", price: "", image: "/images/details.webp" },
  { title: "Grazing Tables & Charcuterie", description: "Generous, beautifully styled spreads that invite guests to linger and mingle.", details: "", price: "", image: "/images/celebration.webp" },
];

/** Button wording on each service card, from the owner's mockup; other services say "Inquire". */
export const SERVICE_BUTTONS: Record<string, string> = {
  [MOBILE_BAR_SERVICE]: "Explore bar services",
  "Wedding & Day-of Coordination": "Explore coordination",
  "Private Event Planning": "Plan your event",
  "Craft Fair & Community Events": "Explore community events",
  "Wedding Officiant Services": "Officiant services",
  "Event Decor & Rentals": "Ask about rentals",
};

export const LEGACY_SERVICES = ["Event planning", "Planning + bar", ...ORIGINAL_SERVICE_TITLES, ...PREVIOUS_SERVICE_TITLES];

export const PARTNER_OPTION = "Venue or vendor partnership";

export const BUDGET_RANGES = ["Under $1,000", "$1,000 to $2,500", "$2,500 to $5,000", "$5,000 to $10,000", "$10,000 or more", "Not sure yet"];

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

/** Photos from Wander & Revel's own events, shown in the gallery in this order. */
const PHOTO = (id: string, title: string, category: Highlight["category"], description: string): Highlight =>
  ({ id: `wr-${id}`, title, category, description, image: `/images/wr/${id}.webp`, guests: 0, inspiration: false });

export const DEFAULT_HIGHLIGHTS: Highlight[] = [
  PHOTO("wedding-couple-arch", "A destination wedding", "Weddings", "The couple under the floral arch on the beach."),
  PHOTO("wedding-ceremony", "The ceremony on the sand", "Weddings", "Guests gathered for vows by the water."),
  PHOTO("wedding-couple-shore", "Just married", "Weddings", "A quiet moment at the shoreline."),
  PHOTO("wedding-guests", "Everyone who traveled to celebrate", "Weddings", "The full wedding party and guests."),
  PHOTO("fair-hall", "The Galentine’s Craft Fair", "Community Events", "Our annual public craft fair, going on seven years."),
  PHOTO("balloon-door", "Balloon heart wall", "Decor & Rentals", "A heart balloon backdrop for photos."),
  PHOTO("dessert-table", "Dessert display", "Decor & Rentals", "A styled dessert table."),
  PHOTO("fair-florist", "Local florists", "Community Events", "Fresh bouquets from a fair vendor."),
  PHOTO("photo-booth", "Photo booth backdrop", "Decor & Rentals", "A flower and heart photo booth."),
  PHOTO("fair-hall-draped", "The vendor hall", "Community Events", "Draped ceilings and rows of makers."),
  PHOTO("balloon-wall", "Valentine’s photo corner", "Decor & Rentals", "A balloon wall styled for the fair."),
  PHOTO("fair-aisle", "Browsing the makers", "Community Events", "Shoppers along the vendor aisles."),
  PHOTO("fair-apothecary", "Handmade goods", "Community Events", "A vendor’s bath and body table."),
  PHOTO("fair-kids-booth", "Something for everyone", "Community Events", "Handmade kids’ sets and quilts."),
  PHOTO("fair-aisle-candles", "Candles and keepsakes", "Community Events", "Vendor tables full of small gifts."),
  PHOTO("fair-shoppers", "A full house", "Community Events", "Shoppers filling the hall."),
  PHOTO("fair-blankets", "Cozy finds", "Community Events", "A vendor’s handmade blankets."),
  PHOTO("fair-vendor", "Meet the makers", "Community Events", "A vendor at her booth."),
  PHOTO("fair-beauty-booth", "Small businesses", "Community Events", "A local beauty vendor’s booth."),
];
