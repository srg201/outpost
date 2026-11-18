"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import * as Y from "yjs";
import type { Block } from "@blocknote/core";
import * as locales from "@blocknote/core/locales";
import { CollaborationExtension } from "@blocknote/core/yjs";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "./doc-editor.css";

import { Skeleton } from "@/components/ui/skeleton";
import { useWorkspaceEditors } from "@/components/workspace/editors-context";
import { saveDocContent } from "@/actions/doc";
import type { Prisma } from "@/generated/prisma/client";
import { useCollaborativeDoc } from "@/hooks/use-collaborative-doc";
import { useI18n } from "@/i18n/client";
import { toBase64 } from "@/lib/base64";
import type { SupabaseYjsProvider } from "@/lib/realtime/yjs-provider";
import { colorForUser } from "@/lib/utils";

const SAVE_DEBOUNCE_MS = 1000;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export type DocEditorProps = {
  workspaceId: string;
  /** Blocks saved before the doc had a Yjs state; imported once into the shared doc. */
  initialContent: Block[] | null;
  /** Saved Yjs state, base64. */
  initialState: string | null;
};

export function DocEditor({ workspaceId, initialContent, initialState }: DocEditorProps) {
  const { user } = useUser();
  const collab = useCollaborativeDoc(workspaceId, initialState);
  const t = useI18n().dict.workspacePage;

  if (!collab || !user) {
    return (
      <div role="status" aria-label={t.docLoading} className="mx-auto max-w-3xl space-y-3 px-12 pt-10">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    );
  }

  return (
    <CollaborativeEditor
      workspaceId={workspaceId}
      initialContent={initialContent}
      doc={collab.doc}
      provider={collab.provider}
      user={{ name: user.fullName ?? user.username ?? "Anonymous", color: colorForUser(user.id) }}
    />
  );
}

// Split out so the editor is created only once the shared doc is ready: BlockNote binds to the
// Yjs fragment when it's created.
function CollaborativeEditor({
  workspaceId,
  initialContent,
  doc,
  provider,
  user,
}: Omit<DocEditorProps, "initialState"> & {
  doc: Y.Doc;
  provider: SupabaseYjsProvider;
  user: { name: string; color: string };
}) {
  const { locale, dict } = useI18n();
  const t = dict.workspacePage;
  const { resolvedTheme } = useTheme();
  const [status, setStatus] = useState<SaveStatus>("idle");

  const fragment = doc.getXmlFragment("document-store");
  const editor = useCreateBlockNote({
    dictionary: locales[locale],
    extensions: [CollaborationExtension({ fragment, user, provider })],
  });

  // Publish the live editor for the agent and the share dialog.
  const { setDocEditor } = useWorkspaceEditors();
  useEffect(() => {
    setDocEditor(editor);
    return () => setDocEditor(null);
  }, [editor, setDocEditor]);

  // A doc saved before collaboration existed only has JSON: import it once into the shared doc.
  useEffect(() => {
    if (fragment.length === 0 && initialContent?.length) editor.replaceBlocks(editor.document, initialContent);
  }, [editor, fragment, initialContent]);

  // Save our own edits only (whoever made a remote edit saves it). The server merges states.
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const save = () => {
      clearTimeout(timeout);
      timeout = undefined;
      setStatus("saving");
      const content = JSON.parse(JSON.stringify(editor.document)) as Prisma.InputJsonValue;
      saveDocContent(workspaceId, toBase64(Y.encodeStateAsUpdate(doc)), content).then(
        () => setStatus("saved"),
        () => setStatus("error"),
      );
    };

    const onUpdate = (_update: Uint8Array, origin: unknown) => {
      if (origin === provider) return;
      clearTimeout(timeout);
      timeout = setTimeout(save, SAVE_DEBOUNCE_MS);
    };
    // Save right away when the tab is hidden; a closing tab may never fire the debounce.
    const onHide = () => {
      if (document.visibilityState === "hidden" && timeout) save();
    };

    doc.on("update", onUpdate);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      doc.off("update", onUpdate);
      document.removeEventListener("visibilitychange", onHide);
      // Leaving the page: flush a pending save instead of dropping the last edits.
      if (timeout) save();
    };
  }, [doc, editor, provider, workspaceId]);

  const statusText = { idle: "", saving: t.saving, saved: t.saved, error: t.saveFailed }[status];

  return (
    <div className="outpost-doc relative h-full overflow-y-auto pt-8 pb-24">
      <p
        role="status"
        className={
          status === "error"
            ? "absolute top-2 right-4 text-xs text-destructive"
            : "absolute top-2 right-4 text-xs text-muted-foreground"
        }
      >
        {statusText}
      </p>
      <BlockNoteView editor={editor} theme={resolvedTheme === "light" ? "light" : "dark"} />
    </div>
  );
}
