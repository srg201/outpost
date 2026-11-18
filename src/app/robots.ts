import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

// Only the landing pages are public content; everything else is behind sign-in or a private link.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/workspace", "/shared/", "/*/dashboard", "/*/workspace", "/*/shared/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
