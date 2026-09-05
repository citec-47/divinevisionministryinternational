import { INTL_LOCALE, type Locale } from "./i18n";
import type { ServiceTime, SiteSettings } from "./types";

/** Minimal class joiner. Not tailwind-merge — order your classes deliberately. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

const DAY_NAMES: Record<Locale, readonly string[]> = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
};

export function dayName(dayOfWeek: number, locale: Locale): string {
  return DAY_NAMES[locale][dayOfWeek] ?? "";
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** "HH:MM" -> minutes since midnight. Returns 0 for anything unparseable. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return 0;
  return h * 60 + (Number.isNaN(m) ? 0 : m);
}

/**
 * Renders "09:00" the way each language actually writes it: "9:00 am" in
 * English, "9h00" in French, which uses a 24-hour clock.
 */
export function formatClockTime(time: string, locale: Locale = "en"): string {
  const minutes = timeToMinutes(time);
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (locale === "fr") return `${h24}h${String(m).padStart(2, "0")}`;

  const suffix = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

type ZonedNow = { dayOfWeek: number; minutes: number; year: number; month: number; day: number };

/** Reads the wall-clock date and time in an arbitrary IANA timezone. */
export function zonedNow(timeZone: string, at: Date = new Date()): ZonedNow {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  // Intl renders midnight as "24" in some engines under hour12: false.
  const hour = Number(parts.hour) % 24;

  return {
    dayOfWeek: WEEKDAY_INDEX[parts.weekday] ?? 0,
    minutes: hour * 60 + Number(parts.minute),
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

/** Offset of `timeZone` from UTC, in minutes, at the given instant. */
function offsetMinutes(at: Date, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUtc - at.getTime()) / 60000;
}

/**
 * Converts a wall-clock time in `timeZone` to a real instant.
 *
 * Two passes, because the offset itself depends on the instant we are solving
 * for. Cameroon does not observe DST, but the church may not always be the only
 * deployment of this code, and the second pass costs nothing.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  minutes: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month - 1, day, Math.floor(minutes / 60), minutes % 60);
  const firstPass = new Date(guess - offsetMinutes(new Date(guess), timeZone) * 60000);
  return new Date(guess - offsetMinutes(firstPass, timeZone) * 60000);
}

export type NextService = {
  service: ServiceTime;
  startsAt: Date;
  daysUntil: number;
  isToday: boolean;
};

/**
 * The next service that has not yet started, searching up to a week ahead.
 * Null when the church has no service times entered.
 */
export function getNextService(settings: SiteSettings, at: Date = new Date()): NextService | null {
  if (!settings.serviceTimes.length) return null;

  const now = zonedNow(settings.timezone, at);
  let best: NextService | null = null;

  for (const service of settings.serviceTimes) {
    const startMinutes = timeToMinutes(service.startTime);

    let daysUntil = (service.dayOfWeek - now.dayOfWeek + 7) % 7;
    // Already started today? Roll to next week's occurrence.
    if (daysUntil === 0 && startMinutes <= now.minutes) daysUntil = 7;

    const startsAt = zonedTimeToUtc(
      now.year,
      now.month,
      now.day + daysUntil,
      startMinutes,
      settings.timezone,
    );

    if (!best || startsAt < best.startsAt) {
      best = { service, startsAt, daysUntil, isToday: daysUntil === 0 };
    }
  }

  return best;
}

/**
 * True while a service is in progress, or when staff have flipped the manual
 * override. Services without an end time are assumed to run 90 minutes.
 */
export function isServiceLive(settings: SiteSettings, at: Date = new Date()): boolean {
  if (settings.livestream.forceLive) return true;

  const now = zonedNow(settings.timezone, at);

  return settings.serviceTimes.some((service) => {
    if (service.dayOfWeek !== now.dayOfWeek) return false;
    const start = timeToMinutes(service.startTime);
    const end = service.endTime ? timeToMinutes(service.endTime) : start + 90;
    return now.minutes >= start && now.minutes <= end;
  });
}

/** Groups service times by day, in week order. */
export function groupServicesByDay(
  services: ServiceTime[],
): { day: number; items: ServiceTime[] }[] {
  const byDay = new Map<number, ServiceTime[]>();
  for (const service of services) {
    const list = byDay.get(service.dayOfWeek) ?? [];
    list.push(service);
    byDay.set(service.dayOfWeek, list);
  }
  return [...byDay.entries()]
    .map(([day, items]) => ({ day, items }))
    .sort((a, b) => a.day - b.day);
}

// --- Formatting -------------------------------------------------------------

export function formatDate(iso: string, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));
}

export function formatShortDate(iso: string, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: locale === "en",
    timeZone,
  }).format(new Date(iso));
}

export function formatTimeOnly(iso: string, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    hour: "numeric",
    minute: "2-digit",
    hour12: locale === "en",
    timeZone,
  }).format(new Date(iso));
}

export function formatMonthYear(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Money. XAF has no minor unit, so francs are whole numbers and showing
 * ".00" would be wrong — `Intl` already knows this, we just must not override it.
 */
export function formatCurrency(amount: number, currency: string, locale: Locale): string {
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "XAF" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(INTL_LOCALE[locale])} ${currency}`;
  }
}

/** "38 min" / "1 hr 12 min", for sermon cards and the podcast feed. */
export function formatDuration(seconds: number | undefined, locale: Locale = "en"): string | null {
  if (!seconds || seconds <= 0) return null;

  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hourLabel = locale === "fr" ? "h" : " hr";
  const minLabel = locale === "fr" ? " min" : " min";

  if (!hours) return `${minutes}${minLabel}`;
  return minutes ? `${hours}${hourLabel} ${minutes}${minLabel}` : `${hours}${hourLabel}`;
}

/** "HH:MM:SS", the duration format podcast directories expect. */
export function formatDurationClock(seconds?: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

// --- Church-specific links --------------------------------------------------

export function formatOneLineAddress(address: SiteSettings["address"]): string {
  return [address.line, address.city, address.region, address.country]
    .filter(Boolean)
    .join(", ");
}

/** Opens the address in whichever maps app the device prefers. */
export function mapsUrl(settings: SiteSettings): string {
  const query =
    settings.address.latitude != null && settings.address.longitude != null
      ? `${settings.address.latitude},${settings.address.longitude}`
      : `${settings.name}, ${formatOneLineAddress(settings.address)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * WhatsApp is the primary way people reach a church in Cameroon — more than
 * email, and more than a phone call. Every contact point on the site offers it.
 */
export function whatsappUrl(settings: SiteSettings, message?: string): string | null {
  if (!settings.whatsapp) return null;
  const digits = settings.whatsapp.replace(/\D/g, "");
  if (!digits) return null;

  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Formats the stored digits back into something readable: +237 6 72 91 61 20. */
export function formatWhatsappNumber(whatsapp?: string): string | null {
  if (!whatsapp) return null;
  const digits = whatsapp.replace(/\D/g, "");
  if (!digits) return null;

  // Cameroon: 237 + 9 digits, conventionally grouped 1-2-2-2-2.
  if (digits.startsWith("237") && digits.length === 12) {
    const local = digits.slice(3);
    return `+237 ${local[0]} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }
  return `+${digits}`;
}

// --- URLs -------------------------------------------------------------------

/** Canonical origin, used for metadata, the sitemap, and the podcast feed. */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Normalises a YouTube/Vimeo watch URL into an embeddable one. Anything else is
 * returned untouched so a direct embed URL still works.
 */
export function toEmbedUrl(url?: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (host.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
      }
      if (parsed.pathname.startsWith("/live/")) {
        return `https://www.youtube-nocookie.com/embed/${parsed.pathname.split("/")[2]}`;
      }
      if (parsed.pathname.startsWith("/embed/")) return url;
    }
    if (host.endsWith("vimeo.com") && !host.startsWith("player.")) {
      return `https://player.vimeo.com/video/${parsed.pathname.split("/").filter(Boolean)[0]}`;
    }
    return url;
  } catch {
    return null;
  }
}

/** Escapes text for inclusion in the podcast XML feed. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
