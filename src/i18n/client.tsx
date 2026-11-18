"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const I18nContext = createContext<{ locale: Locale; dict: Dictionary } | null>(null);

// The root layout loads the dictionary on the server and hands it to Client Components here.
export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
