"use server";

import { currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

/**
 * Returns the database user for the signed-in Clerk user, creating or
 * refreshing it on first visit. Returns null when signed out or when the
 * Clerk account has no email address.
 *
 * Uses an upsert so two concurrent requests can't both try to create the row.
 */
export async function checkUser() {
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
}
