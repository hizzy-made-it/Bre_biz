import SiteApp from "@/components/site/SiteApp";
import { loadSite, publicSite } from "@/lib/site-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function Page() {
  return <SiteApp initial={publicSite(loadSite().state)} />;
}
