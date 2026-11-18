import { lang } from "next/root-params";
import { notFound } from "next/navigation";

import { hasLocale, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  ru: () => import("./dictionaries/ru").then((m) => m.default),
};

// The locale of the current route, readable from any Server Component without prop drilling.
export async function getLocale(): Promise<Locale> {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  return locale;
}

export async function getDictionary(locale?: Locale) {
  return dictionaries[locale ?? (await getLocale())]();
}
