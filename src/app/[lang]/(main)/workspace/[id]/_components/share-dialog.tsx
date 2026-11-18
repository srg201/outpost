"use client";

import { useState, useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  File01Icon,
  Files02Icon,
  LockIcon,
  PenTool03Icon,
  RefreshIcon,
  Share08Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { useWorkspaceEditors } from "@/components/workspace/editors-context";
import { useUpgradeDialog } from "@/components/workspace/upgrade-dialog";
import { setWorkspaceSharing } from "@/actions/workspace";
import { useFetch } from "@/hooks/use-fetch";
import { useI18n } from "@/i18n/client";
import { format } from "@/i18n/config";
import { EmptyCanvasError, downloadBlob, exportPdf, type PdfPart } from "@/lib/pdf-export";
import type { LimitError } from "@/lib/plan-limits";

// The site origin only exists in the browser: "" on the server, the real one once hydrated.
const noopSubscribe = () => () => {};
const getOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function ShareDialog({
  workspaceId,
  workspaceName,
  initialShareToken,
  canShare,
  canExportPdf,
}: {
  workspaceId: string;
  workspaceName: string;
  initialShareToken: string | null;
  /** From the owner's plan. The server enforces both again; these only shape the UI. */
  canShare: boolean;
  canExportPdf: boolean;
}) {
  const { dict } = useI18n();
  const t = dict.share;
  const openUpgrade = useUpgradeDialog();
  const { docEditor, canvasEditor } = useWorkspaceEditors();
  const origin = useSyncExternalStore(noopSubscribe, getOrigin, getServerOrigin);

  const [open, setOpen] = useState(false);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [exporting, setExporting] = useState<PdfPart | null>(null);
  const sharing = useFetch(setWorkspaceSharing);
  const shareUrl = shareToken ? `${origin}/shared/${shareToken}` : "";

  // Close this dialog first: two modal dialogs at once fight over focus.
  const showUpgrade = (reason: LimitError) => {
    setOpen(false);
    openUpgrade(reason);
  };

  const updateSharing = async (enabled: boolean) => {
    if (enabled && !canShare) return showUpgrade("sharing");
    const response = await sharing.fn(workspaceId, enabled);
    if (!response.ok) return;
    if ("limit" in response.data) return showUpgrade(response.data.limit);
    setShareToken(response.data.shareToken);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.add({ type: "success", title: t.copied });
  };

  const exportAs = async (part: PdfPart) => {
    if (!canExportPdf) return showUpgrade("pdfExport");
    setExporting(part);
    try {
      const blob = await exportPdf({ part, title: workspaceName, docEditor, canvasEditor });
      const suffix = { doc: dict.share.exportDoc, canvas: dict.share.exportCanvas, both: "" }[part];
      downloadBlob(blob, `${workspaceName}${suffix ? ` - ${suffix}` : ""}.pdf`);
    } catch (error) {
      toast.add({ type: "error", title: error instanceof EmptyCanvasError ? t.canvasEmpty : t.exportFailed });
    } finally {
      setExporting(null);
    }
  };

  const exportButtons: { part: PdfPart; label: string; icon: typeof File01Icon; ready: boolean }[] = [
    { part: "doc", label: t.exportDoc, icon: File01Icon, ready: !!docEditor },
    { part: "canvas", label: t.exportCanvas, icon: PenTool03Icon, ready: !!canvasEditor },
    { part: "both", label: t.exportBoth, icon: Files02Icon, ready: !!docEditor && !!canvasEditor },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <HugeiconsIcon icon={Share08Icon} aria-hidden />
        <span className="max-md:sr-only">{t.button}</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{format(t.title, { name: workspaceName })}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <Label htmlFor="share-public" className="flex flex-col items-start gap-1">
              <span className="flex items-center gap-1.5">
                {t.publicLink}
                {!canShare && <HugeiconsIcon icon={LockIcon} aria-label={t.locked} className="size-3.5 text-muted-foreground" />}
              </span>
              <span className="text-xs font-normal text-muted-foreground">{t.publicLinkHint}</span>
            </Label>
            <Switch
              id="share-public"
              checked={shareToken !== null}
              onCheckedChange={updateSharing}
              disabled={sharing.loading}
            />
          </div>

          {shareToken && (
            <div className="flex items-center gap-2">
              <Input readOnly value={shareUrl} aria-label={t.linkLabel} className="text-xs" onFocus={(e) => e.target.select()} />
              <Button variant="outline" size="icon" onClick={copyLink} aria-label={t.copy} title={t.copy}>
                <HugeiconsIcon icon={Copy01Icon} aria-hidden />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateSharing(true)}
                disabled={sharing.loading}
                aria-label={t.reset}
                title={t.resetHint}
              >
                <HugeiconsIcon icon={RefreshIcon} aria-hidden />
              </Button>
            </div>
          )}
        </section>

        <Separator />

        <section className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-sm font-medium">
            {t.exportTitle}
            {!canExportPdf && <HugeiconsIcon icon={LockIcon} aria-label={t.locked} className="size-3.5 text-muted-foreground" />}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {exportButtons.map(({ part, label, icon, ready }) => (
              <Button
                key={part}
                variant="outline"
                className="h-auto flex-col gap-1.5 py-3 text-xs"
                onClick={() => exportAs(part)}
                disabled={canExportPdf && (!ready || exporting !== null)}
              >
                <HugeiconsIcon icon={icon} aria-hidden />
                {exporting === part ? t.exporting : label}
              </Button>
            ))}
          </div>
          {canExportPdf && (!docEditor || !canvasEditor) && <p className="text-xs text-muted-foreground">{t.openInView}</p>}
        </section>
      </DialogContent>
    </Dialog>
  );
}
