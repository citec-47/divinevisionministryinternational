import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentImage, MinistryCard } from "@/components/cards";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { ButtonLink, Card, Eyebrow, Pill, Section } from "@/components/ui";
import { getMinistries, getMinistryBySlug, getMinistrySlugs } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { LOCALES, localePath, type Locale } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getMinistrySlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const ministry = await getMinistryBySlug(slug, locale);
  if (!ministry) return { title: "Not found" };

  return {
    title: ministry.title,
    description: ministry.summary,
    alternates: {
      canonical: `/${locale}/ministries/${ministry.slug}`,
      languages: {
        en: `/en/ministries/${ministry.slug}`,
        fr: `/fr/ministries/${ministry.slug}`,
      },
    },
    openGraph: {
      title: ministry.title,
      description: ministry.summary,
      ...(ministry.image?.url ? { images: [{ url: ministry.image.url }] } : {}),
    },
  };
}

export default async function MinistryPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dict = getDictionary(locale);

  const [ministry, all] = await Promise.all([
    getMinistryBySlug(slug, locale),
    getMinistries(locale),
  ]);

  if (!ministry) notFound();

  const others = all.filter((item) => item.id !== ministry.id).slice(0, 3);

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
              <Link href={localePath(locale, "/ministries")} className="hover:text-ink">
                {dict.nav.ministries}
              </Link>
            </nav>

            <Eyebrow className="mt-4">{dict.ministries.ministry}</Eyebrow>
            <h1 className="mt-3 font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              {ministry.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {ministry.summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {ministry.audience ? <Pill>{ministry.audience}</Pill> : null}
              {ministry.meetingTime ? <Pill>{ministry.meetingTime}</Pill> : null}
            </div>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-surface-2">
            <ContentImage
              image={ministry.image}
              label={ministry.title}
              sizes="(min-width: 1024px) 520px, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      <Section className="py-12 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div>
            {ministry.description ? (
              <div className="space-y-4 text-lg leading-relaxed text-ink-muted">
                {ministry.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-lg leading-relaxed text-ink-muted">
                {dict.ministries.comeAndSee}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={localePath(locale, "/contact")}>
                {dict.ministries.askAbout} {ministry.title}
              </ButtonLink>
              <ButtonLink href={localePath(locale, "/events")} variant="outline">
                {dict.ministries.seeWhatsOn}
              </ButtonLink>
            </div>
          </div>

          <aside className="space-y-4">
            {ministry.leader ? (
              <Card className="p-5">
                <Eyebrow>{dict.ministries.whoLeads}</Eyebrow>
                <p className="mt-2 font-display text-xl tracking-tight">
                  {ministry.leader.name}
                </p>
                {ministry.leader.role ? (
                  <p className="text-sm text-accent">{ministry.leader.role}</p>
                ) : null}
              </Card>
            ) : null}

            <Card className="p-5">
              <Eyebrow>{dict.ministries.whenItMeets}</Eyebrow>
              <p className="mt-2 text-ink-muted">
                {ministry.meetingTime ?? dict.ministries.getInTouchForDate}
              </p>
            </Card>
          </aside>
        </div>
      </Section>

      {others.length ? (
        <Section tone="surface">
          <h2 className="font-display text-3xl tracking-tight">
            {dict.ministries.otherMinistries}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((item) => (
              <MinistryCard key={item.id} ministry={item} locale={locale} />
            ))}
          </div>
        </Section>
      ) : null}

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.ministries, path: "/ministries" },
            { name: ministry.title, path: `/ministries/${ministry.slug}` },
          ],
          locale,
        )}
      />
    </>
  );
}
