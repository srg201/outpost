"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspace, updateWorkspace } from "@/actions/workspace";
import { useFetch } from "@/hooks/use-fetch";
import { useI18n } from "@/i18n/client";
import { useUpgradeDialog } from "./upgrade-dialog";

type EditableWorkspace = { id: string; name: string; description: string | null };

type WorkspaceDialogProps = {
  /** Edit this workspace; without it the dialog creates a new one and opens it. */
  workspace?: EditableWorkspace;
  /** Opens the dialog on click. Leave out and pass `open` to control it from outside. */
  trigger?: ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function WorkspaceDialog({ workspace, trigger, open: openProp, onOpenChange }: WorkspaceDialogProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent>
        {/* Mounted only while open, so the fields start from the workspace's current values each time. */}
        {open && <WorkspaceForm workspace={workspace} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceForm({ workspace, onDone }: { workspace?: EditableWorkspace; onDone: () => void }) {
  const router = useRouter();
  const openUpgrade = useUpgradeDialog();
  const { dict } = useI18n();
  const t = dict.workspace.dialog;
  const isEdit = !!workspace;

  const [name, setName] = useState(workspace?.name ?? "");
  const [description, setDescription] = useState(workspace?.description ?? "");
  const create = useFetch(createWorkspace);
  const update = useFetch(updateWorkspace);
  const loading = create.loading || update.loading;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (workspace) {
      if ((await update.fn(workspace.id, name, description)).ok) onDone();
      return;
    }

    const response = await create.fn(name, description);
    if (!response.ok) return;
    const result = response.data;
    if ("limit" in result) {
      onDone();
      openUpgrade(result.limit);
      return;
    }
    router.push(`/workspace/${result.workspace.id}`);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <DialogHeader>
        <DialogTitle>{isEdit ? t.editTitle : t.title}</DialogTitle>
        <DialogDescription>{isEdit ? t.editDescription : t.description}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="workspace-name">{t.name}</Label>
          <Input
            id="workspace-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            maxLength={80}
            required
            autoFocus
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="workspace-description">
            {t.descriptionLabel} <span className="text-muted-foreground">{t.optional}</span>
          </Label>
          <Textarea
            id="workspace-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>{dict.common.cancel}</DialogClose>
        <Button type="submit" disabled={loading || !name.trim()}>
          {isEdit ? (loading ? t.saving : t.save) : loading ? t.creating : t.create}
        </Button>
      </DialogFooter>
    </form>
  );
}
