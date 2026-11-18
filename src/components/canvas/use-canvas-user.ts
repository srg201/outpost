"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { atom, computed, createTLCurrentUser, getUserPreferences } from "tldraw";

import { useI18n } from "@/i18n/client";

/**
 * The canvas's own user: name, color, language and theme follow the app, everything else (snap
 * mode, etc.) comes from tldraw's locally stored preferences. The theme can change without a
 * remount, so it goes through an atom the preferences read.
 */
export function useCanvasUser({ id, name, color }: { id: string; name: string; color: string }) {
  const { locale } = useI18n();
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme === "light" ? "light" : "dark";

  const [themeAtom] = useState(() => atom<"light" | "dark">("colorScheme", colorScheme));
  useEffect(() => {
    themeAtom.set(colorScheme);
  }, [themeAtom, colorScheme]);

  return useMemo(
    () =>
      createTLCurrentUser({
        userPreferences: computed("outpostUserPreferences", () => ({
          ...getUserPreferences(),
          id,
          name,
          color,
          locale,
          colorScheme: themeAtom.get(),
        })),
      }),
    [id, name, color, locale, themeAtom],
  );
}
