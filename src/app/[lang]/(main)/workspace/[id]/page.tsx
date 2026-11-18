import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { Block } from "@blocknote/core";
import type { TLEditorSnapshot } from "tldraw";
import { PenTool03Icon } from "@hugeicons/core-free-icons";

import { AgentButton } from "@/components/agent/agent-button";
import { AgentPanel } from "@/components/agent/agent-panel";
import { AgentProvider } from "@/components/agent/agent-provider";
import { CanvasEditor } from "@/components/canvas/canvas-editor-loader";
import { CommandPalette } from "@/components/command-palette";
import { DocEditor } from "@/components/doc/doc-editor-loader";
import { WorkspaceEditorsProvider } from "@/components/workspace/editors-context";
import { ModeToggle } from "@/components/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import PlanButton from "@/components/web/plan-button";
import { isCanvasSyncConfigured } from "@/lib/canvas-ticket";
import { getDictionary } from "@/i18n/get-dictionary";
import { EditableWorkspaceName } from "./_components/editable-workspace-name";
import { PendingSurface } from "./_components/pending-surface";
import { ViewSwitcher } from "./_components/view-switcher";
import { WorkspacePanels } from "./_components/workspace-panels";
import { getWorkspace } from "./_lib/get-workspace";
import { parseViewMode, viewHref } from "./_lib/view-mode";

export async function generateMetadata({ params }: PageProps<"/[lang]/workspace/[id]">): Promise<Metadata> {
  // Reads the session, so the title streams in with the page (the page is dynamic anyway).
  const workspace = await getWorkspace((await params).id);
  return { title: workspace?.name, robots: { index: false } };
}

type Props = PageProps<"/[lang]/workspace/[id]">;

// Everything here depends on the request (the id, ?view= and the session), so the page is a
// skeleton shell and the workspace streams in behind Suspense.
export default function WorkspacePage(props: Props) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <Workspace {...props} />
    </Suspense>
  );
}

async function Workspace({ params, searchParams }: Props) {
  const [{ id }, { view: viewParam, prompt }, dict] = await Promise.all([params, searchParams, getDictionary()]);
  const workspace = await getWorkspace(id);
  if (!workspace) notFound();

  const t = dict.workspacePage;
  const view = parseViewMode(viewParam);
  const { doc, canvas } = workspace;
  const canvasReady = isCanvasSyncConfigured();

  return (
    // Lets header tools (agent, share) reach the live editors inside the panels.
    <WorkspaceEditorsProvider>
    <AgentProvider
      workspaceId={id}
      initialPrompt={typeof prompt === "string" ? prompt : undefined}
      needs={{ doc: view !== "canvas", canvas: view !== "doc" && canvasReady }}
      cleanUrl={viewHref(id, view)}
    >
    <div className="flex h-dvh flex-col overflow-hidden">
      {/* Name on the left, view switcher in the middle, account and tools on the right.
          On phones the switcher drops to a second row so the name keeps its room. */}
      <header className="grid shrink-0 grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 border-b px-3 py-2 sm:h-14 sm:grid-cols-[1fr_auto_1fr] sm:py-0">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href="/dashboard"
            aria-label={t.back}
            title={t.back}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Image src="/brand/mascot.png" alt="" width={24} height={24} className="size-6 dark:hidden" />
            <Image src="/brand/mascot-dark.png" alt="" width={24} height={24} className="hidden size-6 dark:block" />
          </Link>
          <EditableWorkspaceName workspaceId={id} initialName={workspace.name} />
        </div>

        <div className="col-span-full row-start-2 justify-self-center sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <ViewSwitcher workspaceId={id} view={view} t={t} />
        </div>

        <div className="flex items-center justify-end gap-2 sm:col-start-3">
          <AgentButton />
          <div className="hidden lg:block">
            <CommandPalette />
          </div>
          <ModeToggle />
          <div className="hidden sm:block">
            <PlanButton />
          </div>
          <UserButton />
        </div>
      </header>

      <main id="main-content" className="relative min-h-0 flex-1">
        <WorkspacePanels
          view={view}
          resizeLabel={t.resize}
          doc={
            <DocEditor
              key={id}
              workspaceId={id}
              initialContent={doc?.content as Block[] | null}
              initialState={doc?.yjsState ? Buffer.from(doc.yjsState).toString("base64") : null}
            />
          }
          canvas={
            canvasReady ? (
              <CanvasEditor
                key={id}
                workspaceId={id}
                initialSnapshot={canvas?.content as TLEditorSnapshot | null}
              />
            ) : (
              <PendingSurface icon={PenTool03Icon} title={t.canvasPanel} text={t.canvasUnavailable} />
            )
          }
        />
        <AgentPanel />
      </main>
    </div>
    </AgentProvider>
    </WorkspaceEditorsProvider>
  );
}

function WorkspaceSkeleton() {
  return (
    <div aria-hidden className="flex h-dvh flex-col">
      <div className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b px-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="size-8 justify-self-end rounded-full" />
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
