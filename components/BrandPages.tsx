import type { ReactNode } from 'react';
import type { ServiceItem } from '@/lib/demo-types';
import { barServiceOptions, COMPASS_KEYS, EVENT_CATEGORY_DEFAULTS, MOBILE_BAR_SERVICE, PARTNER_OPTION, readContent } from '@/lib/site-defaults';

export type SiteCopy = { content: Record<string, string>; services: ServiceItem[] };
type InquiryAction = { book: (service: string) => void };
type PageProps = InquiryAction & { site: SiteCopy };

/** Headlines are stored on one line; a period followed by a space becomes a line break, as in the original design. */
function Headline({ text }: { text: string }) {
  const parts = text.split(/(?<=[.!?])\s+(?=\S)/);
  return <>{parts.map((part, i) => <span key={i}>{part}{i < parts.length - 1 && <br />}</span>)}</>;
}
function Paragraphs({ text }: { text: string }) {
  return <>{text.split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}</>;
}

export function BrandHome({ book, site, children }: PageProps & { children: ReactNode }) {
  const c = (key: string) => readContent(site.content, key);
  const fallback = site.services[0]?.title ?? '';
  return <>
    <section className="story-hero" aria-labelledby="story-title">
      <div className="story-hero-copy">
        <p className="brand-caption">{c('home.caption')}</p>
        <h1 id="story-title"><Headline text={c('home.title')} /></h1>
        <p>{c('home.lead')}</p>
        <p>{c('home.body')}</p>
        <div className="story-actions"><button className="button primary" onClick={() => book(fallback)}>Inquire about your event</button><a className="quiet-link" href="#services">Explore our services</a></div>
      </div>
      <figure className="story-hero-image"><img src={c('home.heroImage')} alt={c('home.heroCaption') || 'Event inspiration'} width={1536} height={1024} fetchPriority="high" />{c('home.heroCaption') && <figcaption>{c('home.heroCaption')}</figcaption>}</figure>
    </section>
    <section className="brand-introduction brand-section">
      <p className="brand-caption">Welcome to Wander &amp; Revel</p>
      <h2><Headline text={c('home.welcomeTitle')} /></h2>
      <p>{c('home.welcomeBody')}</p>
      <a className="quiet-link" href="#about">Get to know our approach</a>
    </section>
    <section className="brand-services-home brand-section" aria-labelledby="home-services-title">
      <div className="brand-section-heading"><h2 id="home-services-title"><Headline text={c('home.servicesTitle')} /></h2><p>{c('home.servicesBody')}</p></div>
      <div className="brand-service-list">{site.services.map(service => <article key={service.title}><h3><a href="#services">{service.title}</a></h3><p>{service.description}</p>{service.price && <p className="service-price">{service.price}</p>}</article>)}<div className="brand-service-invitation"><p>Not quite sure where to start?</p><button className="quiet-link" onClick={() => book(fallback)}>Tell us what you’re imagining</button></div></div>
    </section>
    <section className="brand-gallery-home brand-section"><div className="brand-section-heading"><h2>Room for inspiration.</h2><a className="quiet-link" href="#gallery">Explore the gallery</a></div>{children}{c('home.galleryNote') && <p className="editorial-note">{c('home.galleryNote')}</p>}</section>
    <BrandInvitation book={book} site={site} />
  </>;
}

export function BrandAbout({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  return <>
    <section className="brand-page-intro"><p className="brand-caption">About us</p><h1><Headline text={c('about.title')} /></h1><p>{c('footer.tagline')}</p></section>
    <section className="brand-about brand-section"><img src={c('about.image')} alt="Wander & Revel event setting" width={1536} height={1024} /><div><h2><Headline text={c('about.storyTitle')} /></h2><Paragraphs text={c('about.story')} /></div></section>
    <section className="brand-values brand-section">{[1, 2, 3].map(n => <article key={n}><h2>{c(`about.value${n}Title`)}</h2><p>{c(`about.value${n}`)}</p></article>)}</section>
    <BrandInvitation book={book} site={site} />
  </>;
}

const DIRECTIONS: Record<string, string> = { north: 'N', east: 'E', south: 'S', west: 'W' };

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

export function BrandServices({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  const first = site.services[0]?.title ?? '';
  const barOptions = barServiceOptions(site.content);
  return <>
    <section className="brand-page-intro"><p className="brand-caption">Our services</p><h1><Headline text={c('services.title')} /></h1><p>{c('services.lead')}</p></section>
    <section className="brand-section service-grid-section" aria-labelledby="service-grid-title">
      <div className="brand-section-heading"><h2 id="service-grid-title"><Headline text={c('services.gridTitle')} /></h2><p>{c('services.gridLead')}</p></div>
      <div className="service-card-grid">{site.services.map(service => {
        const isBar = service.title === MOBILE_BAR_SERVICE;
        return <article key={service.title} className="service-tile">
          <img src={service.image || c('services.image')} alt="" width={1536} height={1024} loading="lazy" />
          <div className="service-tile-body">
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            {service.details && <p className="service-tile-details">{service.details}</p>}
            {service.price && <p className="service-price">{service.price}</p>}
            <div className="service-tile-actions">
              <button className="quiet-link" onClick={() => book(service.title)}>Inquire<span className="sr-only"> about {service.title}</span></button>
              {isBar && <button className="quiet-link" onClick={() => scrollToId('compass-collections')}>See the Compass Collections</button>}
            </div>
          </div>
        </article>;
      })}</div>
    </section>
    <CompassCollections book={book} site={site} options={barOptions} />
    <section className="brand-budget-note brand-section"><h2>{c('services.noteTitle')}</h2><Paragraphs text={c('services.note')} /><div className="budget-note-actions"><button className="button primary" onClick={() => book(first)}>Start your inquiry</button></div></section>
    <PartnerSection book={book} site={site} />
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
      {c('home.galleryNote') && <p className="editorial-note">{c('home.galleryNote')}</p>}
    </section>
    <PartnerSection book={book} site={site} />
  </>;
}

export function BrandInvitation({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  return <section className="brand-invitation"><h2><Headline text={c('invite.title')} /></h2><p>{c('invite.body')}</p><button className="button primary" onClick={() => book(site.services[0]?.title ?? '')}>Inquire about your event</button></section>;
}
