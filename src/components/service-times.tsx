import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import {
  cn,
  dayName,
  formatClockTime,
  formatOneLineAddress,
  groupServicesByDay,
  mapsUrl,
} from "@/lib/utils";

/**
 * When we meet and where: the two questions a first-time visitor has.
 *
 * Rendered on the server from database rows, so it is correct with JavaScript
 * off. Renders nothing at all when no service times have been entered, rather
 * than an empty box: a church with no published times should look like it has
 * none, not like the page is broken.
 */
export function ServiceTimes({
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
  const grouped = groupServicesByDay(settings.serviceTimes);
  if (!grouped.length) return null;

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {grouped.map(({ day, items }) => (
        <div key={day} className="rounded-card border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {dayName(day, locale)}
          </p>
          <ul className="mt-3 space-y-3">
            {items.map((service) => (
              <li key={service.id}>
                <p className="font-display text-2xl leading-none tracking-tight">
                  {formatClockTime(service.startTime, locale)}
                  {service.endTime ? (
                    <span className="text-base text-ink-faint">
                      {" "}
                      – {formatClockTime(service.endTime, locale)}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-ink-muted">{service.label}</p>
                {service.note ? (
                  <p className="mt-1 text-sm text-ink-faint">{service.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <span className="sr-only">{dict.serviceTimes.when}</span>
    </div>
  );
}

export function LocationBlock({
  settings,
  dict,
  className,
}: {
  settings: SiteSettings;
  dict: Dictionary;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-line bg-surface p-5", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        {dict.serviceTimes.where}
      </p>

      <address className="mt-3 not-italic">
        <p className="font-display text-xl leading-snug tracking-tight">
          {settings.address.line}
        </p>
        <p className="mt-1 text-ink-muted">
          {[settings.address.city, settings.address.region, settings.address.country]
            .filter(Boolean)
            .join(", ")}
        </p>
      </address>

      {settings.address.note ? (
        <p className="mt-3 text-sm text-ink-faint">{settings.address.note}</p>
      ) : null}

      <a
        href={mapsUrl(settings)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium transition-colors hover:bg-surface-2"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {dict.common.getDirections}
      </a>

      <span className="sr-only">{formatOneLineAddress(settings.address)}</span>
    </div>
  );
}
