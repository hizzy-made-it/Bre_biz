import type { ReactNode } from 'react';

export const brandServices = [
  { title: 'Wedding & day-of coordination', description: 'Be present for the moments that matter. Thoughtful coordination brings your plans, people, and timeline together.', details: 'Wedding-day timelines, vendor coordination, and support with the details of your celebration.' },
  { title: 'Mobile bartending', description: 'A welcoming bar, beautifully considered drinks, and something for every guest to enjoy.', details: 'A personalized bar experience, cocktail and alcohol-free menu ideas, and thoughtful setup.' },
  { title: 'Private parties & special events', description: 'From an intimate dinner to a milestone celebration, make space for good company and meaningful moments.', details: 'Support for birthdays, showers, anniversaries, gatherings, and other occasions worth celebrating.' },
  { title: 'Setup, styling & teardown', description: 'The finishing touches make a difference. Let the setting feel as considered as the occasion.', details: 'Help bringing your décor and layout together, arranging event details, and packing down afterward.' },
  { title: 'Customized event support', description: 'A little guidance or an extra pair of hands. We start with what you need and build from there.', details: 'A flexible scope shaped around your priorities, your plans, and a budget you feel comfortable discussing.' },
];

type InquiryAction = { book: (service: string) => void };

export function BrandHome({ book, children }: InquiryAction & { children: ReactNode }) {
  return <>
    <section className="story-hero" aria-labelledby="story-title">
      <div className="story-hero-copy">
        <p className="brand-caption">Wander &amp; Revel Event Services</p>
        <h1 id="story-title">A Place for<br />Every Story.</h1>
        <p>Thoughtful celebrations, beautifully brought together.</p>
        <p>From wedding days to just-because gatherings, we help bring your vision to life with warmth, care, and room for what makes it yours.</p>
        <div className="story-actions"><button className="button primary" onClick={() => book('Customized event support')}>Inquire about your event</button><a className="quiet-link" href="#services">Explore our services</a></div>
      </div>
      <figure className="story-hero-image"><img src="/images/details.webp" alt="Event inspiration: an intimate garden table with linen, flowers, and candlelight" width={1536} height={1024} fetchPriority="high" /><figcaption>Imagine the gathering. Make it your own.</figcaption></figure>
    </section>
    <section className="brand-introduction brand-section">
      <p className="brand-caption">Welcome to Wander &amp; Revel</p>
      <h2>Every celebration begins<br />with your story.</h2>
      <p>The people you love. The moments you want to remember. The details that feel like you. We believe a beautiful event starts with listening, then finding a thoughtful way to bring it all together.</p>
      <a className="quiet-link" href="#about">Get to know our approach</a>
    </section>
    <section className="brand-services-home brand-section" aria-labelledby="home-services-title">
      <div className="brand-section-heading"><h2 id="home-services-title">A little support.<br />A world of possibility.</h2><p>Choose the help that feels right for your occasion. We’ll start with your priorities and shape the details around them.</p></div>
      <div className="brand-service-list">{brandServices.map(service => <article key={service.title}><h3><a href="#services">{service.title}</a></h3><p>{service.description}</p></article>)}<div className="brand-service-invitation"><p>Not quite sure where to start?</p><button className="quiet-link" onClick={() => book('Customized event support')}>Tell us what you’re imagining</button></div></div>
    </section>
    <section className="brand-gallery-home brand-section"><div className="brand-section-heading"><h2>Room for inspiration.</h2><a className="quiet-link" href="#gallery">Explore the gallery</a></div>{children}<p className="editorial-note">AI-created event inspiration for this concept demo. These images do not show completed client events.</p></section>
    <BrandInvitation book={book} />
  </>;
}

export function BrandAbout({ book }: InquiryAction) {
  return <>
    <section className="brand-page-intro"><p className="brand-caption">About us</p><h1>Thoughtful by nature.<br />Personal by design.</h1><p>A Place for Every Story.</p></section>
    <section className="brand-about brand-section"><img src="/images/celebration.webp" alt="Concept inspiration: a welcoming courtyard set for a celebration" width={1536} height={1024} /><div><h2>A celebration that<br />feels like you.</h2><p>Wander &amp; Revel is built around a simple philosophy: every celebration is unique, and every story deserves a place to unfold.</p><p>Our role is to listen to your vision and help bring it to life. Whether you’re gathering a few favorite people or planning a wedding day, we approach the details with the same care.</p><p>We believe professional support can feel warm and approachable. Share your priorities, your ideas, and your budget. Together, those are the starting point for an event that feels personal and thoughtfully put together.</p></div></section>
    <section className="brand-values brand-section"><article><h2>Listen first.</h2><p>The best starting point is you: what you love, what matters most, and how you want the day to feel.</p></article><article><h2>Care for the details.</h2><p>A considered plan makes room for connection, from the first welcome to the last goodnight.</p></article><article><h2>Make room for possibility.</h2><p>Beautiful experiences take many forms. We welcome different ideas, celebrations, and budgets.</p></article></section>
    <BrandInvitation book={book} />
  </>;
}

export function BrandServices({ book }: InquiryAction) {
  return <>
    <section className="brand-page-intro"><p className="brand-caption">Our services</p><h1>Your vision.<br />Thoughtfully supported.</h1><p>From the first idea to the final details, choose the support your celebration needs.</p></section>
    <section className="brand-service-detail brand-section"><div className="brand-service-photo"><img src="/images/celebration.webp" alt="Event inspiration: a garden celebration with an inviting bar and styled tables" width={1536} height={1024} /><p className="editorial-note">Concept imagery for inspiration.</p></div><div>{brandServices.map(service => <article key={service.title}><h2>{service.title}</h2><p>{service.description}</p><p>{service.details}</p><button className="quiet-link" onClick={() => book(service.title)}>Inquire about this service<span className="sr-only">: {service.title}</span></button></article>)}</div></section>
    <section className="brand-budget-note brand-section"><h2>Good plans start with a conversation.</h2><p>You don’t need every detail figured out. Tell us your date, location, guest count, and what you have in mind. Share a budget range if you’d like, and use the additional details field for any combination of services.</p><p>Scope, availability, and pricing would be confirmed in a personal proposal. This private demo does not generate quotes or reserve dates.</p><a className="quiet-link" href="#food-menu">Explore sample food menu ideas</a></section>
    <BrandInvitation book={book} />
  </>;
}

export function BrandInvitation({ book }: InquiryAction) {
  return <section className="brand-invitation"><h2>Let’s make room<br />for your story.</h2><p>Big plans, small gatherings, and all the possibilities in between.</p><button className="button primary" onClick={() => book('Customized event support')}>Inquire about your event</button></section>;
}
