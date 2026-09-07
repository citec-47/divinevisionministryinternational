import type { Metadata } from "next";

import { DirectGivingDetails, GivingForm } from "@/components/giving";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { Card, Eyebrow, Section } from "@/components/ui";
import { getSettings } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { isFlutterwaveConfigured } from "@/lib/flutterwave";
import type { Locale } from "@/lib/i18n";
import { whatsappUrl } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: dict.nav.give,
    description: dict.give.title,
    alternates: { canonical: `/${locale}/give`, languages: { en: "/en/give", fr: "/fr/give" } },
  };
}

export default async function GivePage({
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
          <Eyebrow>{dict.nav.give}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.give.title}
          </h1>
          {settings.giving.blurb ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {settings.giving.blurb}
            </p>
          ) : null}
          <p className="mt-4 max-w-2xl text-ink-faint">{dict.give.noObligation}</p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <GivingForm
            settings={settings}
            locale={locale}
            dict={dict}
            configured={isFlutterwaveConfigured()}
          />

          <div className="space-y-4">
            <DirectGivingDetails settings={settings} locale={locale} dict={dict} />

            <Card className="p-6">
              <h2 className="font-display text-xl tracking-tight">{dict.give.otherWaysTitle}</h2>
              <dl className="mt-4 space-y-4">
                {dict.give.otherWays.map((item) => (
                  <div key={item.title}>
                    <dt className="font-medium">{item.title}</dt>
                    <dd className="mt-1 text-sm text-ink-muted">{item.body}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-xl tracking-tight">{dict.give.questionsTitle}</h2>
              <p className="mt-2 text-sm text-ink-muted">
                {dict.give.questionsBody}
                {whatsapp ? (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4 hover:no-underline"
                    >
                      WhatsApp
                    </a>
                  </>
                ) : null}
                .
              </p>
            </Card>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.give, path: "/give" },
          ],
          locale,
        )}
      />
    </>
  );
}
