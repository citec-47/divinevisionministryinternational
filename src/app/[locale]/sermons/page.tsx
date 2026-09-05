import type { Metadata } from "next";

import { SeriesCard } from "@/components/cards";
import { SermonBrowser } from "@/components/sermon-browser";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { ButtonLink, EmptyState, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { getSeriesList, getSermons } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.nav.sermons,
    description: dict.sermons.intro,
    alternates: {
      canonical: `/${locale}/sermons`,
      languages: { en: "/en/sermons", fr: "/fr/sermons" },
    },
  };
}

export default async function SermonsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [sermons, series] = await Promise.all([getSermons(locale), getSeriesList(locale)]);

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page py-14 sm:py-20">
          <Eyebrow>{dict.nav.sermons}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.sermons.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {dict.sermons.intro}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/api/podcast.xml" variant="outline" external>
              {dict.sermons.subscribe}
            </ButtonLink>
            <ButtonLink href={localePath(locale, "/live")} variant="outline">
              {dict.nav.live}
            </ButtonLink>
          </div>
        </div>
      </section>

      <Section>
        {sermons.length ? (
          <SermonBrowser sermons={sermons} series={series} locale={locale} dict={dict} />
        ) : (
          <EmptyState
            title={dict.sermons.noneInSeries}
            description={dict.sermons.noneInSeriesBody}
          />
        )}
      </Section>

      {series.length ? (
        <Section tone="surface">
          <SectionHeading
            eyebrow={dict.sermons.sermonSeries}
            title={dict.sermons.seriesTitle}
            description={dict.sermons.seriesIntro}
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {series.map((item) => (
              <SeriesCard key={item.id} series={item} locale={locale} dict={dict} />
            ))}
          </div>
        </Section>
      ) : null}

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.sermons, path: "/sermons" },
          ],
          locale,
        )}
      />
    </>
  );
}
