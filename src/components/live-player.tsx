"use client";

import Link from "next/link";

import { useNow } from "@/lib/client-hooks";
import type { Dictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { dayName, formatClockTime, getNextService, isServiceLive } from "@/lib/utils";
import { Card } from "./ui";

/**
 * Switches between the live stream and a "next service" holding state.
 *
 * Runs entirely in the browser for the same reason as the live banner: the page
 * is static, so a server-rendered decision would be frozen at build time. The
 * pre-mount state shows the schedule, which is always true.
 */
export function LivePlayer({
  settings,
  embedUrl,
  locale,
  dict,
}: {
  settings: SiteSettings;
  embedUrl: string | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const now = useNow();

  const live = now ? isServiceLive(settings, now) : false;
  const next = getNextService(settings, now ?? new Date());

  if (live && embedUrl) {
    return (
      <div>
        <p className="mb-3 flex items-center gap-2 text-sm font-medium text-live">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-live/70" />
            <span className="relative inline-flex size-2 rounded-full bg-live" />
          </span>
          {dict.live.liveNow}
        </p>
        <div className="aspect-video overflow-hidden rounded-card border border-line bg-black">
          <iframe
            src={embedUrl}
            title={dict.nav.live}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      </div>
    );
  }

  return (
    <Card className="flex min-h-72 flex-col items-center justify-center p-10 text-center">
      {live ? (
        <>
          <p className="font-display text-2xl tracking-tight">{dict.live.liveNow}</p>
          {settings.livestream.channelUrl ? (
            <a
              href={settings.livestream.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-12 items-center rounded-full bg-live px-7 font-medium text-white"
            >
              {dict.live.watchOnChannel}
            </a>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {dict.live.offline}
          </p>
          <p className="mt-3 font-display text-2xl tracking-tight">
            {next
              ? `${dict.live.nextService} ${
                  next.daysUntil === 0
                    ? dict.live.today
                    : next.daysUntil === 1
                      ? dict.live.tomorrow
                      : dayName(next.service.dayOfWeek, locale)
                } ${dict.live.at} ${formatClockTime(next.service.startTime, locale)}`
              : dict.live.joinSunday}
          </p>
          <p className="mt-2 max-w-md text-ink-muted">{dict.live.streamStartsSoon}</p>
          <Link
            href={localePath(locale, "/sermons")}
            className="mt-6 inline-flex h-12 items-center rounded-full bg-brand px-7 font-medium text-brand-contrast"
          >
            {dict.live.browsePast}
          </Link>
        </>
      )}
    </Card>
  );
}
