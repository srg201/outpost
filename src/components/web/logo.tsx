"use client";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { useI18n } from "@/i18n/client";

/**
 * Outpost wordmark linking home. Both theme variants render and CSS shows the
 * right one, so there's no flash before the theme is known.
 */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  const { isSignedIn } = useAuth();
  const { common } = useI18n().dict;
  return (
    <Link
      href={isSignedIn ? "/dashboard" : "/"}
      aria-label={common.homeLabel}
      className={cn(
        "flex items-center rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      {/* alt="" because the link itself carries the accessible name */}
      <Image
        src="/brand/logo-navbar-light.png"
        alt=""
        width={314}
        height={160}
        className="h-8 w-auto md:h-9 dark:hidden"
        priority={priority}
      />
      <Image
        src="/brand/logo-navbar-dark.png"
        alt=""
        width={314}
        height={160}
        className="hidden h-8 w-auto md:h-9 dark:block"
        priority={priority}
      />
    </Link>
  );
}
