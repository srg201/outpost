import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { VIEW_MODES, viewHref, type ViewMode } from "@/lib/view-mode";

// Plain links (not state), so a view is shareable and survives a reload.
export function ViewSwitcher({
  basePath,
  view,
  t,
}: {
  /** The page the views belong to: the workspace, or its public shared page. */
  basePath: string;
  view: ViewMode;
  t: Dictionary["workspacePage"];
}) {
  return (
    <nav aria-label={t.viewLabel} className="flex items-center gap-0.5 rounded-xl border bg-muted/30 p-0.5">
      {VIEW_MODES.map((mode) => (
        <Button
          key={mode}
          size="sm"
          variant={view === mode ? "secondary" : "ghost"}
          className="h-7 rounded-lg px-3"
          nativeButton={false}
          render={
            <Link
              href={viewHref(basePath, mode)}
              aria-current={view === mode ? "page" : undefined}
              scroll={false}
            />
          }
        >
          {t.views[mode]}
        </Button>
      ))}
    </nav>
  );
}
