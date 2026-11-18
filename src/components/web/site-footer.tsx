import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Show } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./logo";
import { getDictionary } from "@/i18n/get-dictionary";

export async function SiteFooter() {
  const { footer, nav, common } = await getDictionary();
  const linkGroups = [
    {
      title: footer.product,
      links: [
        { label: footer.features, href: "/#product" },
        { label: nav.howItWorks, href: "/#how-it-works" },
        { label: nav.pricing, href: "/#pricing" },
      ],
    },
    {
      title: footer.account,
      links: [
        { label: common.signIn, href: "/sign-in", signedOutOnly: true },
        { label: common.signUp, href: "/sign-up", signedOutOnly: true },
        { label: common.dashboard, href: "/dashboard" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/60 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo className="w-fit" />
            <p className="mt-4 text-sm text-muted-foreground">{footer.tagline}</p>
          </div>

          <nav aria-label={footer.label} className="grid grid-cols-2 gap-10 sm:gap-16">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{group.title}</h2>
                <ul className="mt-4 flex flex-col gap-2">
                  {group.links.map((link) => {
                    const item: ReactNode = (
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
                    );
                    // Signing in makes no sense once signed in; the footer is prerendered, so the
                    // check runs in the browser (like the header's).
                    return "signedOutOnly" in link ? (
                      <Suspense key={link.href}>
                        <Show when="signed-out">{item}</Show>
                      </Suspense>
                    ) : (
                      item
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <Separator className="mt-12 bg-border/60" />

        <div className="flex justify-between pt-6 font-mono text-xs text-muted-foreground">
          {/* Static year: `new Date()` isn't allowed in a prerendered page with Cache Components */}
          <p>© 2026 Outpost</p>
          <p>{footer.earlyAccess}</p>
        </div>
      </div>
    </footer>
  );
}
