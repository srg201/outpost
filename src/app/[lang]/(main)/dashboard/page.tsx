import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { compareDesc } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { checkUser } from "@/actions/check-user";
import { Button } from "@/components/ui/button";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { format } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { prisma } from "@/lib/prisma";
import { getWorkspaceScope } from "@/lib/workspace-scope";
import { withLastActivity, workspaceCardSelect } from "@/lib/workspace-status";
import { DashboardPrompt } from "./_components/dashboard-prompt";
import { RecentWorkspaces } from "./_components/recent-workspaces";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.dashboard };
}

const RECENT_COUNT = 4;

export default async function DashboardPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in?redirect_url=/dashboard");

  const { dashboard: t } = await getDictionary();
  const { orgName, where } = await getWorkspaceScope(user.id);
  const workspaces = (await prisma.workspace.findMany({ where, select: workspaceCardSelect })).map(withLastActivity);
  const recent = workspaces
    .sort((a, b) => compareDesc(a.lastActivity, b.lastActivity))
    .slice(0, RECENT_COUNT);

  return (
    <div className="relative isolate flex-1">
      <div aria-hidden className="bg-topo absolute inset-x-0 top-0 -z-10 h-96 opacity-10 mask-b-from-20% dark:opacity-15" />

      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-20">
        <DashboardPrompt />

        <section aria-labelledby="recent-title" className="mt-16 md:mt-24">
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
            <RecentWorkspaces workspaces={recent} />
          )}
        </section>
      </div>
    </div>
  );
}
