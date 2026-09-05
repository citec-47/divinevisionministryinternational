"use client";

import Link from "next/link";

import { useNow } from "@/lib/client-hooks";
import type { Dictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { cn, dayName, formatClockTime, getNextService, isServiceLive } from "@/lib/utils";

/**
 * Live status has to be worked out in the browser: pages are statically
 * rendered, so anything decided on the server is frozen at build time. Both
 * components render nothing until hydrated, which keeps the static HTML correct
 * for crawlers and for visitors without JavaScript.
 */

export function LiveBanner({
  settings,
  locale,
  dict,
}: {
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
}) {
  const now = useNow();
  if (!now || !isServiceLive(settings, now)) return null;

  return (
    <div className="bg-live text-white">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex size-2 rounded-full bg-white" />
          </span>
          {dict.live.liveNow}
        </span>
        <Link
          href={localePath(locale, "/live")}
          className="underline underline-offset-4 hover:no-underline"
        >
          {dict.live.watchService}
        </Link>
      </div>
    </div>
  );
}

export function NextServiceNotice({
  settings,
  locale,
  dict,
  className,
}: {
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
  className?: string;
}) {
  const now = useNow();
  if (!now) return null;

  if (isServiceLive(settings, now)) {
    return (
      <p className={cn("text-sm font-medium text-live", className)}>
        {dict.live.happeningNow} —{" "}
        <Link href={localePath(locale, "/live")} className="underline underline-offset-4">
          {dict.live.watchLive}
        </Link>
      </p>
    );
  }

  const next = getNextService(settings, now);
  if (!next) return null;

  const when =
    next.daysUntil === 0
      ? dict.live.today
      : next.daysUntil === 1
        ? dict.live.tomorrow
        : dayName(next.service.dayOfWeek, locale);

  return (
    <p className={cn("text-sm text-ink-muted", className)}>
      {dict.live.nextService}{" "}
      <span className="font-medium text-ink">
        {when} {dict.live.at} {formatClockTime(next.service.startTime, locale)}
      </span>{" "}
      — {next.service.label}
    </p>
  );
}
