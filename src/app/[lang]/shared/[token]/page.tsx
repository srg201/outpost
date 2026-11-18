import "server-only";

import type { Metadata } from "next";
import { Suspense, cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Block } from "@blocknote/core";
import type { TLEditorSnapshot } from "tldraw";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CanvasViewer, DocViewer } from "@/components/workspace/shared-viewers";
import { ViewSwitcher } from "@/components/workspace/view-switcher";
import { WorkspacePanels } from "@/components/workspace/workspace-panels";
import { getDictionary } from "@/i18n/get-dictionary";
import { getEntitlements, workspaceOwnerId, workspaceOwnerSelect } from "@/lib/billing";
import { prisma } from "@/lib/prisma";
import { parseViewMode } from "@/lib/view-mode";

type Props = PageProps<"/[lang]/shared/[token]">;

/**
 * The workspace behind a public link, or null. A link works only while sharing is on (the token
 * exists) and the owner's plan still includes it, so cancelling a plan turns old links off.
 * Wrapped in `cache` so generateMetadata and the page share one lookup.
 */
const getSharedWorkspace = cache(async (token: string) => {
  const workspace = await prisma.workspace.findUnique({
    where: { shareToken: token },
    select: {
      name: true,
      ...workspaceOwnerSelect,
      doc: { select: { content: true } },
      canvas: { select: { content: true } },
    },
  });
  if (!workspace) return null;
  const { publicSharing } = await getEntitlements(workspaceOwnerId(workspace));
  return publicSharing ? workspace : null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const workspace = await getSharedWorkspace((await params).token);
  // Links are private by obscurity, so they stay out of search engines.
  return { title: workspace?.name, robots: { index: false, follow: false } };
}

// Public, no sign-in: a read-only copy of the doc and canvas from their last save. It never
// joins the live doc or canvas, so viewers can't see or reach the people editing.
export default function SharedWorkspacePage(props: Props) {
  return (
    <Suspense fallback={<SharedSkeleton />}>
      <SharedWorkspace {...props} />
    </Suspense>
  );
}

async function SharedWorkspace({ params, searchParams }: Props) {
  const [{ token }, { view: viewParam }, dict] = await Promise.all([params, searchParams, getDictionary()]);
  const workspace = await getSharedWorkspace(token);
  if (!workspace) notFound();

  const t = dict.shared;
  const view = parseViewMode(viewParam);
  const basePath = `/shared/${token}`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="grid shrink-0 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 border-b px-3 py-2 sm:h-14 sm:grid-cols-[1fr_auto_1fr] sm:py-0">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/"
            aria-label="Outpost"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Image src="/brand/mascot.png" alt="" width={24} height={24} className="size-6 dark:hidden" />
            <Image src="/brand/mascot-dark.png" alt="" width={24} height={24} className="hidden size-6 dark:block" />
          </Link>
          <h1 className="truncate text-sm font-medium">{workspace.name}</h1>
          <Badge variant="outline" title={t.snapshotHint} className="shrink-0 font-normal text-muted-foreground">
            {t.viewOnly}
          </Badge>
        </div>

        <div className="col-span-full row-start-2 justify-self-center sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <ViewSwitcher basePath={basePath} view={view} t={dict.workspacePage} />
        </div>

        <div className="flex items-center justify-end gap-2 sm:col-start-3">
          <LocaleSwitcher />
          <ModeToggle />
          <Button size="sm" nativeButton={false} render={<Link href="/" />} className="max-sm:hidden">
            {t.cta}
          </Button>
        </div>
      </header>

      <main id="main-content" className="min-h-0 flex-1">
        <WorkspacePanels
          view={view}
          resizeLabel={dict.workspacePage.resize}
          doc={<DocViewer content={workspace.doc?.content as Block[] | null} />}
          canvas={<CanvasViewer snapshot={workspace.canvas?.content as TLEditorSnapshot | null} />}
        />
      </main>
    </div>
  );
}

function SharedSkeleton() {
  return (
    <div aria-hidden className="flex h-dvh flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-3">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid flex-1 grid-cols-[2fr_3fr] divide-x">
        <div className="space-y-3 p-8">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="bg-muted/10" />
      </div>
    </div>
  );
}
