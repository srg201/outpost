import { redirect } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getWorkspaceScope } from "@/lib/workspace-scope";
import { WORKSPACE_STATUSES, withLastActivity, workspaceCardSelect } from "@/lib/workspace-status";
import { WorkspaceBoard } from "./workspace-board";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/workspaces");
  return user;
}

// "Personal", or the active team's name.
export async function ScopeName() {
  const user = await requireUser();
  const [{ dashboard }, { orgName }] = await Promise.all([getDictionary(), getWorkspaceScope(user.id)]);
  return <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{orgName ?? dashboard.personal}</p>;
}

export async function BoardContent() {
  const user = await requireUser();
  const [{ board: t }, { where }] = await Promise.all([getDictionary(), getWorkspaceScope(user.id)]);
  const workspaces = await prisma.workspace.findMany({
    where,
    select: { ...workspaceCardSelect, position: true },
    orderBy: { position: "asc" },
  });

  if (workspaces.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">{t.empty}</p>
    );
  }
  return <WorkspaceBoard workspaces={workspaces.map(withLastActivity)} />;
}

export function BoardSkeleton() {
  return (
    <div aria-hidden className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {WORKSPACE_STATUSES.map((status, i) => (
        <div key={status} className="flex flex-col gap-2 rounded-2xl border bg-muted/20 p-2">
          <Skeleton className="m-2 h-3 w-24" />
          {Array.from({ length: 2 - (i % 2) }, (_, j) => (
            <Skeleton key={j} className="h-36 rounded-2xl" />
          ))}
        </div>
      ))}
    </div>
  );
}
