import type { ReactNode } from 'react';
import type { ServiceItem } from '@/lib/demo-types';
import { readContent } from '@/lib/site-defaults';

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
  const fallback = site.services[site.services.length - 1]?.title ?? '';
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

export function BrandServices({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  return <>
    <section className="brand-page-intro"><p className="brand-caption">Our services</p><h1><Headline text={c('services.title')} /></h1><p>{c('services.lead')}</p></section>
    <section className="brand-service-detail brand-section"><div className="brand-service-photo"><img src={c('services.image')} alt="Event setting with an inviting bar and styled tables" width={1536} height={1024} /></div><div>{site.services.map(service => <article key={service.title}><h2>{service.title}</h2><p>{service.description}</p>{service.details && <p>{service.details}</p>}{service.price && <p className="service-price">{service.price}</p>}<button className="quiet-link" onClick={() => book(service.title)}>Inquire about this service<span className="sr-only">: {service.title}</span></button></article>)}</div></section>
    <section className="brand-budget-note brand-section"><h2>{c('services.noteTitle')}</h2><Paragraphs text={c('services.note')} /><a className="quiet-link" href="#menu">Explore our food &amp; bar menus</a></section>
    <BrandInvitation book={book} site={site} />
  </>;
}

export function BrandInvitation({ book, site }: PageProps) {
  const c = (key: string) => readContent(site.content, key);
  return <section className="brand-invitation"><h2><Headline text={c('invite.title')} /></h2><p>{c('invite.body')}</p><button className="button primary" onClick={() => book(site.services[site.services.length - 1]?.title ?? '')}>Inquire about your event</button></section>;
}
