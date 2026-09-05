import type { Metadata } from "next";

import { EventBrowser } from "@/components/event-browser";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { getUpcomingEvents } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";

/**
 * Shorter window than the rest of the site: an event list that is a day stale
 * still shows things that have already happened.
 */
export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.nav.events,
    description: dict.events.intro,
    alternates: {
      canonical: `/${locale}/events`,
      languages: { en: "/en/events", fr: "/fr/events" },
    },
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const events = await getUpcomingEvents(locale);

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page py-14 sm:py-20">
          <Eyebrow>{dict.nav.events}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.events.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {dict.events.intro}
          </p>

          <div className="mt-7">
            <ButtonLink href={localePath(locale, "/visit")} variant="outline">
              {dict.events.startSunday}
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section>
        <EventBrowser events={events} locale={locale} dict={dict} />
      </Section>

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.events, path: "/events" },
          ],
          locale,
        )}
      />
    </>
  );
}
