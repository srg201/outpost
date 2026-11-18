import Link from "next/link";
import { redirect } from "next/navigation";
import { compareDesc } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { format } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getWorkspaceScope } from "@/lib/workspace-scope";
import { withLastActivity, workspaceCardSelect } from "@/lib/workspace-status";

const RECENT_COUNT = 4;
const SECTION_CLASS = "mt-16 md:mt-24";

// The most recently active workspaces (doc and canvas edits count), with links to the rest.
export async function RecentWorkspaces() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/dashboard");

  const [{ dashboard: t }, { orgName, where }] = await Promise.all([getDictionary(), getWorkspaceScope(user.id)]);
  const workspaces = (await prisma.workspace.findMany({ where, select: workspaceCardSelect })).map(withLastActivity);
  const recent = workspaces.sort((a, b) => compareDesc(a.lastActivity, b.lastActivity)).slice(0, RECENT_COUNT);

  return (
    <section aria-labelledby="recent-title" className={SECTION_CLASS}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{orgName ?? t.personal}</p>
          <h2 id="recent-title" className="mt-1 font-heading text-xl font-semibold tracking-tight">
            {t.recent}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/workspaces" />}>
            {format(t.viewBoard, { count: workspaces.length })}
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" aria-hidden />
          </Button>
          <WorkspaceDialog
            trigger={
              <Button variant="outline" size="sm">
                <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" aria-hidden />
                {t.newWorkspace}
              </Button>
            }
          />
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((workspace) => (
            <li key={workspace.id}>
              <WorkspaceCard workspace={workspace} showStatus />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Same footprint as the loaded section, so nothing jumps when it streams in.
export function RecentWorkspacesSkeleton() {
  return (
    <div aria-hidden className={SECTION_CLASS}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-8 w-56" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: RECENT_COUNT }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
