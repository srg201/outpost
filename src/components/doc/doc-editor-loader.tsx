"use client";

import dynamic from "next/dynamic";

// BlockNote touches `window` while it's created, so it can't render on the server. `ssr: false`
// only works inside a client module, hence this thin wrapper for Server Components to import.
export const DocEditor = dynamic(() => import("./doc-editor").then((m) => m.DocEditor), { ssr: false });
