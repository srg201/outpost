import "server-only";

import { cache } from "react";

import { getEntitlements, workspaceOwnerId, workspaceOwnerSelect } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { canAccessWorkspace } from "@/lib/workspace-access";

/**
 * The workspace for its page, or null when it doesn't exist or the user can't open it
 * (the page answers 404 either way, so outsiders can't tell whether an id exists).
 * Wrapped in `cache` so generateMetadata and the page share one lookup per request.
 */
export const getWorkspace = cache(async (id: string) => {
  if (!(await canAccessWorkspace(id))) return null;

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    select: { id: true, name: true, shareToken: true, ...workspaceOwnerSelect },
  });
  if (!workspace) return null;

  const entitlements = await getEntitlements(workspaceOwnerId(workspace));
  return { ...workspace, entitlements };
});
