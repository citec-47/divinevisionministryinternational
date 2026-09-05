import type { Metadata } from "next";

import { PrayerRequestForm } from "@/components/forms";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { Card, Eyebrow, Section } from "@/components/ui";
import { getSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { formatWhatsappNumber, whatsappUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.nav.prayer,
    description: dict.prayer.intro,
    alternates: { canonical: `/${locale}/prayer`, languages: { en: "/en/prayer", fr: "/fr/prayer" } },
  };
}

export default async function PrayerPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const settings = await getSettings(locale);
  const whatsapp = whatsappUrl(settings);

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page py-14 sm:py-20">
          <Eyebrow>{dict.nav.prayer}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.prayer.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {dict.prayer.intro}
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <PrayerRequestForm locale={locale} dict={dict} />

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-display text-xl tracking-tight">{dict.prayer.whoReads}</h2>
              <p className="mt-2 text-sm text-ink-muted">{dict.prayer.whoReadsBody}</p>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-xl tracking-tight">{dict.prayer.ifUrgent}</h2>
              <p className="mt-2 text-sm text-ink-muted">{dict.prayer.ifUrgentBody}</p>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-soft"
                >
                  {dict.common.whatsappUs} · {formatWhatsappNumber(settings.whatsapp)}
                </a>
              ) : null}
              <p className="mt-3 text-sm text-ink-faint">{dict.prayer.ifCrisis}</p>
            </Card>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.prayer, path: "/prayer" },
          ],
          locale,
        )}
      />
    </>
  );
}
