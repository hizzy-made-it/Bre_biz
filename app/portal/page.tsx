import type { Metadata } from "next";
import PortalApp from "@/components/portal/PortalApp";
import { LoginForm } from "@/components/admin/LoginForm";
import { BrandLogo } from "@/components/BrandLogo";
import { currentClient, portalView } from "@/lib/portal";
import { stripeReady } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Client login · Wander & Revel", robots: { index: false, follow: false } };

export default async function PortalPage() {
  const found = await currentClient();
  if (found) return <PortalApp initial={portalView(found.client, found.state, stripeReady())} />;
  return <main className="access-page"><section className="access-card">
    <a className="brand-logo-link" href="/" aria-label="Wander & Revel home"><BrandLogo /></a>
    <span className="small-label">Client login</span>
    <h1>Your event, all in one place.</h1>
    <p>See your schedule, guest count, menu and payments. Use the email you booked with and the access code we sent you.</p>
    <LoginForm endpoint="/api/portal/login" submitLabel="View my event" fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "code", label: "Access code", type: "text", autoComplete: "one-time-code" }]} />
    <p className="muted"><a href="/">← Back to the website</a></p>
  </section></main>;
}
