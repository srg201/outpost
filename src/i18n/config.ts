// Shared by the proxy, server and client code, so nothing here may import server-only APIs.
export const LOCALES = ["en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_NAMES: Record<Locale, string> = { en: "English", ru: "Русский" };

export function hasLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

// "/ru/dashboard" -> { locale: "ru", path: "/dashboard" }; unprefixed paths get locale null.
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const first = pathname.split("/")[1];
  if (!hasLocale(first)) return { locale: null, path: pathname };
  return { locale: first, path: pathname.slice(first.length + 1) || "/" };
}

// Picks the first supported language from an Accept-Language header ("ru-RU,ru;q=0.9,en;q=0.8").
export function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.split("-")[0].toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return ranked.find((entry) => hasLocale(entry.lang))?.lang as Locale | undefined ?? null;
}

// Fills "{name}" placeholders: format("Hi, {name}", { name: "Ann" }).
export function format(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
