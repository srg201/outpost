"use client";

import { usePathname } from "next/navigation";

import SiteHeader from "./site-header";
import { splitLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

/** Routes that take the whole screen, without the site header and footer. */
const FULL_SCREEN_PREFIXES = ["/workspace/", "/shared/"];

// The footer is a Server Component (it reads the dictionary itself), so the layout passes it in.
const AppShell = ({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) => {
  const { path: pathname } = splitLocale(usePathname());
  const { common } = useI18n().dict;
  const isFullScreenRoute = FULL_SCREEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isFullScreenRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-1 flex-col pt-18">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:outline-none"
      >
        {common.skipToContent}
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      {footer}
    </div>
  );
};

export default AppShell;
