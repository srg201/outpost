"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useOrganization, useOrganizationList } from "@clerk/nextjs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ArrowDown01Icon, Settings02Icon, UserIcon } from "@hugeicons/core-free-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** The radio value for "no team": workspaces that belong to the user alone. */
const PERSONAL = "personal";

function TeamAvatar({ name, imageUrl, className }: { name: string; imageUrl?: string; className?: string }) {
  return (
    <Avatar className={cn("size-5 rounded-md", className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt="" />}
      <AvatarFallback className="rounded-md text-[10px] font-semibold">{name.slice(0, 1).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

/**
 * Switches between personal workspaces and the teams (Clerk organizations) the user belongs to.
 * The active team scopes the dashboard, the board, new workspaces and billing, all on the server,
 * so a switch refreshes the page's server data.
 */
export function TeamSwitcher({ className }: { className?: string }) {
  const t = useI18n().dict.teams;
  const router = useRouter();
  const pathname = usePathname();
  const clerk = useClerk();
  const { organization } = useOrganization();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    // One page holds every team a person realistically belongs to.
    userMemberships: { infinite: true, pageSize: 50 },
  });
  const [switching, setSwitching] = useState(false);

  if (!isLoaded) return null;

  const switchTo = async (value: string) => {
    const next = value === PERSONAL ? null : value;
    if (next === (organization?.id ?? null)) return;
    setSwitching(true);
    try {
      await setActive({ organization: next });
      router.refresh();
    } catch {
      toast.add({ type: "error", title: t.switchFailed });
    } finally {
      setSwitching(false);
    }
  };

  const activeName = organization?.name ?? t.personal;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            disabled={switching}
            aria-label={`${t.switch}: ${activeName}`}
            className={cn("max-w-48 gap-1.5 px-2", className)}
          />
        }
      >
        {organization ? (
          <TeamAvatar name={organization.name} imageUrl={organization.imageUrl} />
        ) : (
          <HugeiconsIcon icon={UserIcon} aria-hidden className="size-4" />
        )}
        <span className="truncate">{activeName}</span>
        <HugeiconsIcon icon={ArrowDown01Icon} aria-hidden className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t.heading}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={organization?.id ?? PERSONAL} onValueChange={switchTo}>
            <DropdownMenuRadioItem value={PERSONAL} closeOnClick className="gap-2">
              <HugeiconsIcon icon={UserIcon} aria-hidden className="size-4" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{t.personal}</span>
                <span className="text-xs text-muted-foreground">{t.personalHint}</span>
              </span>
            </DropdownMenuRadioItem>
            {userMemberships.data?.map(({ organization: team }) => (
              <DropdownMenuRadioItem key={team.id} value={team.id} closeOnClick className="gap-2">
                <TeamAvatar name={team.name} imageUrl={team.imageUrl} />
                <span className="truncate">{team.name}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {organization && (
          <DropdownMenuItem onClick={() => clerk.openOrganizationProfile()}>
            <HugeiconsIcon icon={Settings02Icon} aria-hidden />
            {t.settings}
          </DropdownMenuItem>
        )}
        {/* Clerk makes the new team active; coming back to this page shows its (empty) workspaces. */}
        <DropdownMenuItem onClick={() => clerk.openCreateOrganization({ afterCreateOrganizationUrl: pathname })}>
          <HugeiconsIcon icon={Add01Icon} aria-hidden />
          {t.create}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
