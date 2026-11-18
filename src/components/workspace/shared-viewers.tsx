"use client";

import dynamic from "next/dynamic";

// BlockNote and tldraw need `window` while they're created, so they render only in the browser.
// `ssr: false` only works inside a client module, hence these wrappers for Server Components.
export const DocViewer = dynamic(() => import("@/components/doc/doc-viewer").then((m) => m.DocViewer), { ssr: false });
export const CanvasViewer = dynamic(() => import("@/components/canvas/canvas-viewer").then((m) => m.CanvasViewer), {
  ssr: false,
});
