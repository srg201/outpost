"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";

import { WorkspaceStatus } from "@/generated/prisma/enums";
import { getEntitlements, workspaceOwnerSelect } from "@/lib/billing";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { FREE_WORKSPACE_LIMIT, type LimitError } from "@/lib/plan-limits";
import { canAccessWorkspace } from "@/lib/workspace-access";
import { getWorkspaceScope, scopeWhere } from "@/lib/workspace-scope";

// Workspace lists (dashboard, board) read the database on every request, nothing is cached,
// so after a change `refresh()` re-renders the page the user is on and the lists are current.

const MAX_NAME_LENGTH = 80;

function cleanName(name: string) {
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!trimmed) throw new Error("Workspace name is required");
  return trimmed;
}

async function assertAccess(workspaceId: string) {
  if (!(await canAccessWorkspace(workspaceId))) throw new Error("Workspace not found");
}

export type CreateWorkspaceResult = { workspace: { id: string } } | { limit: LimitError };

// Creates a workspace (with its empty doc and canvas) at the top of the Planning column.
export async function createWorkspace(name: string, description?: string): Promise<CreateWorkspaceResult> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");

  const { orgId } = await auth();
  const where = scopeWhere(orgId, user.id);

  const { unlimitedWorkspaces } = await getEntitlements(orgId ?? user.clerkId);
  if (!unlimitedWorkspaces && (await prisma.workspace.count({ where })) >= FREE_WORKSPACE_LIMIT) {
    return { limit: "workspaces" };
  }

  const top = await prisma.workspace.findFirst({
    where: { ...where, status: WorkspaceStatus.PLANNING },
    orderBy: { position: "asc" },
    select: { position: true },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: cleanName(name),
      description: description?.trim() || null,
      creatorId: user.id,
      clerkOrgId: orgId ?? null,
      status: WorkspaceStatus.PLANNING,
      position: (top?.position ?? 0) - 1,
      doc: { create: {} },
      canvas: { create: {} },
    },
    select: { id: true },
  });

  return { workspace };
}

export async function updateWorkspace(workspaceId: string, name: string, description?: string) {
  await assertAccess(workspaceId);

  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      name: cleanName(name),
      ...(description !== undefined && { description: description.trim() || null }),
    },
  });

  refresh();
}

// Any member can open and edit a workspace, but only its creator or an org admin can delete it.
export async function deleteWorkspace(workspaceId: string) {
  const { userId, orgId, orgRole } = await auth();
  if (!userId) throw new Error("Not signed in");
  await assertAccess(workspaceId);

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: workspaceOwnerSelect,
  });
  const isCreator = workspace.creator.clerkId === userId;
  // orgRole describes the active org only, so it counts only for a workspace in that org.
  const isOrgAdmin = orgRole === "org:admin" && workspace.clerkOrgId === orgId;
  if (!isCreator && !isOrgAdmin) throw new Error("Only the creator or an org admin can delete this workspace");

  // The doc and canvas cascade; agent prompts stay (SetNull), so deleting can't reset usage.
  await prisma.workspace.delete({ where: { id: workspaceId } });
  refresh();
}

// Called after a board drag. The client has already moved the card, so no refresh.
export async function moveWorkspace(workspaceId: string, status: WorkspaceStatus, position: number) {
  if (!Object.values(WorkspaceStatus).includes(status) || !Number.isFinite(position)) {
    throw new Error("Invalid move");
  }
  await assertAccess(workspaceId);

  await prisma.workspace.update({ where: { id: workspaceId }, data: { status, position } });
}

export type WorkspaceSearchItem = { id: string; name: string; status: WorkspaceStatus };

// Everything the command palette can jump to, most recently updated first.
export async function listWorkspacesForPalette(): Promise<WorkspaceSearchItem[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { where } = await getWorkspaceScope(user.id);
  return prisma.workspace.findMany({
    where,
    select: { id: true, name: true, status: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
}
