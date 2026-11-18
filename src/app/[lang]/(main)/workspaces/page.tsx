import type { Metadata } from "next";
import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { getDictionary } from "@/i18n/get-dictionary";
import { BoardContent, BoardSkeleton, ScopeName } from "./_components/board-content";

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getDictionary();
  return { title: meta.board };
}

// The heading and the New workspace button are static; the team name and the board stream in.
export default async function WorkspacesPage() {
  const { board: t, dashboard } = await getDictionary();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-10 md:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Suspense fallback={<Skeleton className="h-4 w-20" />}>
            <ScopeName />
          </Suspense>
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

      <Suspense fallback={<BoardSkeleton />}>
        <BoardContent />
      </Suspense>
    </div>
  );
}
