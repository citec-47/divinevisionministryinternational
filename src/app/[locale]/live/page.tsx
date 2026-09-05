import type { Metadata } from "next";

import { SermonCard } from "@/components/cards";
import { LivePlayer } from "@/components/live-player";
import { ServiceTimes } from "@/components/service-times";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { getLatestSermon, getSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";
import { toEmbedUrl } from "@/lib/utils";

export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.nav.live,
    description: dict.live.intro,
    alternates: { canonical: `/${locale}/live`, languages: { en: "/en/live", fr: "/fr/live" } },
  };
}

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [settings, latest] = await Promise.all([getSettings(locale), getLatestSermon(locale)]);
  const embedUrl = toEmbedUrl(
    settings.livestream.embedUrl ?? settings.livestream.channelUrl,
  );

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page py-14 sm:py-20">
          <Eyebrow>{dict.nav.live}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.live.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {dict.live.intro}
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <LivePlayer settings={settings} embedUrl={embedUrl} locale={locale} dict={dict} />

          <div>
            <h2 className="font-display text-2xl tracking-tight">{dict.live.whenWeStream}</h2>
            <ServiceTimes
              settings={settings}
              locale={locale}
              dict={dict}
              className="mt-5 sm:grid-cols-1"
            />

            {settings.livestream.channelUrl ? (
              <ButtonLink
                href={settings.livestream.channelUrl}
                variant="outline"
                external
                className="mt-5"
              >
                {dict.live.ourChannel}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Section>

      {latest ? (
        <Section tone="surface">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>{dict.live.missedSunday}</Eyebrow>
              <h2 className="mt-3 font-display text-3xl tracking-tight">
                {dict.live.mostRecent}
              </h2>
            </div>
            <ButtonLink href={localePath(locale, "/sermons")} variant="outline">
              {dict.live.allSermons}
            </ButtonLink>
          </div>

          <div className="mt-8 max-w-md">
            <SermonCard sermon={latest} locale={locale} />
          </div>
        </Section>
      ) : null}

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.live, path: "/live" },
          ],
          locale,
        )}
      />
    </>
  );
}
