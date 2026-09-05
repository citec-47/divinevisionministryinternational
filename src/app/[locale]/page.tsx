import Image from "next/image";
import Link from "next/link";

import { EventCard, SermonCard } from "@/components/cards";
import { NextServiceNotice } from "@/components/live-status";
import { LocationBlock, ServiceTimes } from "@/components/service-times";
import { ButtonLink, Card, Eyebrow, Section, SectionHeading } from "@/components/ui";
import {
  getLatestSermon,
  getMinistries,
  getSettings,
  getUpcomingEvents,
} from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";
import { formatDuration, formatShortDate } from "@/lib/utils";

/** Rebuilt hourly; an admin publish also busts it through /api/revalidate. */
export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [settings, latestSermon, events, ministries] = await Promise.all([
    getSettings(locale),
    getLatestSermon(locale),
    getUpcomingEvents(locale),
    getMinistries(locale),
  ]);

  const upcoming = events.slice(0, 3);
  const featuredMinistries = ministries.slice(0, 3);
  const outreach = ministries.find((ministry) => ministry.slug === "outreach");

  return (
    <>
      {/*
        The hero leads with the Prophet's portrait, as the church asked. The
        service time and location still sit directly beneath it, so a first-time
        visitor gets "when" and "where" without hunting.
      */}
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
          <div className="order-1">
            <Eyebrow>
              {settings.shortName} · {dict.home.welcome}
            </Eyebrow>

            <h1 className="mt-4 font-display display-balance text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {settings.tagline}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              {settings.description}
            </p>

            <NextServiceNotice
              settings={settings}
              locale={locale}
              dict={dict}
              className="mt-6"
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href={localePath(locale, "/visit")} size="lg">
                {dict.home.planVisit}
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/live")} variant="outline" size="lg">
                {dict.home.watchAService}
              </ButtonLink>
            </div>
          </div>

          <div className="order-2 lg:justify-self-end">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-card border border-line bg-surface-2 lg:max-w-md">
              <Image
                src="/images/pastor-portrait.jpeg"
                alt="Prophet Emmanuel Ayuh, founder and lead pastor of Divine Vision Ministry International."
                fill
                priority
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 100vw"
                className="object-cover object-top"
              />
            </div>
            <p className="mt-3 text-center text-sm text-ink-faint">
              Prophet Emmanuel Ayuh
            </p>
          </div>
        </div>
      </section>

      {(settings.serviceTimes.length > 0 || settings.address.line) && (
        <Section className="py-12 sm:py-14">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <ServiceTimes settings={settings} locale={locale} dict={dict} />
            <LocationBlock settings={settings} dict={dict} />
          </div>
        </Section>
      )}

      <Section tone="surface">
        <SectionHeading
          eyebrow={dict.home.firstTime}
          title={dict.home.whatToExpect}
          description={dict.home.whatToExpectIntro}
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {dict.home.highlights.map((item) => (
            <Card key={item.title} className="bg-ground p-6">
              <h3 className="font-display text-xl tracking-tight">{item.title}</h3>
              <p className="mt-2 text-ink-muted">{item.body}</p>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <ButtonLink href={localePath(locale, "/visit")} variant="outline">
            {dict.home.fullGuide}
          </ButtonLink>
        </div>
      </Section>

      {/* The outreach photographs are the strongest thing the church has to
          show: real work, real people, no stock imagery. */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface-2">
            <Image
              src="/images/outreach-orphanage.jpeg"
              alt="Prophet Emmanuel Ayuh and church members with children at an orphanage in Yaoundé, beside donated rice, drinks and household supplies."
              fill
              sizes="(min-width: 1024px) 34rem, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <Eyebrow>{dict.home.outreachEyebrow}</Eyebrow>
            <h2 className="mt-4 font-display display-balance text-3xl leading-tight tracking-tight sm:text-4xl">
              {dict.home.outreachTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
              {dict.home.outreachIntro}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {outreach ? (
                <ButtonLink href={localePath(locale, `/ministries/${outreach.slug}`)}>
                  {dict.home.outreachCta}
                </ButtonLink>
              ) : null}
              <ButtonLink href={localePath(locale, "/give")} variant="outline">
                {dict.nav.give}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {latestSermon ? (
        <Section tone="surface">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <SectionHeading
                eyebrow={dict.home.latestMessage}
                title={latestSermon.title}
                description={latestSermon.summary}
              />

              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                {latestSermon.speaker ? (
                  <div>
                    <dt className="text-ink-faint">{dict.home.speaker}</dt>
                    <dd className="mt-0.5 font-medium">{latestSermon.speaker.name}</dd>
                  </div>
                ) : null}
                {latestSermon.scriptures.length ? (
                  <div>
                    <dt className="text-ink-faint">{dict.home.passage}</dt>
                    <dd className="mt-0.5 font-medium">
                      {latestSermon.scriptures.join(", ")}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-ink-faint">{dict.home.preached}</dt>
                  <dd className="mt-0.5 font-medium">
                    <time dateTime={latestSermon.date}>
                      {formatShortDate(latestSermon.date, locale)}
                    </time>
                  </dd>
                </div>
                {formatDuration(latestSermon.durationSeconds, locale) ? (
                  <div>
                    <dt className="text-ink-faint">{dict.home.length}</dt>
                    <dd className="mt-0.5 font-medium">
                      {formatDuration(latestSermon.durationSeconds, locale)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={localePath(locale, `/sermons/${latestSermon.slug}`)}>
                  {dict.home.watchOrListen}
                </ButtonLink>
                <ButtonLink href={localePath(locale, "/sermons")} variant="outline">
                  {dict.home.browseAll}
                </ButtonLink>
              </div>
            </div>

            <div className="lg:pl-4">
              <SermonCard sermon={latestSermon} locale={locale} priority />
            </div>
          </div>
        </Section>
      ) : null}

      {upcoming.length ? (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow={dict.home.whatsOn}
              title={dict.home.upcoming}
              description={dict.home.upcomingIntro}
            />
            <ButtonLink href={localePath(locale, "/events")} variant="outline">
              {dict.home.allEvents}
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} locale={locale} dict={dict} />
            ))}
          </div>
        </Section>
      ) : null}

      {featuredMinistries.length ? (
        <Section tone="surface">
          <SectionHeading
            eyebrow={dict.home.findYourPeople}
            title={dict.home.ministriesTitle}
            description={dict.home.ministriesIntro}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featuredMinistries.map((ministry) => (
              <Card key={ministry.id} className="bg-ground p-6">
                <h3 className="font-display text-xl tracking-tight">
                  <Link
                    href={localePath(locale, `/ministries/${ministry.slug}`)}
                    className="hover:text-brand"
                  >
                    {ministry.title}
                  </Link>
                </h3>
                <p className="mt-2 text-ink-muted">{ministry.summary}</p>
                {ministry.meetingTime ? (
                  <p className="mt-3 text-sm text-ink-faint">{ministry.meetingTime}</p>
                ) : null}
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <ButtonLink href={localePath(locale, "/ministries")} variant="outline">
              {dict.home.everyMinistry}
            </ButtonLink>
          </div>
        </Section>
      ) : null}

      <Section tone="brand">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-contrast/70">
              {dict.nav.give}
            </p>
            <h2 className="mt-4 font-display display-balance text-3xl leading-tight tracking-tight sm:text-4xl">
              {dict.home.givingTitle}
            </h2>
            {settings.giving.blurb ? (
              <p className="mt-4 max-w-xl text-lg text-brand-contrast/80">
                {settings.giving.blurb}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href={localePath(locale, "/give")} variant="accent" size="lg">
              {dict.home.giveNow}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, "/prayer")}
              size="lg"
              className="border border-brand-contrast/30 bg-transparent text-brand-contrast hover:bg-brand-contrast/10"
            >
              {dict.nav.prayer}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
