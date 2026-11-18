import { describe, expect, it } from "vitest";

import { format, localeFromAcceptLanguage, splitLocale } from "@/i18n/config";
import en from "@/i18n/dictionaries/en";
import ru from "@/i18n/dictionaries/ru";

describe("splitLocale", () => {
  it("splits a locale prefix from the path", () => {
    expect(splitLocale("/ru/dashboard")).toEqual({ locale: "ru", path: "/dashboard" });
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
  });

  it("leaves unprefixed paths alone", () => {
    expect(splitLocale("/dashboard")).toEqual({ locale: null, path: "/dashboard" });
    // Only a whole first segment counts, not a prefix of one.
    expect(splitLocale("/russia")).toEqual({ locale: null, path: "/russia" });
  });
});

describe("localeFromAcceptLanguage", () => {
  it("picks the highest-ranked supported language", () => {
    expect(localeFromAcceptLanguage("ru-RU,ru;q=0.9,en;q=0.8")).toBe("ru");
    expect(localeFromAcceptLanguage("de-DE,en;q=0.5,ru;q=0.7")).toBe("ru");
  });

  it("returns null when nothing is supported", () => {
    expect(localeFromAcceptLanguage("de-DE,fr;q=0.9")).toBeNull();
    expect(localeFromAcceptLanguage(null)).toBeNull();
  });
});

describe("format", () => {
  it("fills known placeholders and keeps unknown ones", () => {
    expect(format("{used} of {limit}", { used: 4, limit: 500 })).toBe("4 of 500");
    expect(format("Hi, {name}", {})).toBe("Hi, {name}");
  });
});

// Walks two dictionaries in parallel and lists every path where their shape differs.
function shapeDiff(a: unknown, b: unknown, path = ""): string[] {
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) ? [] : [path];
  }
  if (typeof a === "object" && a && typeof b === "object" && b) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((key) =>
      shapeDiff((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], `${path}.${key}`),
    );
  }
  return typeof a === typeof b ? [] : [path];
}

// Collects every string in a dictionary with its path.
function strings(value: unknown, path = ""): [string, string][] {
  if (typeof value === "string") return [[path, value]];
  if (typeof value === "object" && value) {
    return Object.entries(value).flatMap(([key, v]) => strings(v, `${path}.${key}`));
  }
  return [];
}

describe("dictionaries", () => {
  it("have the same keys in every language", () => {
    expect(shapeDiff(en, ru)).toEqual([]);
  });

  it("use the same placeholders in every language", () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    const russian = new Map(strings(ru));
    const mismatched = strings(en).filter(([path, text]) => {
      const translation = russian.get(path);
      return translation !== undefined && placeholders(text).join() !== placeholders(translation).join();
    });
    expect(mismatched).toEqual([]);
  });

  it("have no empty strings", () => {
    expect([...strings(en), ...strings(ru)].filter(([, text]) => !text.trim())).toEqual([]);
  });
});
