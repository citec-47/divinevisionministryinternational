import Image from "next/image";
import Link from "next/link";

import type { Dictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";
import type { ChurchEvent, ImageRef, Ministry, Sermon, Series } from "@/lib/types";
import { cn, formatDateTime, formatDuration, formatShortDate, formatTimeOnly } from "@/lib/utils";
import { Card, ImageFallback, Pill } from "./ui";

/**
 * Renders a content image, or a generated gradient when there is none.
 *
 * A church CMS regularly has records without artwork (a sermon uploaded on
 * Monday morning, a ministry nobody has photographed yet) and those should
 * still look deliberate rather than broken.
 */
export function ContentImage({
  image,
  label,
  className,
  sizes = "(min-width: 1024px) 380px, 100vw",
  priority,
}: {
  image?: ImageRef;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!image?.url) return <ImageFallback label={label} className={className} />;

  return (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}

export function SermonCard({
  sermon,
  locale,
  priority,
}: {
  sermon: Sermon;
  locale: Locale;
  priority?: boolean;
}) {
  const duration = formatDuration(sermon.durationSeconds, locale);

  return (
    <Card className="group overflow-hidden hover:border-ink-faint">
      <Link href={localePath(locale, `/sermons/${sermon.slug}`)} className="block">
        <div className="relative aspect-video overflow-hidden bg-surface-2">
          <ContentImage image={sermon.image} label={sermon.title} priority={priority} />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
            <time dateTime={sermon.date}>{formatShortDate(sermon.date, locale)}</time>
            {sermon.series ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{sermon.series.title}</span>
              </>
            ) : null}
            {duration ? (
              <>
                <span aria-hidden="true">·</span>
                <span>{duration}</span>
              </>
            ) : null}
          </div>

          <h3 className="mt-2 font-display text-xl leading-snug tracking-tight group-hover:text-brand">
            {sermon.title}
          </h3>

          {sermon.summary ? (
            <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{sermon.summary}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            {sermon.speaker ? <span>{sermon.speaker.name}</span> : null}
            {sermon.scriptures.slice(0, 2).map((ref) => (
              <Pill key={ref}>{ref}</Pill>
            ))}
          </div>
        </div>
      </Link>
    </Card>
  );
}

export function EventCard({
  event,
  locale,
  dict,
}: {
  event: ChurchEvent;
  locale: Locale;
  dict: Dictionary;
}) {
  const start = new Date(event.start);
  const day = start.getDate();
  const month = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
  }).format(start);

  return (
    <Card className="group overflow-hidden hover:border-ink-faint">
      <Link href={localePath(locale, `/events/${event.slug}`)} className="flex gap-4 p-5">
        <div
          aria-hidden="true"
          className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface-2"
        >
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-accent">
            {month}
          </span>
          <span className="font-display text-2xl leading-none">{day}</span>
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-lg leading-snug tracking-tight group-hover:text-brand">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            <time dateTime={event.start}>
              {event.recurrence ?? formatDateTime(event.start, locale)}
            </time>
            {event.recurrence ? `, ${formatTimeOnly(event.start, locale)}` : null}
          </p>
          {event.location ? (
            <p className="mt-1 text-sm text-ink-faint">{event.location}</p>
          ) : null}
          {event.registration.enabled ? (
            <Pill className="mt-3 border-accent/40 text-accent">
              {dict.events.registrationOpen}
            </Pill>
          ) : null}
        </div>
      </Link>
    </Card>
  );
}

export function SeriesCard({
  series,
  locale,
  dict,
}: {
  series: Series;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Card className="group overflow-hidden hover:border-ink-faint">
      <Link href={localePath(locale, `/series/${series.slug}`)} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
          <ContentImage image={series.image} label={series.title} />
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl leading-snug tracking-tight group-hover:text-brand">
            {series.title}
          </h3>
          {series.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{series.description}</p>
          ) : null}
          {series.sermonCount ? (
            <p className="mt-3 text-xs text-ink-faint">
              {series.sermonCount}{" "}
              {series.sermonCount === 1 ? dict.sermons.message : dict.sermons.messages}
            </p>
          ) : null}
        </div>
      </Link>
    </Card>
  );
}

export function MinistryCard({ ministry, locale }: { ministry: Ministry; locale: Locale }) {
  return (
    <Card className="group overflow-hidden hover:border-ink-faint">
      <Link href={localePath(locale, `/ministries/${ministry.slug}`)} className="block h-full">
        <div className="relative aspect-[3/2] overflow-hidden bg-surface-2">
          <ContentImage image={ministry.image} label={ministry.title} />
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl leading-snug tracking-tight group-hover:text-brand">
            {ministry.title}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">{ministry.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ministry.audience ? <Pill>{ministry.audience}</Pill> : null}
            {ministry.meetingTime ? <Pill>{ministry.meetingTime}</Pill> : null}
          </div>
        </div>
      </Link>
    </Card>
  );
}
