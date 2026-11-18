"use server";

import * as Y from "yjs";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-access";

/**
 * Saves the document: the Yjs state (the source of truth for collaboration) and a readable
 * JSON copy of the blocks for server-side features (the agent, the shared view, PDF export).
 *
 * Called on a debounce while typing. No refresh: the editor already holds the latest content,
 * and re-rendering would only fight in-flight local edits.
 */
export async function saveDocContent(workspaceId: string, yjsState: string, content: Prisma.InputJsonValue) {
  if (!(await canAccessWorkspace(workspaceId))) throw new Error("Workspace not found");

  const incoming = Buffer.from(yjsState, "base64");

  // Merge into the stored state rather than overwrite it, with the row locked, so two people
  // saving at the same moment can't drop each other's edits.
  await prisma.$transaction(async (tx) => {
    const [row] = await tx.$queryRaw<{ yjsState: Uint8Array | null }[]>`
      SELECT "yjsState" FROM "Doc" WHERE "workspaceId" = ${workspaceId} FOR UPDATE`;
    const merged = row?.yjsState ? Y.mergeUpdates([row.yjsState, incoming]) : incoming;

    await tx.doc.update({
      where: { workspaceId },
      data: { yjsState: Uint8Array.from(merged), content },
    });
  });
}
