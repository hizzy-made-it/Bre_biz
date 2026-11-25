import { useState, type ReactNode } from 'react';
import { ArrowRight, Compass, Heart, Leaf, Martini, Mountain, Sprout, Users } from 'lucide-react';
import type { Highlight, ServiceItem } from '@/lib/demo-types';
import { GALLERY_CATEGORIES } from '@/lib/demo-types';
import { barServiceOptions, COMPASS_KEYS, EVENT_CATEGORY_DEFAULTS, featureSlug, MOBILE_BAR_SERVICE, PARTNER_OPTION, readContent, SERVICE_BUTTONS } from '@/lib/site-defaults';

export type SiteCopy = { content: Record<string, string>; services: ServiceItem[] };
type InquiryAction = { book: (service: string) => void };
type PageProps = InquiryAction & { site: SiteCopy };
type PhotoProps = { photos: Highlight[]; onOpen: (list: Highlight[], index: number) => void };

/** Headlines are stored on one line; a period followed by a space becomes a line break, as in the original design. */
function Headline({ text }: { text: string }) {
  const parts = text.split(/(?<=[.!?])\s+(?=\S)/);
  return <>{parts.map((part, i) => <span key={i}>{part}{i < parts.length - 1 && <br />}</span>)}</>;
}
function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</>;
}

/** Small spaced capitals with a short gold rule, as in the owner's mockups. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="wr-eyebrow"><span>{children}</span></p>;
}
/** Hand-drawn gold underline beneath page headlines. */
export function Swash() {
  return <svg className="wr-swash" viewBox="0 0 240 18" aria-hidden="true" focusable="false"><path d="M4 13c38-7 92-11 150-9 30 1 56 3 82 6" /><path d="M30 16c44-5 96-7 150-5" /></svg>;
}
/** A soft olive sprig used as page decoration. */
export function Sprig({ className = '' }: { className?: string }) {
  return <svg className={`wr-sprig ${className}`.trim()} viewBox="0 0 120 160" aria-hidden="true" focusable="false">
    <path className="stem" d="M18 156C40 118 58 80 104 6" />
    {[[30, 132, -40], [44, 108, -35], [57, 86, -30], [70, 64, -28], [83, 42, -24], [94, 24, -20]].map(([x, y, r], i) => <g key={i}>
      <ellipse cx={x - 12} cy={y - 4} rx="13" ry="5" transform={`rotate(${r} ${x - 12} ${y - 4})`} />
      <ellipse cx={x + 10} cy={y + 2} rx="13" ry="5" transform={`rotate(${r + 70} ${x + 10} ${y + 2})`} />
    </g>)}
  </svg>;
}

/** Olive call-to-action band used at the foot of the brand pages. */
function CtaBand({ title, body, button, onClick }: { title: string; body: string; button: string; onClick: () => void }) {
  return <section className="wr-cta-band">
    <Sprig className="left" /><Sprig className="right" />
    <h2>{title}</h2>
    <p>{body}</p>
    <button className="wr-button light" onClick={onClick}>{button} <ArrowRight size={16} aria-hidden="true" /></button>
  </section>;
}

export function BrandHome({ book, site, photos, onOpen }: PageProps & PhotoProps) {
  const c = (key: string) => readContent(site.content, key);
  const fallback = site.services[0]?.title ?? '';
  const strip = photos.slice(0, 4);
  return <>
    <section className="wr-hero home" aria-labelledby="home-title">
      <div className="wr-hero-copy">
        <h1 id="home-title"><Headline text={c('home.title')} /></h1>
        <Swash />
        <p className="wr-spaced">{c('home.lead').split(/(?<=\.)\s+/).map((line, i) => <span key={i}>{line}</span>)}</p>
        <p>{c('home.body')}</p>
        <div className="wr-actions"><button className="wr-button" onClick={() => book(fallback)}>Let’s plan your event</button><a className="wr-button outline" href="#services">Explore our services</a></div>
      </div>
      <div className="wr-hero-image"><img src={c('home.heroImage')} alt={c('home.heroCaption')} width={1600} height={1068} fetchPriority="high" /></div>
    </section>
    <section className="wr-section wr-home-services" aria-labelledby="home-services-title">
      <h2 id="home-services-title" className="wr-rule-title">Our services</h2>
      <div className="wr-service-strip">{site.services.slice(0, 5).map(service => <a key={service.title} href="#services" className="wr-strip-card">
        <img src={service.image || c('services.image')} alt="" loading="lazy" />
        <span>{service.title}</span>
      </a>)}</div>
      <div className="wr-center"><a className="wr-button" href="#services">View all services</a></div>
      <Sprig className="corner" />
    </section>
    <section className="brand-introduction brand-section">
      <p className="brand-caption">Welcome to Wander &amp; Revel</p>
      <h2><Headline text={c('home.welcomeTitle')} /></h2>
      <p>{c('home.welcomeBody')}</p>
      <a className="quiet-link" href="#about">Get to know our approach</a>
    </section>
    {strip.length > 0 && <section className="wr-section wr-home-gallery" aria-labelledby="home-gallery-title">
      <div className="wr-split-heading"><div><Eyebrow>Gallery</Eyebrow><h2 id="home-gallery-title">{c('home.galleryTitle')}</h2></div><p>{c('home.galleryNote')}</p></div>
      <div className="wr-photo-strip">{strip.map((item, i) => <button key={item.id} className="wr-photo" onClick={() => onOpen(strip, i)} aria-label={`Enlarge photo: ${item.title}`}><img src={item.image} alt={item.title} loading="lazy" /></button>)}</div>
      <div className="wr-center"><a className="wr-button outline" href="#gallery">See the gallery</a></div>
    </section>}
    <CtaBand title={c('invite.title')} body={c('invite.body')} button="Inquire about your event" onClick={() => book(fallback)} />
  </>;
}

const DRIVE_ICONS = [Heart, Sprout, Compass, Users, Mountain];

export function BrandAbout({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  const fallback = site.services[0]?.title ?? '';
  return <>
    <section className="wr-hero about" aria-labelledby="about-title">
      <div className="wr-hero-copy">
        <Eyebrow>About us</Eyebrow>
        <h1 id="about-title">{c('about.title')}</h1>
        <p className="wr-script">{c('about.script')}</p>
        <p>{c('about.intro')}</p>
      </div>
      <div className="wr-hero-image"><img src={c('about.image')} alt="" width={1536} height={1024} fetchPriority="high" /></div>
    </section>
    <section className="wr-feature" aria-labelledby="story-title">
      <div className="wr-feature-image"><img src={c('about.storyImage')} alt="" loading="lazy" /></div>
      <div className="wr-feature-copy">
        <Eyebrow>Our story</Eyebrow>
        <h2 id="story-title">{c('about.storyTitle')}</h2>
        <Paragraphs text={c('about.story')} />
        <p className="wr-script">{c('about.mission')}</p>
      </div>
    </section>
    <section className="wr-icon-strip" aria-labelledby="drives-title">
      <h2 id="drives-title" className="wr-rule-title">What drives us</h2>
      <ul>{[1, 2, 3, 4, 5].map((n, i) => { const Icon = DRIVE_ICONS[i]; return <li key={n}><Icon size={34} strokeWidth={1.3} aria-hidden="true" /><span>{c(`about.drive${n}`)}</span></li>; })}</ul>
    </section>
    <section className="wr-feature" aria-labelledby="closing-title">
      <div className="wr-feature-image"><img src={c('about.closingImage')} alt="" loading="lazy" /></div>
      <div className="wr-feature-copy">
        <Eyebrow>The heart of Wander &amp; Revel</Eyebrow>
        <h2 id="closing-title">{c('about.closingTitle')}</h2>
        <p>{c('about.closingBody')}</p>
        <button className="wr-button" onClick={() => book(fallback)}>Let’s plan your event <ArrowRight size={16} aria-hidden="true" /></button>
      </div>
      <Sprig className="corner right" />
    </section>
  </>;
}

const DIRECTIONS: Record<string, string> = { north: 'N', east: 'E', south: 'S', west: 'W' };
const EXPERIENCE_ICONS = [Leaf, Martini, Compass, Mountain];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

export function BrandServices({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  const first = site.services[0]?.title ?? '';
  const barOptions = barServiceOptions(site.content);
  return <>
    <section className="wr-banner services" aria-labelledby="services-title">
      <img src={c('services.image')} alt="" width={1536} height={1024} fetchPriority="high" />
      <div className="wr-banner-copy">
        <Eyebrow>Our services</Eyebrow>
        <h1 id="services-title">{c('services.title')}</h1>
        <Swash />
        <p>{c('services.lead')}</p>
      </div>
    </section>
    <section className="wr-section" aria-label="Services">
      <div className="wr-service-grid">{site.services.map(service => {
        const isBar = service.title === MOBILE_BAR_SERVICE;
        const label = SERVICE_BUTTONS[service.title] ?? 'Inquire';
        return <article key={service.title} className="wr-service-card">
          <img src={service.image || c('services.image')} alt="" width={1536} height={1024} loading="lazy" />
          <div className="wr-service-card-body">
            <h2>{service.title}</h2>
            <p>{service.description}</p>
            {service.details && <p className="wr-service-details">{service.details}</p>}
            {service.price && <p className="service-price">{service.price}</p>}
            <button className="wr-button" onClick={() => isBar ? scrollToId('compass-collections') : book(service.title)}>{label}<span className="sr-only"> for {service.title}</span> <ArrowRight size={15} aria-hidden="true" /></button>
          </div>
        </article>;
      })}</div>
    </section>
    <CompassCollections book={book} site={site} options={barOptions} />
    <section className="wr-icon-strip tinted" aria-labelledby="experience-title">
      <h2 id="experience-title" className="wr-rule-title">{c('services.experienceTitle')}</h2>
      <ul>{[1, 2, 3, 4].map((n, i) => { const Icon = EXPERIENCE_ICONS[i]; return <li key={n}><Icon size={34} strokeWidth={1.3} aria-hidden="true" /><span>{c(`services.exp${n}`)}</span></li>; })}</ul>
    </section>
    <section className="wr-cta-box-wrap" aria-labelledby="services-cta-title">
      <img src={c('home.heroImage')} alt="" loading="lazy" />
      <div className="wr-cta-box">
        <h2 id="services-cta-title">{c('services.ctaTitle')}</h2>
        <p>{c('services.ctaBody')}</p>
        <button className="wr-button light" onClick={() => book(first)}>Inquire about your event <ArrowRight size={16} aria-hidden="true" /></button>
      </div>
    </section>
  </>;
}

function CompassCollections({ book, site, options }: PageProps & { options: string[] }) {
  const c = (key: string) => readContent(site.content, key);
  return <section className="compass-section" id="compass-collections" aria-labelledby="compass-title">
    <div className="brand-section">
      <div className="compass-heading"><p className="brand-caption">{c('bar.caption')}</p><h2 id="compass-title"><Headline text={c('bar.collectionsTitle')} /></h2><p>{c('bar.collectionsLead')}</p></div>
      <div className="compass-grid">{COMPASS_KEYS.map(([key], index) => <article key={key} className="compass-card">
        <span className="compass-mark" aria-hidden="true">{DIRECTIONS[key]}</span>
        <h3>{c(`bar.${key}.title`)}</h3>
        <p className="compass-subtitle">{c(`bar.${key}.subtitle`)}</p>
        <p>{c(`bar.${key}.body`)}</p>
        <button className="button secondary" onClick={() => book(options[index])}>Inquire<span className="sr-only"> about {c(`bar.${key}.title`)}</span></button>
      </article>)}</div>
      <article className="compass-card compass-onsite">
        <div><h3>{c('bar.onsite.title')}</h3><p>{c('bar.onsite.body')}</p></div>
        <button className="button secondary" onClick={() => book(options[options.length - 1])}>Inquire<span className="sr-only"> about {c('bar.onsite.title')}</span></button>
      </article>
      <p className="compass-note">{c('bar.dryHire')}</p>
    </div>
  </section>;
}

export function BrandGallery({ book, site, photos, onOpen }: PageProps & PhotoProps) {
  const c = (key: string) => readContent(site.content, key);
  const first = site.services[0]?.title ?? '';
  const known = GALLERY_CATEGORIES as readonly string[];
  const groups = [...known, ...Array.from(new Set(photos.map(p => p.category as string))).filter(cat => !known.includes(cat))]
    .filter(cat => photos.some(p => p.category === cat));
  const tabs = ['All', ...groups];
  const [tab, setTab] = useState(groups[0] ?? 'All');
  const list = tab === 'All' ? photos : photos.filter(p => p.category === tab);
  const slug = featureSlug(tab);
  const feature = tab === 'All' ? null : { title: c(`gallery.${slug}.title`), body: c(`gallery.${slug}.body`), credit: c(`gallery.${slug}.credit`) };
  return <>
    <section className="wr-banner gallery centered" aria-labelledby="gallery-title">
      <img src={c('gallery.image')} alt="" width={1600} height={1068} fetchPriority="high" />
      <div className="wr-banner-copy">
        <h1 id="gallery-title" className="wr-spaced-title">{c('gallery.title')}</h1>
        <p className="wr-script">{c('gallery.script')}</p>
        <Swash />
      </div>
    </section>
    <section className="wr-section wr-gallery" aria-label="Gallery">
      <div className="wr-tabs" aria-label="Gallery groups">{tabs.map(t => <button key={t} aria-pressed={t === tab} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {list.length === 0 ? <p className="wr-empty">New photos are on the way.</p> : <div className={feature?.title ? 'wr-gallery-layout' : 'wr-gallery-layout full'}>
        {feature?.title && <aside className="wr-feature-panel">
          <p className="wr-eyebrow small"><span>Featured celebration</span></p>
          <span className="wr-rule" aria-hidden="true" />
          <h2>{feature.title}</h2>
          {feature.body && <p>{feature.body}</p>}
          {feature.credit && <><span className="wr-rule" aria-hidden="true" /><p className="wr-credit">{feature.credit}</p></>}
          <button className="wr-button" onClick={() => book(first)}>Plan your celebration</button>
        </aside>}
        <div className="wr-gallery-grid">{list.map((item, i) => <button key={item.id} className="wr-photo" onClick={() => onOpen(list, i)} aria-label={`Enlarge photo: ${item.title}`}>
          <img src={item.image} alt={item.title} loading="lazy" />
          {item.inspiration !== false && <span className="inspiration-badge">Inspiration</span>}
        </button>)}</div>
      </div>}
    </section>
    <CtaBand title={c('gallery.ctaTitle')} body={c('gallery.ctaBody')} button="Inquire about your event" onClick={() => book(first)} />
  </>;
}

export function PartnerSection({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  return <section className="partner-section brand-section" aria-labelledby="partner-title">
    <div><p className="brand-caption">{c('partner.caption')}</p><h2 id="partner-title"><Headline text={c('partner.title')} /></h2></div>
    <div><p>{c('partner.body')}</p><button className="button secondary" onClick={() => book(PARTNER_OPTION)}>{c('partner.button')}</button></div>
  </section>;
}

export function BrandEvents({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  const first = site.services[0]?.title ?? '';
  return <>
    <section className="brand-page-intro"><p className="brand-caption">{c('events.caption')}</p><h1><Headline text={c('events.title')} /></h1><p>{c('events.lead')}</p></section>
    <section className="brand-section event-category-section" aria-label="Events we celebrate">
      <div className="event-category-grid">{EVENT_CATEGORY_DEFAULTS.map((_, index) => {
        const n = index + 1;
        const title = c(`events.cat${n}.title`);
        if (!title) return null;
        return <article key={n} className="event-category">
          <img src={c(`events.cat${n}.image`)} alt="" width={1536} height={1024} loading="lazy" />
          <h2>{title}</h2>
          <p>{c(`events.cat${n}.body`)}</p>
          <button className="quiet-link" onClick={() => book(first)}>Plan your event<span className="sr-only">: {title}</span></button>
        </article>;
      })}</div>
    </section>
    <PartnerSection book={book} site={site} />
  </>;
}
