import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentImage } from "@/components/cards";
import { EventRegistrationForm } from "@/components/forms";
import { JsonLd, breadcrumbSchema, eventSchema } from "@/components/structured-data";
import { ButtonLink, Card, Eyebrow, Pill, Section } from "@/components/ui";
import { getEventBySlug, getEventSlugs, getSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, localePath, type Locale } from "@/lib/i18n";
import { formatDateTime, formatOneLineAddress, formatTimeOnly, mapsUrl } from "@/lib/utils";

export const revalidate = 900;

export async function generateStaticParams() {
  const slugs = await getEventSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug, locale);
  if (!event) return { title: "Not found" };

  const description = event.summary ?? event.description ?? event.title;

  return {
    title: event.title,
    description,
    alternates: {
      canonical: `/${locale}/events/${event.slug}`,
      languages: { en: `/en/events/${event.slug}`, fr: `/fr/events/${event.slug}` },
    },
    openGraph: {
      type: "article",
      title: event.title,
      description,
      ...(event.image?.url ? { images: [{ url: event.image.url }] } : {}),
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);

  const [event, settings] = await Promise.all([
    getEventBySlug(slug, locale),
    getSettings(locale),
  ]);

  if (!event) notFound();

  const registrationOpen =
    event.registration.enabled &&
    (!event.registration.closesAt || new Date(event.registration.closesAt) > new Date());

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
              <Link href={localePath(locale, "/events")} className="hover:text-ink">
                {dict.nav.events}
              </Link>
            </nav>

            {event.category ? <Eyebrow className="mt-4">{event.category}</Eyebrow> : null}

            <h1 className="mt-3 font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              {event.title}
            </h1>

            {event.summary ? (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
                {event.summary}
              </p>
            ) : null}

            {event.recurrence ? (
              <Pill className="mt-5 border-accent/40 text-accent">{event.recurrence}</Pill>
            ) : null}
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-surface-2">
            <ContentImage
              image={event.image}
              label={event.title}
              sizes="(min-width: 1024px) 520px, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      <Section className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            <Card className="p-6">
              <dl className="grid gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
                    {dict.events.when}
                  </dt>
                  <dd className="mt-2">
                    <p className="font-display text-lg tracking-tight">
                      <time dateTime={event.start}>
                        {event.recurrence ?? formatDateTime(event.start, locale)}
                      </time>
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {event.recurrence ? formatTimeOnly(event.start, locale) : null}
                      {event.end ? (
                        <>
                          {event.recurrence ? " – " : `${dict.events.until} `}
                          {formatTimeOnly(event.end, locale)}
                        </>
                      ) : null}
                    </p>
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
                    {dict.events.where}
                  </dt>
                  <dd className="mt-2">
                    <p className="font-display text-lg tracking-tight">
                      {event.location ?? settings.name}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {event.address ?? formatOneLineAddress(settings.address)}
                    </p>
                    <a
                      href={mapsUrl(settings)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm underline underline-offset-4 hover:no-underline"
                    >
                      {dict.common.getDirections}
                    </a>
                  </dd>
                </div>
              </dl>
            </Card>

            {event.description ? (
              <div className="mt-8 space-y-4 text-lg leading-relaxed text-ink-muted">
                {event.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={localePath(locale, "/events")} variant="outline">
                {dict.events.backToEvents}
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/contact")} variant="outline">
                {dict.events.askQuestion}
              </ButtonLink>
            </div>
          </div>

          <div>
            {event.registration.externalUrl ? (
              <Card className="p-6">
                <h2 className="font-display text-xl tracking-tight">{dict.events.savePlace}</h2>
                <p className="mt-2 text-sm text-ink-muted">{dict.events.externalBody}</p>
                <ButtonLink
                  href={event.registration.externalUrl}
                  external
                  className="mt-5 w-full"
                >
                  {dict.events.register}
                </ButtonLink>
              </Card>
            ) : registrationOpen ? (
              <EventRegistrationForm
                eventTitle={event.title}
                eventId={event.id}
                locale={locale}
                dict={dict}
              />
            ) : (
              <Card className="p-6">
                <h2 className="font-display text-xl tracking-tight">
                  {event.registration.enabled
                    ? dict.events.registrationClosed
                    : dict.events.justTurnUp}
                </h2>
                <p className="mt-2 text-sm text-ink-muted">
                  {event.registration.enabled
                    ? dict.events.registrationClosedBody
                    : dict.events.justTurnUpBody}
                </p>
                <ButtonLink
                  href={localePath(locale, "/contact")}
                  variant="outline"
                  className="mt-5"
                >
                  {dict.events.contactOffice}
                </ButtonLink>
              </Card>
            )}
          </div>
        </div>
      </Section>

      <JsonLd data={eventSchema(event, settings, locale)} />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.events, path: "/events" },
            { name: event.title, path: `/events/${event.slug}` },
          ],
          locale,
        )}
      />
    </>
  );
}
