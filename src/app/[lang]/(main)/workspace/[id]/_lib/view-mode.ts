export const VIEW_MODES = ["doc", "both", "canvas"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

// `?view=doc|canvas`; anything else (or nothing) shows both side by side.
export function parseViewMode(value: string | string[] | undefined): ViewMode {
  return value === "doc" || value === "canvas" ? value : "both";
}

export function viewHref(workspaceId: string, mode: ViewMode) {
  return mode === "both" ? `/workspace/${workspaceId}` : `/workspace/${workspaceId}?view=${mode}`;
}
