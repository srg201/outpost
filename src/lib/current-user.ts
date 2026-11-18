import "server-only";

import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

/**
 * The database user for the signed-in Clerk user, created or refreshed on the way (an upsert,
 * so two concurrent requests can't both create the row). Null when signed out or when the
 * Clerk account has no email address.
 *
 * Server-only rather than a Server Action, so it isn't exposed as an endpoint. `cache` makes
 * every caller in one request (page, sections, metadata) share a single lookup.
 */
export const getCurrentUser = cache(async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: { clerkId: clerkUser.id, email, name, imageUrl: clerkUser.imageUrl },
    update: { email, name, imageUrl: clerkUser.imageUrl },
  });
});
