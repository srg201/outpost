"use client";

import { usePathname } from "next/navigation";

import SiteHeader from "./site-header";
import { SiteFooter } from "./site-footer";

/** Routes that take the whole screen, without the site header and footer. */
const FULL_SCREEN_PREFIXES = ["/workspace/", "/shared/"];

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
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
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
};

export default AppShell;
