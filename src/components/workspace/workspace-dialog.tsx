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
import { createWorkspace } from "@/actions/workspace";
import { useFetch } from "@/hooks/use-fetch";
import { useI18n } from "@/i18n/client";
import { useUpgradeDialog } from "./upgrade-dialog";

// Creates a workspace from a name and an optional description, then opens it.
export function WorkspaceDialog({ trigger }: { trigger: ReactElement }) {
  const router = useRouter();
  const t = useI18n().dict.workspace.dialog;
  const { common } = useI18n().dict;
  const openUpgrade = useUpgradeDialog();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { loading, fn: create } = useFetch(createWorkspace);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await create(name, description);
    if (!result) return;
    if ("limit" in result) {
      setOpen(false);
      openUpgrade(result.limit);
      return;
    }
    router.push(`/workspace/${result.workspace.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogDescription>{t.description}</DialogDescription>
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
            <DialogClose render={<Button type="button" variant="outline" />}>{common.cancel}</DialogClose>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? t.creating : t.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
