"use client";

import { Tldraw, type Editor, type TLComponents, type TLEditorSnapshot } from "tldraw";
import "tldraw/tldraw.css";

import { canvasFrameClass, customShapeUtils } from "./canvas-config";
import { useCanvasUser } from "./use-canvas-user";

// Looking around only: no editing tools or menus.
const viewerComponents: TLComponents = { PageMenu: null, MainMenu: null, StylePanel: null, Toolbar: null };

const VIEWER = { id: "viewer", name: "Viewer", color: "#888888" };

/** A read-only canvas from the last saved snapshot, for the public shared page. It never joins
 *  the live sync room, so viewers can't see or reach the collaborators. */
export function CanvasViewer({ snapshot }: { snapshot: TLEditorSnapshot | null }) {
  const user = useCanvasUser(VIEWER);

  const handleMount = (editor: Editor) => {
    editor.updateInstanceState({ isReadonly: true });
    editor.zoomToFit();
  };

  return (
    <div className={canvasFrameClass}>
      <Tldraw
        snapshot={snapshot ?? undefined}
        user={user}
        shapeUtils={customShapeUtils}
        components={viewerComponents}
        onMount={handleMount}
        licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
      />
    </div>
  );
}
