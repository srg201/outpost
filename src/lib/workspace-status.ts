import { max } from "date-fns";

import type { Prisma, WorkspaceStatus } from "@/generated/prisma/client";

// Board columns, in order. Their names live in the dictionaries (workspace.statuses).
export const WORKSPACE_STATUSES: WorkspaceStatus[] = ["PLANNING", "IN_PROGRESS", "IN_REVIEW", "DONE"];

// What a workspace card needs, shared by the dashboard and the board.
export const workspaceCardSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  updatedAt: true,
  creator: { select: { name: true, imageUrl: true } },
  doc: { select: { updatedAt: true } },
  canvas: { select: { updatedAt: true } },
} satisfies Prisma.WorkspaceSelect;

type WorkspaceCardRow = Prisma.WorkspaceGetPayload<{ select: typeof workspaceCardSelect }>;

// Editing the doc or canvas counts as activity, not only renaming the workspace.
// Generic, so extra selected fields (like the board's `position`) pass through.
export function withLastActivity<T extends WorkspaceCardRow>({ doc, canvas, ...workspace }: T) {
  const dates = [workspace.updatedAt, doc?.updatedAt, canvas?.updatedAt].filter((d): d is Date => !!d);
  return { ...workspace, lastActivity: max(dates) };
}

export type WorkspaceCardData = ReturnType<typeof withLastActivity<WorkspaceCardRow>>;
