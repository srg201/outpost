"use client";

import { useState, type MouseEvent } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, MoreHorizontalIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { deleteWorkspace, moveWorkspace } from "@/actions/workspace";
import type { WorkspaceStatus } from "@/generated/prisma/enums";
import { useFetch } from "@/hooks/use-fetch";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { WORKSPACE_STATUSES, type WorkspaceCardData } from "@/lib/workspace-status";

export type BoardWorkspace = WorkspaceCardData & { position: number };

function columnItems(workspaces: BoardWorkspace[], status: WorkspaceStatus) {
  return workspaces.filter((w) => w.status === status).sort((a, b) => a.position - b.position);
}

// The midpoint between the new neighbors, so only the dropped card needs saving.
function positionBetween(before?: BoardWorkspace, after?: BoardWorkspace) {
  if (before && after) return (before.position + after.position) / 2;
  if (before) return before.position + 1;
  if (after) return after.position - 1;
  return 0;
}

export function WorkspaceBoard({ workspaces }: { workspaces: BoardWorkspace[] }) {
  const { dict } = useI18n();
  const t = dict.board;

  const [items, setItems] = useState(workspaces);
  // Take the server's list again when it changes (after an edit or delete refreshes the page).
  const [serverItems, setServerItems] = useState(workspaces);
  if (workspaces !== serverItems) {
    setServerItems(workspaces);
    setItems(workspaces);
  }

  // `selected` outlives the open flag, so dialog text doesn't blank out during the close animation.
  const [selected, setSelected] = useState<BoardWorkspace | null>(null);
  const [openDialog, setOpenDialog] = useState<"edit" | "delete" | null>(null);
  const remove = useFetch(deleteWorkspace);

  const openFor = (workspace: BoardWorkspace, dialog: "edit" | "delete") => {
    setSelected(workspace);
    setOpenDialog(dialog);
  };

  const handleDelete = async (event: MouseEvent) => {
    event.preventDefault();
    if (!selected) return;
    if ((await remove.fn(selected.id)).ok) setOpenDialog(null);
  };

  // Optimistic: the card moves at once and moves back if saving fails.
  const handleDragEnd = async ({ draggableId, source, destination }: DropResult) => {
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const status = destination.droppableId as WorkspaceStatus;
    const target = columnItems(items, status).filter((w) => w.id !== draggableId);
    const position = positionBetween(target[destination.index - 1], target[destination.index]);

    const previous = items;
    setItems(items.map((w) => (w.id === draggableId ? { ...w, status, position } : w)));

    try {
      await moveWorkspace(draggableId, status, position);
    } catch {
      setItems(previous);
      toast.add({ type: "error", title: t.moveFailed });
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {WORKSPACE_STATUSES.map((status) => {
          const column = columnItems(items, status);
          const titleId = `column-${status}`;
          return (
            <section key={status} aria-labelledby={titleId} className="flex flex-col rounded-2xl border bg-muted/20">
              <h2
                id={titleId}
                className="flex items-center gap-2 px-4 pt-3 pb-1 font-mono text-xs tracking-widest text-muted-foreground uppercase"
              >
                <span aria-hidden className="size-1.5 rotate-45 bg-amber-500" />
                {dict.workspace.statuses[status]}
                <span className="ml-auto tabular-nums">{column.length}</span>
              </h2>
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex min-h-40 flex-1 flex-col gap-2 rounded-b-2xl p-2 transition-colors",
                      snapshot.isDraggingOver && "bg-primary/5",
                    )}
                  >
                    {column.map((workspace, index) => (
                      <Draggable key={workspace.id} draggableId={workspace.id} index={index}>
                        {(provided, snapshot) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <WorkspaceCard
                              workspace={workspace}
                              highlighted={snapshot.isDragging}
                              actions={
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    render={
                                      <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={format(t.options, { name: workspace.name })}
                                        className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100 pointer-coarse:opacity-100"
                                      >
                                        <HugeiconsIcon icon={MoreHorizontalIcon} aria-hidden />
                                      </Button>
                                    }
                                  />
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openFor(workspace, "edit")}>
                                      <HugeiconsIcon icon={PencilEdit02Icon} aria-hidden />
                                      {t.edit}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem variant="destructive" onClick={() => openFor(workspace, "delete")}>
                                      <HugeiconsIcon icon={Delete02Icon} aria-hidden />
                                      {t.delete}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </section>
          );
        })}
      </div>

      {selected && (
        <WorkspaceDialog
          workspace={selected}
          open={openDialog === "edit"}
          onOpenChange={(open) => !open && setOpenDialog(null)}
        />
      )}

      <AlertDialog open={openDialog === "delete"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{format(t.deleteTitle, { name: selected?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={remove.loading}>
              {remove.loading ? t.deleting : t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DragDropContext>
  );
}
