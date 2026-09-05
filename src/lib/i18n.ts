/**
 * Locale handling.
 *
 * Cameroon is officially bilingual and Yaoundé is largely francophone, so the
 * site ships in both languages. English is the default because the church's own
 * name and communication are in English.
 *
 * Content translation is per-field and optional: `localize` falls back to
 * English whenever a French value has not been filled in yet, so the site is
 * never half-blank while the office works through translating the archive.
 */
export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** Picks the localized value, falling back to English when French is empty. */
export function localize(
  locale: Locale,
  en: string | null | undefined,
  fr: string | null | undefined,
): string {
  if (locale === "fr") return fr?.trim() || en?.trim() || "";
  return en?.trim() || "";
}

/** Same, but preserves "not set at all" as undefined rather than "". */
export function localizeOptional(
  locale: Locale,
  en: string | null | undefined,
  fr: string | null | undefined,
): string | undefined {
  const value = localize(locale, en, fr);
  return value === "" ? undefined : value;
}

/** Prefixes an app path with the locale: ("fr", "/give") -> "/fr/give". */
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** Reads the best supported locale out of an Accept-Language header. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), quality: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    if (tag.startsWith("fr")) return "fr";
    if (tag.startsWith("en")) return "en";
  }
  return DEFAULT_LOCALE;
}

/** BCP-47 tags for Intl formatting, distinct from our route locales. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
};
