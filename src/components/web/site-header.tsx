import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  ClerkLoaded,
  ClerkLoading,
  Show,
  SignInButton,
  SignUpButton,
  useAuth,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { ModeToggle } from "../mode-toggle";
import { usePathname } from "next/navigation";

const SiteHeader = () => {
    const pathname = usePathname()
  const { isSignedIn } = useAuth();
  const isLandingPage = pathname === "/";
  return (
    <header className="fixed inset-x-0 top-0 z-20 grid h-18 grid-cols-[1fr_auto_1fr] items-center border-b border-border/60 bg-background/70 px-6 backdrop-blur-md md:px-10">
      <Link className="flex items-center justify-self-start" href={"/"}>
        {/* Both logos render; CSS picks one, so there's no flash on load */}
        <Image
          src={"/brand/logo-navbar-light.png"}
          alt="Outpost"
          width={314}
          height={160}
          className="h-9 w-auto dark:hidden"
          priority
        />
        <Image
          src={"/brand/logo-navbar-dark.png"}
          alt="Outpost"
          width={314}
          height={160}
          className="hidden h-9 w-auto dark:block"
          priority
        />
      </Link>

      {isLandingPage && (
        <nav className="flex gap-4 items-center">
          <Button
            nativeButton={false}
            variant={"link"}
            render={<Link href={"/product"}>Product</Link>}
          />
          <Button
            nativeButton={false}
            variant={"link"}
            render={<Link href={"/how-it-works"}>How it works</Link>}
          />
          <Button
            nativeButton={false}
            variant={"link"}
            render={<Link href={"/Pricing"}>Pricing</Link>}
          />
        </nav>
      )}

      {/* Fixed-height right column: keeps the nav centered while Clerk loads */}
      <div className="col-start-3 flex h-9 items-center justify-end gap-2">
        <ModeToggle />
        <ClerkLoading>
          <Skeleton className="h-8 w-36" />
        </ClerkLoading>
        <ClerkLoaded>
          <Suspense>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant={"ghost"}>Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign up</Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button nativeButton={false} render={<Link href={'/dashboard'}></Link>} >Dashboard</Button>
              <UserButton />
            </Show>
          </Suspense>
        </ClerkLoaded>
      </div>
    </header>
  );
};

export default SiteHeader;
