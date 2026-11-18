"use server";

import { getPromptUsage, getWorkspaceOwnerId } from "@/lib/billing";
import { canAccessWorkspace } from "@/lib/workspace-access";

/** This month's agent prompts for the workspace's owner, for the counter in the agent panel. */
export async function getAgentUsage(workspaceId: string) {
  if (!(await canAccessWorkspace(workspaceId))) throw new Error("Workspace not found");
  return getPromptUsage(await getWorkspaceOwnerId(workspaceId));
}
