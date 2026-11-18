"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { checkUser } from "@/actions/check-user";
import { getEntitlements } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { FREE_WORKSPACE_LIMIT, type LimitError } from "@/lib/plan-limits";
import { scopeWhere } from "@/lib/workspace-scope";

export type CreateWorkspaceResult = { workspace: { id: string } } | { limit: LimitError };

// Creates a workspace (with its empty doc and canvas) at the top of the Planning column.
export async function createWorkspace(name: string, description?: string): Promise<CreateWorkspaceResult> {
  const user = await checkUser();
  if (!user) throw new Error("Not signed in");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Give the workspace a name");

  const { orgId } = await auth();
  const where = scopeWhere(orgId, user.id);

  const { unlimitedWorkspaces } = await getEntitlements(orgId ?? user.clerkId);
  if (!unlimitedWorkspaces && (await prisma.workspace.count({ where })) >= FREE_WORKSPACE_LIMIT) {
    return { limit: "workspaces" };
  }

  const top = await prisma.workspace.findFirst({
    where: { ...where, status: "PLANNING" },
    orderBy: { position: "asc" },
    select: { position: true },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: trimmed,
      description: description?.trim() || null,
      creatorId: user.id,
      clerkOrgId: orgId ?? null,
      status: "PLANNING",
      position: (top?.position ?? 0) - 1,
      doc: { create: {} },
      canvas: { create: {} },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/workspaces");
  return { workspace };
}
