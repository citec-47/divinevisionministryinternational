import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SermonCard } from "@/components/cards";
import { JsonLd, breadcrumbSchema, sermonSchema } from "@/components/structured-data";
import { ButtonLink, Card, Eyebrow, Pill, Section } from "@/components/ui";
import { getSermonBySlug, getSermonSlugs, getSermons, getSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, localePath, type Locale } from "@/lib/i18n";
import { formatDate, formatDuration, toEmbedUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getSermonSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const sermon = await getSermonBySlug(slug, locale);
  if (!sermon) return { title: "Not found" };

  const description =
    sermon.summary ??
    `A message${sermon.speaker ? ` from ${sermon.speaker.name}` : ""}${
      sermon.scriptures.length ? ` on ${sermon.scriptures.join(", ")}` : ""
    }.`;

  return {
    title: sermon.title,
    description,
    alternates: {
      canonical: `/${locale}/sermons/${sermon.slug}`,
      languages: {
        en: `/en/sermons/${sermon.slug}`,
        fr: `/fr/sermons/${sermon.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: sermon.title,
      description,
      publishedTime: sermon.date,
      ...(sermon.image?.url ? { images: [{ url: sermon.image.url }] } : {}),
    },
  };
}

export default async function SermonPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);

  const [sermon, settings, all] = await Promise.all([
    getSermonBySlug(slug, locale),
    getSettings(locale),
    getSermons(locale),
  ]);

  if (!sermon) notFound();

  const embedUrl = toEmbedUrl(sermon.videoUrl);
  const duration = formatDuration(sermon.durationSeconds, locale);

  // Prefer other messages in the same series; fall back to the most recent.
  const related = all
    .filter((item) => item.id !== sermon.id)
    .sort((a, b) => {
      const aMatch = a.series?.slug === sermon.series?.slug ? 0 : 1;
      const bMatch = b.series?.slug === sermon.series?.slug ? 0 : 1;
      return aMatch - bMatch || b.date.localeCompare(a.date);
    })
    .slice(0, 3);

  return (
    <>
      <article>
        <div className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
          <div className="container-page py-12 sm:py-16">
            <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
              <Link href={localePath(locale, "/sermons")} className="hover:text-ink">
                {dict.nav.sermons}
              </Link>
              {sermon.series ? (
                <>
                  <span aria-hidden="true" className="px-2">
                    /
                  </span>
                  <Link
                    href={localePath(locale, `/series/${sermon.series.slug}`)}
                    className="hover:text-ink"
                  >
                    {sermon.series.title}
                  </Link>
                </>
              ) : null}
            </nav>

            <h1 className="mt-4 max-w-4xl font-display display-balance text-3xl leading-[1.12] tracking-tight sm:text-5xl">
              {sermon.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
              {sermon.speaker ? <span>{sermon.speaker.name}</span> : null}
              <time dateTime={sermon.date}>{formatDate(sermon.date, locale)}</time>
              {duration ? <span>{duration}</span> : null}
            </div>

            {sermon.scriptures.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {sermon.scriptures.map((ref) => (
                  <Pill key={ref}>{ref}</Pill>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <Section className="py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr] lg:gap-14">
            <div className="min-w-0">
              {embedUrl ? (
                <div className="aspect-video overflow-hidden rounded-card border border-line bg-black">
                  <iframe
                    src={embedUrl}
                    title={sermon.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    className="size-full"
                  />
                </div>
              ) : null}

              {sermon.audioUrl ? (
                <div className={embedUrl ? "mt-6" : ""}>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
                    {dict.sermons.listen}
                  </h2>
                  {/* The transcript below serves as this audio's caption. */}
                  <audio controls preload="none" src={sermon.audioUrl} className="mt-3 w-full" />
                </div>
              ) : null}

              {!embedUrl && !sermon.audioUrl ? (
                <Card className="p-8">
                  <p className="font-display text-lg">{dict.sermons.mediaComingSoon}</p>
                  <p className="mt-2 text-ink-muted">{dict.sermons.mediaComingBody}</p>
                </Card>
              ) : null}

              {sermon.summary ? (
                <p className="mt-8 text-lg leading-relaxed text-ink-muted">{sermon.summary}</p>
              ) : null}

              {sermon.transcript ? (
                <details className="mt-8 rounded-card border border-line bg-surface p-6">
                  <summary className="cursor-pointer font-display text-xl tracking-tight">
                    {dict.sermons.readTranscript}
                  </summary>
                  <div className="mt-4 space-y-4 leading-relaxed text-ink-muted">
                    {sermon.transcript.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>

            <aside className="space-y-4">
              {sermon.series ? (
                <Card className="p-5">
                  <Eyebrow>{dict.sermons.partOfSeries}</Eyebrow>
                  <p className="mt-2 font-display text-xl tracking-tight">
                    {sermon.series.title}
                  </p>
                  <ButtonLink
                    href={localePath(locale, `/series/${sermon.series.slug}`)}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    {dict.sermons.wholeSeries}
                  </ButtonLink>
                </Card>
              ) : null}

              {sermon.speaker?.bio ? (
                <Card className="p-5">
                  <Eyebrow>{dict.home.speaker}</Eyebrow>
                  <p className="mt-2 font-display text-xl tracking-tight">
                    {sermon.speaker.name}
                  </p>
                  {sermon.speaker.role ? (
                    <p className="text-sm text-accent">{sermon.speaker.role}</p>
                  ) : null}
                  <p className="mt-3 text-sm text-ink-muted">{sermon.speaker.bio}</p>
                </Card>
              ) : null}

              <Card className="p-5">
                <Eyebrow>{dict.sermons.neverMiss}</Eyebrow>
                <p className="mt-2 text-sm text-ink-muted">{settings.description}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <ButtonLink href="/api/podcast.xml" variant="outline" size="sm" external>
                    {dict.sermons.podcastFeed}
                  </ButtonLink>
                  <ButtonLink href={localePath(locale, "/visit")} size="sm">
                    {dict.home.planVisit}
                  </ButtonLink>
                </div>
              </Card>
            </aside>
          </div>
        </Section>
      </article>

      {related.length ? (
        <Section tone="surface">
          <h2 className="font-display text-3xl tracking-tight">{dict.sermons.keepListening}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <SermonCard key={item.id} sermon={item} locale={locale} />
            ))}
          </div>
        </Section>
      ) : null}

      <JsonLd data={sermonSchema(sermon, settings, locale)} />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.sermons, path: "/sermons" },
            { name: sermon.title, path: `/sermons/${sermon.slug}` },
          ],
          locale,
        )}
      />
    </>
  );
}
