import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, hasLocale, localeFromAcceptLanguage, splitLocale } from "@/i18n/config";

// Signed-out visitors to these routes are sent to sign-in (also matches /workspaces).
const PROTECTED = /^\/(dashboard|workspace)/;
// Signed-in users have no reason to see these, so they go to the dashboard.
const AUTH_PAGES = /^\/(sign-in|sign-up)/;
// Not pages: never rewritten into a locale (APIs, and files like /manifest.json or /robots.txt).
const NO_LOCALE = /^\/(api|trpc|__clerk)(\/|$)|\.[a-z0-9]+$/i;

const ONE_YEAR = 60 * 60 * 24 * 365;

function preferredLocale(req: NextRequest) {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (hasLocale(cookie)) return cookie;
  return localeFromAcceptLanguage(req.headers.get("accept-language")) ?? DEFAULT_LOCALE;
}

// URLs stay clean ("/dashboard"); the locale comes from the cookie, then the browser language.
// An explicit "/ru/..." still works and becomes the saved choice.
export default clerkMiddleware(async (auth, req) => {
  const { pathname, search } = req.nextUrl;
  if (NO_LOCALE.test(pathname)) return;

  const { locale: urlLocale, path } = splitLocale(pathname);

  if (PROTECTED.test(path)) await auth.protect();

  if (AUTH_PAGES.test(path)) {
    const { userId } = await auth();
    if (userId) return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (urlLocale) {
    const res = NextResponse.next();
    if (req.cookies.get(LOCALE_COOKIE)?.value !== urlLocale) {
      res.cookies.set(LOCALE_COOKIE, urlLocale, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
    }
    return res;
  }

  return NextResponse.rewrite(new URL(`/${preferredLocale(req)}${pathname}${search}`, req.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|webm|mp4|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
