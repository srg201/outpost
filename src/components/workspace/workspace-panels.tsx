"use client";

import type { ReactNode } from "react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ViewMode } from "@/lib/view-mode";

// Doc and canvas side by side, or stacked on narrow screens where side by side is too tight.
export function WorkspacePanels({
  view,
  doc,
  canvas,
  resizeLabel,
}: {
  view: ViewMode;
  doc: ReactNode;
  canvas: ReactNode;
  resizeLabel: string;
}) {
  const orientation = useIsMobile() ? "vertical" : "horizontal";
  const showDoc = view !== "canvas";
  const showCanvas = view !== "doc";
  const both = showDoc && showCanvas;

  return (
    // key: each view and orientation gets a fresh group, so an old layout isn't applied to new panels.
    <ResizablePanelGroup key={`${view}-${orientation}`} orientation={orientation}>
      {showDoc && (
        <ResizablePanel id="doc" defaultSize={both ? "40%" : "100%"} minSize="20%">
          {doc}
        </ResizablePanel>
      )}
      {both && <ResizableHandle withHandle aria-label={resizeLabel} />}
      {showCanvas && (
        <ResizablePanel id="canvas" defaultSize={both ? "60%" : "100%"} minSize="20%">
          {canvas}
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
