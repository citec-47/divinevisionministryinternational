import Link from "next/link";

import type { Dictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import {
  dayName,
  formatClockTime,
  formatOneLineAddress,
  formatWhatsappNumber,
  groupServicesByDay,
  mapsUrl,
  whatsappUrl,
} from "@/lib/utils";

export function SiteFooter({
  settings,
  locale,
  dict,
}: {
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
}) {
  const grouped = groupServicesByDay(settings.serviceTimes);
  const whatsapp = whatsappUrl(settings);

  const exploreLinks = [
    { href: "/visit", label: dict.nav.visit },
    { href: "/sermons", label: dict.nav.sermons },
    { href: "/events", label: dict.nav.events },
    { href: "/ministries", label: dict.nav.ministries },
    { href: "/about", label: dict.footer.aboutUs },
    { href: "/live", label: dict.nav.live },
  ];

  const actionLinks = [
    { href: "/give", label: dict.nav.give },
    { href: "/prayer", label: dict.nav.prayer },
    { href: "/contact", label: dict.nav.contact },
  ];

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl leading-tight">{settings.name}</p>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">{settings.tagline}</p>

          {settings.socials.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {settings.socials.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {grouped.length ? (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
              {dict.serviceTimes.gatheringTimes}
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {grouped.map(({ day, items }) => (
                <li key={day}>
                  <p className="font-medium">{dayName(day, locale)}</p>
                  <p className="text-ink-muted">
                    {items.map((item) => formatClockTime(item.startTime, locale)).join(" · ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div />
        )}

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {dict.footer.explore}
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={localePath(locale, link.href)}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {dict.footer.findUs}
          </h2>

          <address className="mt-4 space-y-2 text-sm not-italic text-ink-muted">
            <a
              href={mapsUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-[22ch] transition-colors hover:text-ink"
            >
              {formatOneLineAddress(settings.address)}
            </a>
            {whatsapp ? (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-ink"
              >
                WhatsApp {formatWhatsappNumber(settings.whatsapp)}
              </a>
            ) : null}
            {settings.phone ? (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="block hover:text-ink">
                {settings.phone}
              </a>
            ) : null}
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="block hover:text-ink">
                {settings.email}
              </a>
            ) : null}
          </address>

          <ul className="mt-5 space-y-2.5 text-sm">
            {actionLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={localePath(locale, link.href)}
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="/api/podcast.xml"
                className="text-ink-muted transition-colors hover:text-ink"
              >
                {dict.footer.podcastFeed}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {settings.name}. {dict.common.allRightsReserved}
          </p>
          <p>
            <Link
              href={localePath(locale, "/privacy")}
              className="transition-colors hover:text-ink-muted"
            >
              {dict.common.privacy}
            </Link>
            <span aria-hidden="true" className="px-2">
              ·
            </span>
            <Link
              href={localePath(locale, "/accessibility")}
              className="transition-colors hover:text-ink-muted"
            >
              {dict.common.accessibility}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
