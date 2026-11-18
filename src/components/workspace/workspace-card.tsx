"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { HugeiconsIcon } from "@hugeicons/react";
import { DashboardSquare01Icon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { WorkspaceCardData } from "@/lib/workspace-status";

const DATE_LOCALES = { en: enUS, ru };

function initials(name: string | null) {
  return (name ?? "?")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// The whole card is clickable through the title link's stretched ::after.
// A Client Component, so the board can drag it; the relative time may tick between server and client.
export function WorkspaceCard({
  workspace,
  showStatus,
  highlighted,
  actions,
}: {
  workspace: WorkspaceCardData;
  showStatus?: boolean;
  /** e.g. while the card is being dragged */
  highlighted?: boolean;
  /** Menu button in the top-right corner; it sits above the stretched link. */
  actions?: ReactNode;
}) {
  const { creator } = workspace;
  const { locale, dict } = useI18n();

  return (
    <article
      className={cn(
        "group relative flex h-36 flex-col rounded-2xl border bg-card/50 p-4 transition-[background-color,border-color,box-shadow] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring/50 hover:border-foreground/20 hover:bg-card",
        highlighted && "border-primary/40 bg-card shadow-xl ring-2 ring-primary/30",
      )}
    >
      <h3 className={cn("truncate font-medium", actions && "pr-8")}>
        <Link
          href={`/workspace/${workspace.id}`}
          className="outline-none after:absolute after:inset-0 after:rounded-2xl"
        >
          {workspace.name}
        </Link>
      </h3>
      {workspace.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{workspace.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          <HugeiconsIcon icon={DashboardSquare01Icon} className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {showStatus && <>{dict.workspace.statuses[workspace.status]} · </>}
            <time dateTime={workspace.lastActivity.toISOString()} suppressHydrationWarning>
              {formatDistanceToNow(workspace.lastActivity, { addSuffix: true, locale: DATE_LOCALES[locale] })}
            </time>
          </span>
        </span>
        <Avatar size="sm" title={creator.name ?? undefined}>
          {creator.imageUrl && <AvatarImage src={creator.imageUrl} alt="" />}
          <AvatarFallback className="text-[10px]">{initials(creator.name)}</AvatarFallback>
        </Avatar>
      </div>

      {actions && <div className="absolute top-2 right-2 z-10">{actions}</div>}
    </article>
  );
}
