"use server";

import { auth } from "@clerk/nextjs/server";

import type { Prisma } from "@/generated/prisma/client";
import { signCanvasTicket } from "@/lib/canvas-ticket";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-access";

async function assertAccess(workspaceId: string) {
  if (!(await canAccessWorkspace(workspaceId))) throw new Error("Workspace not found");
}

/** A ticket for this workspace's canvas room on the sync Worker. Asked for on every (re)connect. */
export async function getCanvasTicket(workspaceId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  await assertAccess(workspaceId);
  return signCanvasTicket(workspaceId, userId);
}

/**
 * Saves a snapshot of the canvas to Postgres. The sync Worker is the live source of truth; this
 * copy seeds a room that starts empty and feeds server-side features (the agent, sharing, export).
 * Called on a debounce, so no refresh.
 */
export async function saveCanvasContent(workspaceId: string, content: Prisma.InputJsonValue) {
  await assertAccess(workspaceId);
  await prisma.canvas.update({ where: { workspaceId }, data: { content } });
}
