"use client";

import dynamic from "next/dynamic";

// tldraw needs `window` while it's created, so it renders only in the browser. `ssr: false`
// only works inside a client module, hence this thin wrapper for Server Components to import.
export const CanvasEditor = dynamic(() => import("./canvas-editor").then((m) => m.CanvasEditor), { ssr: false });
