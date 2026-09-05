import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentImage, SermonCard } from "@/components/cards";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { EmptyState, Eyebrow, Section } from "@/components/ui";
import { getSeriesBySlug, getSeriesSlugs, getSermonsInSeries } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, localePath, type Locale } from "@/lib/i18n";
import { formatShortDate } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getSeriesSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const series = await getSeriesBySlug(slug, locale);
  if (!series) return { title: "Not found" };

  return {
    title: series.title,
    description: series.description,
    alternates: {
      canonical: `/${locale}/series/${series.slug}`,
      languages: { en: `/en/series/${series.slug}`, fr: `/fr/series/${series.slug}` },
    },
    openGraph: {
      title: series.title,
      description: series.description,
      ...(series.image?.url ? { images: [{ url: series.image.url }] } : {}),
    },
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);

  const [series, sermons] = await Promise.all([
    getSeriesBySlug(slug, locale),
    getSermonsInSeries(slug, locale),
  ]);

  if (!series) notFound();

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
              <Link href={localePath(locale, "/sermons")} className="hover:text-ink">
                {dict.nav.sermons}
              </Link>
            </nav>

            <Eyebrow className="mt-4">{dict.sermons.sermonSeries}</Eyebrow>
            <h1 className="mt-3 font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              {series.title}
            </h1>

            {series.description ? (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
                {series.description}
              </p>
            ) : null}

            <p className="mt-5 text-sm text-ink-faint">
              {sermons.length}{" "}
              {sermons.length === 1 ? dict.sermons.message : dict.sermons.messages}
              {series.startDate
                ? ` · ${dict.sermons.beganOn} ${formatShortDate(series.startDate, locale)}`
                : null}
            </p>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-surface-2">
            <ContentImage
              image={series.image}
              label={series.title}
              sizes="(min-width: 1024px) 520px, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      <Section>
        {sermons.length ? (
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon, index) => (
              <li key={sermon.id}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
                  {dict.sermons.part} {index + 1}
                </p>
                <SermonCard sermon={sermon} locale={locale} priority={index < 3} />
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title={dict.sermons.noneInSeries}
            description={dict.sermons.noneInSeriesBody}
          />
        )}
      </Section>

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.sermons, path: "/sermons" },
            { name: series.title, path: `/series/${series.slug}` },
          ],
          locale,
        )}
      />
    </>
  );
}
