"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Tldraw,
  UserRecordType,
  atom,
  createUserId,
  defaultBindingUtils,
  inlineBase64AssetStore,
  type Editor,
  type TLEditorSnapshot,
} from "tldraw";
import { useSync } from "@tldraw/sync";
import "tldraw/tldraw.css";

import { useWorkspaceEditors } from "@/components/workspace/editors-context";
import { getCanvasTicket, saveCanvasContent } from "@/actions/canvas";
import type { Prisma } from "@/generated/prisma/client";
import { colorForUser } from "@/lib/utils";
import { allShapeUtils, canvasComponents, canvasFrameClass, customShapeUtils } from "./canvas-config";
import { snapArrowToRow } from "./entity-table/snap-arrow-to-row";
import { useCanvasUser } from "./use-canvas-user";

const SAVE_DEBOUNCE_MS = 1000;
const SYNC_URL = process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL;

export type CanvasEditorProps = {
  workspaceId: string;
  /** The last snapshot saved to Postgres, loaded only into a room that starts empty. */
  initialSnapshot: TLEditorSnapshot | null;
};

type Identity = { id: string; name: string; imageUrl: string };

export function CanvasEditor(props: CanvasEditorProps) {
  const { user } = useUser();
  if (!user) return null;
  return (
    <SyncedCanvas
      {...props}
      identity={{ id: user.id, name: user.fullName ?? user.username ?? "Anonymous", imageUrl: user.imageUrl }}
    />
  );
}

function SyncedCanvas({ workspaceId, initialSnapshot, identity }: CanvasEditorProps & { identity: Identity }) {
  const { setCanvasEditor } = useWorkspaceEditors();

  const { id: userId, name, imageUrl } = identity;
  const color = colorForUser(userId);

  // What other people see on this user's cursor. Memoized on primitives: a new object reconnects.
  const users = useMemo(
    () => ({ currentUser: atom("currentUser", UserRecordType.create({ id: createUserId(userId), name, color, imageUrl })) }),
    [userId, name, color, imageUrl],
  );

  const currentUser = useCanvasUser({ id: userId, name, color });

  // Called on every connection attempt, so each reconnect gets a fresh ticket. Must keep its
  // identity: useSync tears down the store and reconnects whenever `uri` changes.
  const uri = useCallback(
    async () => `${SYNC_URL}/connect/${workspaceId}?ticket=${encodeURIComponent(await getCanvasTicket(workspaceId))}`,
    [workspaceId],
  );
  const store = useSync({
    uri,
    assets: inlineBase64AssetStore,
    shapeUtils: allShapeUtils,
    bindingUtils: defaultBindingUtils,
    users,
  });

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(saveTimeout.current), []);

  const handleMount = (editor: Editor) => {
    setCanvasEditor(editor);

    // An empty room (new, or wiped) is seeded from Postgres. A room someone has already drawn in
    // is left alone, so joining never overwrites their work.
    if (initialSnapshot && editor.getCurrentPageShapeIds().size === 0) editor.loadSnapshot(initialSnapshot);

    // Save our own document changes to Postgres; whoever makes a remote change saves it.
    const stopSaving = editor.store.listen(
      () => {
        clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
          // JSON round trip: the snapshot holds class instances that can't cross the Server
          // Action boundary as they are.
          const snapshot = JSON.parse(JSON.stringify(editor.getSnapshot())) as Prisma.InputJsonValue;
          saveCanvasContent(workspaceId, snapshot).catch((error) => console.error("[canvas] save failed", error));
        }, SAVE_DEBOUNCE_MS);
      },
      { source: "user", scope: "document" },
    );

    // Arrows drawn onto a table snap to the nearest row.
    const stopSnapping = editor.store.listen(
      ({ changes }) => {
        for (const record of Object.values(changes.added)) {
          if (record.typeName === "binding" && record.type === "arrow") snapArrowToRow(editor, record);
        }
      },
      { source: "user", scope: "document" },
    );

    return () => {
      stopSaving();
      stopSnapping();
      // Unmounted (e.g. switched to the Document view): nothing should keep a disposed editor.
      setCanvasEditor(null);
    };
  };

  return (
    <div className={canvasFrameClass}>
      <Tldraw
        store={store}
        user={currentUser}
        shapeUtils={customShapeUtils}
        components={canvasComponents}
        onMount={handleMount}
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
      />
    </div>
  );
}
