"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  DashboardSquare01Icon,
  KanbanIcon,
  LanguageCircleIcon,
  Moon02Icon,
  Search01Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { switchLocale } from "@/components/locale-switcher";
import { listWorkspacesForPalette, type WorkspaceSearchItem } from "@/actions/workspace";
import { useI18n } from "@/i18n/client";
import { LOCALE_NAMES, LOCALES, format } from "@/i18n/config";

// The shortcut reads ⌘K on Apple devices and Ctrl K elsewhere; only knowable in the browser.
const noopSubscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.userAgent);
const isAppleOnServer = () => true;

/**
 * ⌘K / Ctrl+K from anywhere while signed in: jump to a workspace by name, open the dashboard or
 * board, create a workspace, switch theme or language. Workspaces load each time it opens, so
 * the list is never stale.
 */
export function CommandPalette() {
  const router = useRouter();
  const { locale, dict } = useI18n();
  const t = dict.palette;
  const { resolvedTheme, setTheme } = useTheme();
  const apple = useSyncExternalStore(noopSubscribe, isApple, isAppleOnServer);

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceSearchItem[] | null>(null);

  const show = () => {
    setOpen(true);
    listWorkspacesForPalette()
      .then(setWorkspaces)
      .catch(() => setWorkspaces([]));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey) || event.repeat) return;
      event.preventDefault();
      if (open) setOpen(false);
      else show();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Close first, then act, so focus returns to the page before navigation or another dialog.
  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  const otherLocales = LOCALES.filter((l) => l !== locale);
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <Button
        variant="outline"
        onClick={show}
        aria-keyshortcuts="Meta+K Control+K"
        className="gap-2 text-muted-foreground max-sm:size-9 max-sm:px-0"
      >
        <HugeiconsIcon icon={Search01Icon} aria-hidden />
        <span className="max-sm:sr-only">{t.open}</span>
        <KbdGroup className="max-sm:hidden" aria-hidden>
          <Kbd>{apple ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t.title} description={t.description}>
        <CommandInput placeholder={t.placeholder} />
        <CommandList>
          <CommandEmpty>{workspaces === null ? t.loading : t.empty}</CommandEmpty>

          {workspaces && workspaces.length > 0 && (
            <CommandGroup heading={t.workspaces}>
              {workspaces.map((workspace) => (
                <CommandItem
                  key={workspace.id}
                  value={`${workspace.name} ${workspace.id}`}
                  onSelect={run(() => router.push(`/workspace/${workspace.id}`))}
                >
                  <span className="truncate">{workspace.name}</span>
                  <CommandShortcut>{dict.workspace.statuses[workspace.status]}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading={t.goTo}>
            <CommandItem onSelect={run(() => router.push("/dashboard"))}>
              <HugeiconsIcon icon={DashboardSquare01Icon} aria-hidden />
              {dict.common.dashboard}
            </CommandItem>
            <CommandItem onSelect={run(() => router.push("/workspaces"))}>
              <HugeiconsIcon icon={KanbanIcon} aria-hidden />
              {dict.nav.board}
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading={t.actions}>
            <CommandItem onSelect={run(() => setCreating(true))}>
              <HugeiconsIcon icon={Add01Icon} aria-hidden />
              {dict.dashboard.newWorkspace}
            </CommandItem>
            <CommandItem onSelect={run(() => setTheme(isDark ? "light" : "dark"))}>
              <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} aria-hidden />
              {isDark ? t.lightTheme : t.darkTheme}
            </CommandItem>
            {otherLocales.map((l) => (
              <CommandItem key={l} onSelect={run(() => switchLocale(l))}>
                <HugeiconsIcon icon={LanguageCircleIcon} aria-hidden />
                {format(t.switchLanguage, { language: LOCALE_NAMES[l] })}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <WorkspaceDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
