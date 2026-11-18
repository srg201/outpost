import type { MetadataRoute } from "next";

import { LOCALES } from "@/i18n/config";
import { SITE_URL } from "@/lib/site-url";

// The landing page in each language, linked to its translations.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}`]));
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
  }));
}
