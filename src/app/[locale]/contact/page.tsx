import type { Metadata } from "next";

import { ContactForm } from "@/components/forms";
import { LocationBlock, ServiceTimes } from "@/components/service-times";
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
    title: dict.nav.contact,
    description: dict.contact.intro,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: "/en/contact", fr: "/fr/contact" },
    },
  };
}

export default async function ContactPage({
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
          <Eyebrow>{dict.nav.contact}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.contact.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {dict.contact.intro}
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <ContactForm locale={locale} dict={dict} />

          <div className="space-y-4">
            <Card className="p-6">
              <h2 className="font-display text-xl tracking-tight">{dict.contact.reachUs}</h2>

              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-ground p-4 transition-colors hover:bg-surface-2"
                >
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-accent">
                      {dict.contact.fastestReply}
                    </span>
                    <span className="mt-0.5 block font-display text-lg tracking-tight">
                      {dict.contact.whatsapp}
                    </span>
                    <span className="block text-sm text-ink-muted">
                      {formatWhatsappNumber(settings.whatsapp)}
                    </span>
                  </span>
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 text-ink-faint"
                  >
                    <path d="M7 17 17 7M9 7h8v8" />
                  </svg>
                </a>
              ) : null}

              <dl className="mt-4 space-y-4 text-sm">
                {settings.phone ? (
                  <div>
                    <dt className="text-ink-faint">{dict.contact.phone}</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`tel:${settings.phone.replace(/\s/g, "")}`}
                        className="text-base underline underline-offset-4 hover:no-underline"
                      >
                        {settings.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}
                {settings.email ? (
                  <div>
                    <dt className="text-ink-faint">{dict.contact.email}</dt>
                    <dd className="mt-0.5">
                      <a
                        href={`mailto:${settings.email}`}
                        className="text-base underline underline-offset-4 hover:no-underline"
                      >
                        {settings.email}
                      </a>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-ink-faint">{dict.contact.officeHours}</dt>
                  <dd className="mt-0.5 text-base">{dict.contact.officeHoursValue}</dd>
                </div>
              </dl>
            </Card>

            <LocationBlock settings={settings} dict={dict} />
          </div>
        </div>
      </Section>

      {settings.serviceTimes.length ? (
        <Section tone="surface">
          <h2 className="font-display text-3xl tracking-tight">{dict.contact.whenWeGather}</h2>
          <ServiceTimes
            settings={settings}
            locale={locale}
            dict={dict}
            className="mt-8 lg:grid-cols-3"
          />
        </Section>
      ) : null}

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.contact, path: "/contact" },
          ],
          locale,
        )}
      />
    </>
  );
}
