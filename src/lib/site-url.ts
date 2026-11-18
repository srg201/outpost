/**
 * The public origin, for metadata, robots and the sitemap: NEXT_PUBLIC_SITE_URL when set (a custom
 * domain), else the production domain Vercel provides, else the dev server.
 */
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelDomain ? `https://${vercelDomain}` : "http://localhost:3000")
).replace(/\/$/, "");
