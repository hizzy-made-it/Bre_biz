import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// The public site is a single page today; add routes here as real pages are added.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
