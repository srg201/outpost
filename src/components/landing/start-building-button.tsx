"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";

/**
 * Primary call to action. Signed-in users go straight to their dashboard;
 * everyone else goes to sign up. While Clerk is still loading it points to
 * sign up, and /sign-up itself forwards a signed-in user on, so the link is
 * never wrong for long.
 */
export function StartBuildingButton({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();
  const href = isSignedIn ? "/dashboard" : "/sign-up";

  return (
    <Button size="lg" className={className} nativeButton={false} render={<Link href={href} />}>
      Start Building Free
      <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" aria-hidden />
    </Button>
  );
}
