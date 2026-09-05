import type { Metadata } from "next";

import { MinistryCard } from "@/components/cards";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { ButtonLink, EmptyState, Eyebrow, Section } from "@/components/ui";
import { getMinistries } from "@/lib/content";
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
    title: dict.nav.ministries,
    description: dict.ministries.intro,
    alternates: {
      canonical: `/${locale}/ministries`,
      languages: { en: "/en/ministries", fr: "/fr/ministries" },
    },
  };
}

export default async function MinistriesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const ministries = await getMinistries(locale);

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page py-14 sm:py-20">
          <Eyebrow>{dict.nav.ministries}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.ministries.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {dict.ministries.intro}
          </p>
        </div>
      </section>

      <Section>
        {ministries.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ministries.map((ministry) => (
              <MinistryCard key={ministry.id} ministry={ministry} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={dict.ministries.beingAdded}
            description={dict.ministries.beingAddedBody}
          />
        )}
      </Section>

      <Section tone="brand">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h2 className="font-display display-balance text-3xl leading-tight tracking-tight sm:text-4xl">
              {dict.ministries.notSure}
            </h2>
            <p className="mt-4 max-w-xl text-lg text-brand-contrast/80">
              {dict.ministries.notSureBody}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href={localePath(locale, "/contact")} variant="accent" size="lg">
              {dict.ministries.talkToSomeone}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.ministries, path: "/ministries" },
          ],
          locale,
        )}
      />
    </>
  );
}
