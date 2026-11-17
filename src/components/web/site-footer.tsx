import Link from "next/link";

import { Logo } from "@/components/web/logo";

const LINKS = {
  Product: [
    { label: "Features", href: "/#product" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
  ],
  Account: [
    { label: "Sign in", href: "/sign-in" },
    { label: "Sign up", href: "/sign-up" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export function SiteFooter() {
  return (
    <footer aria-label="Site footer" className="border-t border-border/60 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <Logo className="w-fit" />
          <p className="mt-4 text-sm text-muted-foreground">
            Docs, canvas and an AI agent in one workspace.
          </p>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:gap-16">
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{group}</h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="rounded-sm transition-colors hover:text-amber-500 focus-visible:text-amber-500 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl justify-between border-t border-border/60 pt-6 font-mono text-xs text-muted-foreground">
        {/* Static year: `new Date()` isn't allowed in a prerendered page with Cache Components */}
        <span>© 2026 Outpost</span>
        <span>Early Access</span>
      </div>
    </footer>
  );
}
