import type { Metadata } from "next";
import AdminApp from "@/components/admin/AdminApp";
import { LoginForm } from "@/components/admin/LoginForm";
import { BrandLogo } from "@/components/BrandLogo";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Wander & Revel", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (await isAdmin()) return <AdminApp />;
  return <main className="access-page"><section className="access-card">
    <a className="brand-logo-link" href="/" aria-label="Wander & Revel home"><BrandLogo /></a>
    <span className="small-label">Owner admin</span>
    <h1>Welcome back.</h1>
    <p>Sign in to manage your website, clients, menus and payments.</p>
    <LoginForm endpoint="/api/admin/login" submitLabel="Sign in" fields={[{ name: "password", label: "Admin password", type: "password", autoComplete: "current-password" }]} />
  </section></main>;
}
