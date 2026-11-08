import { redirect } from "next/navigation";
import { getDemoUser } from "../demo-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandLogo } from "@/components/BrandLogo";
import AccessForm from "./form";

export const runtime = "nodejs";

export default async function DemoAccessPage() {
  if (await getDemoUser()) redirect("/");
  return (
    <main className="access-page">
      <section className="access-card">
        <div className="access-brand-row">
          <a className="brand-logo-link" href="/" aria-label="Wander & Revel Event Services home"><BrandLogo /></a>
          <ThemeToggle />
        </div>
        <span className="small-label">Wander &amp; Revel Event Services · Interactive concept demo</span>
        <h1>Step inside<br />the celebration.</h1>
        <p>Enter the demo access code to explore the event planner, sample booking flow and owner studio.</p>
        <AccessForm />
      </section>
    </main>
  );
}
