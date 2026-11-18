import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./logo";

const LINK_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#product" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Sign up", href: "/sign-up" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo className="w-fit" />
            <p className="mt-4 text-sm text-muted-foreground">Docs, canvas and an AI agent in one workspace.</p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:gap-16">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-2">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-foreground hover:text-amber-500"
                        nativeButton={false}
                        render={<Link href={link.href} />}
                      >
                        {link.label}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Separator className="mt-12 bg-border/60" />

        <div className="flex justify-between pt-6 font-mono text-xs text-muted-foreground">
          {/* Static year: `new Date()` isn't allowed in a prerendered page with Cache Components */}
          <p>© 2026 Outpost</p>
          <p>Early Access</p>
        </div>
      </div>
    </footer>
  );
}
