"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { LanguageCircleIcon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/i18n/client";
import { LOCALE_COOKIE, LOCALE_NAMES, LOCALES, hasLocale, splitLocale } from "@/i18n/config";

// Saves the choice in the cookie the proxy reads, then reloads: the root layout (and <html lang>)
// depends on the locale, so a full load is the simplest way to switch every part of the page.
function switchLocale(next: string) {
  if (!hasLocale(next)) return;
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  const { locale, path } = splitLocale(window.location.pathname);
  const target = (locale ? `/${next}${path === "/" ? "" : path}` : path) + window.location.search + window.location.hash;
  window.location.assign(target);
}

export function LocaleSwitcher() {
  const { locale, dict } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label={dict.common.language}>
            <HugeiconsIcon icon={LanguageCircleIcon} aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={locale} onValueChange={switchLocale}>
          {LOCALES.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} lang={l}>
              {LOCALE_NAMES[l]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
