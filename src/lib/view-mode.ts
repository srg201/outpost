export const VIEW_MODES = ["doc", "both", "canvas"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

// `?view=doc|canvas`; anything else (or nothing) shows both side by side.
export function parseViewMode(value: string | string[] | undefined): ViewMode {
  return value === "doc" || value === "canvas" ? value : "both";
}

/** The URL of a view: `basePath` is the workspace page or its public shared page. */
export function viewHref(basePath: string, mode: ViewMode) {
  return mode === "both" ? basePath : `${basePath}?view=${mode}`;
}
