import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { checkUser } from "@/actions/check-user";
import { Button } from "@/components/ui/button";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { getDictionary } from "@/i18n/get-dictionary";
import { prisma } from "@/lib/prisma";
import { getWorkspaceScope } from "@/lib/workspace-scope";
import { withLastActivity, workspaceCardSelect } from "@/lib/workspace-status";
import { WorkspaceBoard } from "./_components/workspace-board";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.board };
}

export default async function WorkspacesPage() {
  const user = await checkUser();
  if (!user) redirect("/sign-in?redirect_url=/workspaces");

  const [{ board: t, dashboard }, { orgName, where }] = await Promise.all([
    getDictionary(),
    getWorkspaceScope(user.id),
  ]);
  const workspaces = await prisma.workspace.findMany({
    where,
    select: { ...workspaceCardSelect, position: true },
    orderBy: { position: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 md:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {orgName ?? dashboard.personal}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight md:text-3xl">{t.title}</h1>
        </div>
        <WorkspaceDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" aria-hidden />
              {dashboard.newWorkspace}
            </Button>
          }
        />
      </header>

      {workspaces.length === 0 ? (
        <p className="rounded-2xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          {t.empty}
        </p>
      ) : (
        <WorkspaceBoard workspaces={workspaces.map(withLastActivity)} />
      )}
    </div>
  );
}
