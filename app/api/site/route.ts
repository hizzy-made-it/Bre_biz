import { loadSite, publicSite } from "@/lib/site-store";
import { json } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json(publicSite(loadSite().state), 200, { "Cache-Control": "public, max-age=0, must-revalidate" });
  } catch {
    return json({ error: "Site content is unavailable" }, 500);
  }
}
