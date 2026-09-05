import type { Metadata } from "next";

import { NextServiceNotice } from "@/components/live-status";
import { LocationBlock, ServiceTimes } from "@/components/service-times";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/structured-data";
import { ButtonLink, Card, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { getSettings, getVisitFaqs } from "@/lib/content";
import { getDictionary } from "@/lib/dictionaries";
import { localePath, type Locale } from "@/lib/i18n";
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
    title: dict.nav.visit,
    description: dict.visit.intro,
    alternates: { canonical: `/${locale}/visit`, languages: { en: "/en/visit", fr: "/fr/visit" } },
  };
}

export default async function VisitPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [settings, faqs] = await Promise.all([getSettings(locale), getVisitFaqs(locale)]);
  const whatsapp = whatsappUrl(
    settings,
    locale === "fr"
      ? "Bonjour ! J’aimerais visiter Divine Vision. Pouvez-vous m’envoyer l’itinéraire ?"
      : "Hello! I would like to visit Divine Vision. Could you send me directions?",
  );

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page py-14 sm:py-20">
          <Eyebrow>{dict.nav.visit}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            {dict.visit.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {dict.visit.intro}
          </p>

          <NextServiceNotice settings={settings} locale={locale} dict={dict} className="mt-6" />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <ServiceTimes settings={settings} locale={locale} dict={dict} />
            <LocationBlock settings={settings} dict={dict} />
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow={dict.visit.whenYouArrive}
          title={dict.visit.firstTenMinutes}
          description={dict.visit.firstTenIntro}
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {dict.visit.steps.map((item, index) => (
            <li key={item.title}>
              <Card className="h-full p-6">
                <span
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-full bg-brand font-display text-brand-contrast"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 font-display text-lg tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-muted">{item.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {faqs.length ? (
        <Section tone="surface">
          <SectionHeading
            eyebrow={dict.visit.straightAnswers}
            title={dict.visit.questionsAsked}
          />

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-card border border-line bg-ground p-5 open:bg-surface-2"
              >
                <summary className="cursor-pointer list-none font-display text-lg tracking-tight marker:content-none">
                  <span className="flex items-start justify-between gap-4">
                    {faq.question}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-ink-faint transition-transform group-open:rotate-45"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-ink-muted">{faq.answer}</p>
              </details>
            ))}
          </div>

          <JsonLd data={faqSchema(faqs)} />
        </Section>
      ) : null}

      <Section tone="brand">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h2 className="font-display display-balance text-3xl leading-tight tracking-tight sm:text-4xl">
              {dict.visit.stillHaveQuestion}
            </h2>
            <p className="mt-4 max-w-xl text-lg text-brand-contrast/80">
              {dict.visit.stillHaveQuestionBody}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            {whatsapp ? (
              <ButtonLink href={whatsapp} variant="accent" size="lg" external>
                {dict.common.whatsappUs}
              </ButtonLink>
            ) : null}
            <ButtonLink
              href={localePath(locale, "/contact")}
              size="lg"
              className="border border-brand-contrast/30 bg-transparent text-brand-contrast hover:bg-brand-contrast/10"
            >
              {dict.visit.getInTouch}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.visit, path: "/visit" },
          ],
          locale,
        )}
      />
    </>
  );
}
