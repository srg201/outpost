"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { ModeToggle } from "../mode-toggle";
import { LocaleSwitcher } from "../locale-switcher";
import { CommandPalette } from "../command-palette";
import { useI18n } from "@/i18n/client";
import { splitLocale } from "@/i18n/config";
import { Logo } from "./logo";
import PlanButton from "./plan-button";
import { TeamSwitcher } from "./team-switcher";


const SiteHeader = () => {
  const { path: pathname } = splitLocale(usePathname());
  const isLandingPage = pathname === "/";
  const { isSignedIn } = useAuth();
  const { nav, common } = useI18n().dict;
  // The landing page links to its sections; inside the app the header links its main pages.
  const navLinks = isLandingPage
    ? [
        { href: "/#product", label: nav.product },
        { href: "/#how-it-works", label: nav.howItWorks },
        { href: "/#pricing", label: nav.pricing },
      ]
    : isSignedIn
      ? [
          { href: "/dashboard", label: common.dashboard },
          { href: "/workspaces", label: nav.board },
        ]
      : [];
  const isCurrent = (href: string) => href === pathname;
  // Each link in the mobile menu closes it on click.
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-18 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-md sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10">
      <Logo className="justify-self-start" priority />

      {/* Desktop nav */}
      {navLinks.length > 0 && (
        <NavigationMenu aria-label={nav.main} className="hidden md:flex">
          <NavigationMenuList className="gap-1">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  render={<Link href={link.href} aria-current={isCurrent(link.href) ? "page" : undefined} />}
                  active={isCurrent(link.href)}
                  className="px-4 py-2 font-medium data-active:bg-muted"
                >
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      )}

      {/* Desktop actions. Fixed height keeps the nav centered while Clerk loads */}
      <div className="col-start-3 hidden h-9 items-center justify-end gap-2 md:flex">
        <LocaleSwitcher />
        <ModeToggle />
        <ClerkLoading>
          <Skeleton className="h-8 w-36" />
        </ClerkLoading>
        <ClerkLoaded>
          <Suspense>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost">{common.signIn}</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>{common.signUp}</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <CommandPalette />
              {isLandingPage ? (
                <Button nativeButton={false} render={<Link href="/dashboard" />}>
                  {common.dashboard}
                </Button>
              ) : (
                <>
                  <TeamSwitcher />
                  <PlanButton />
                </>
              )}
              <UserButton />
            </Show>
          </Suspense>
        </ClerkLoaded>
      </div>

      {/* Mobile actions */}
      <div className="flex h-9 items-center gap-1 md:hidden">
        <LocaleSwitcher />
        <ModeToggle />
        <ClerkLoaded>
          <Suspense>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </Suspense>
        </ClerkLoaded>

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label={nav.openMenu}>
                <HugeiconsIcon icon={Menu01Icon} className="size-5" aria-hidden />
              </Button>
            }
          />
          <SheetContent side="right" className="w-full max-w-xs gap-0">
            <SheetHeader className="border-b border-border/60">
              <SheetTitle className="sr-only">{nav.menu}</SheetTitle>
              <Logo className="w-fit" />
            </SheetHeader>

            <nav aria-label={nav.mobile} className="flex flex-col gap-1 p-2">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="lg"
                  className="h-12 justify-start rounded-lg px-3 text-base"
                  nativeButton={false}
                  render={<Link href={link.href} />}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Button>
              ))}
            </nav>

            <SheetFooter className="mt-auto border-t border-border/60">
              <ClerkLoading>
                <Skeleton className="h-10 w-full" />
              </ClerkLoading>
              <ClerkLoaded>
                <Suspense>
                  <Show when="signed-out">
                    <Button
                      size="lg"
                      variant="outline"
                      nativeButton={false}
                      render={<Link href="/sign-in" />}
                      onClick={() => setMenuOpen(false)}
                    >
                      {common.signIn}
                    </Button>
                    <Button
                      size="lg"
                      nativeButton={false}
                      render={<Link href="/sign-up" />}
                      onClick={() => setMenuOpen(false)}
                    >
                      {common.signUp}
                    </Button>
                  </Show>
                  <Show when="signed-in">
                    <TeamSwitcher className="h-12 max-w-none justify-start px-3 text-base" />
                    <Button
                      size="lg"
                      nativeButton={false}
                      render={<Link href="/dashboard" />}
                      onClick={() => setMenuOpen(false)}
                    >
                      {common.dashboard}
                    </Button>
                  </Show>
                </Suspense>
              </ClerkLoaded>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default SiteHeader;
