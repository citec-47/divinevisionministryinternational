import type { Metadata } from "next";
import Image from "next/image";

import { ContentImage } from "@/components/cards";
import { JsonLd, breadcrumbSchema } from "@/components/structured-data";
import { ButtonLink, Card, Eyebrow, Section, SectionHeading } from "@/components/ui";
import { getBeliefs, getSettings, getStaff } from "@/lib/content";
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
  const settings = await getSettings(locale);

  return {
    title: dict.nav.about,
    description: settings.description,
    alternates: { canonical: `/${locale}/about`, languages: { en: "/en/about", fr: "/fr/about" } },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);

  const [settings, beliefs, staff] = await Promise.all([
    getSettings(locale),
    getBeliefs(locale),
    getStaff(locale),
  ]);

  return (
    <>
      <section className="border-b border-line bg-linear-to-b from-surface-2 to-ground">
        <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <Eyebrow>{dict.nav.about}</Eyebrow>
            <h1 className="mt-4 max-w-2xl font-display display-balance text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              {dict.about.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {settings.description}
            </p>
          </div>

          <div className="relative aspect-[4/5] w-full max-w-sm justify-self-center overflow-hidden rounded-card border border-line bg-surface-2 lg:justify-self-end">
            <Image
              src="/images/pastor-walking.jpeg"
              alt="Prophet Emmanuel Ayuh walking on a street in Yaoundé."
              fill
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading eyebrow={dict.about.ourMission} title={dict.about.whyWeExist} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink-muted">
              <p>{settings.description}</p>
              <p>
                {locale === "fr"
                  ? "Notre vie commune tient en trois choses : le culte du dimanche, des groupes où l’on connaît les gens par leur nom, et un service concret dans notre ville — vivres, vêtements et présence auprès de ceux qui en ont besoin."
                  : "Our life together holds three things: Sunday worship, groups small enough to know people by name, and practical service in our city — food, clothing, and presence for those who need it."}
              </p>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow={dict.about.ourValues} title={dict.about.howWeLiveIt} />
            <ul className="mt-6 space-y-4">
              {dict.about.values.map(([title, body]) => (
                <li key={title} className="border-l-2 border-accent pl-5">
                  <p className="font-display text-lg tracking-tight">{title}</p>
                  <p className="mt-1 text-ink-muted">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {beliefs.length ? (
        <Section tone="surface">
          <SectionHeading
            eyebrow={dict.about.whatWeBelieve}
            title={dict.about.statementOfFaith}
            description={dict.about.statementIntro}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {beliefs.map((belief) => (
              <Card key={belief.id} className="bg-ground p-6">
                <h3 className="font-display text-lg tracking-tight">{belief.title}</h3>
                <p className="mt-2 text-ink-muted">{belief.body}</p>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      {staff.length ? (
        <Section>
          <SectionHeading
            eyebrow={dict.about.ourTeam}
            title={dict.about.peopleWhoServe}
            description={dict.about.leadershipIntro}
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <Card key={member.id} className="overflow-hidden">
                <div className="relative aspect-[4/3] bg-surface-2">
                  <ContentImage
                    image={member.photo}
                    label={member.name}
                    sizes="(min-width: 1024px) 340px, 100vw"
                    className="object-top"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg tracking-tight">{member.name}</h3>
                  <p className="mt-0.5 text-sm text-accent">{member.role}</p>
                  {member.bio ? (
                    <p className="mt-2 text-sm text-ink-muted">{member.bio}</p>
                  ) : null}
                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="mt-3 inline-block text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
                    >
                      {member.email}
                    </a>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}

      <Section tone="brand">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <h2 className="font-display display-balance text-3xl leading-tight tracking-tight sm:text-4xl">
            {dict.about.comeAndSee}
          </h2>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href={localePath(locale, "/visit")} variant="accent" size="lg">
              {dict.home.planVisit}
            </ButtonLink>
            <ButtonLink
              href={localePath(locale, "/contact")}
              size="lg"
              className="border border-brand-contrast/30 bg-transparent text-brand-contrast hover:bg-brand-contrast/10"
            >
              {dict.nav.contact}
            </ButtonLink>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema(
          [
            { name: dict.nav.home, path: "/" },
            { name: dict.nav.about, path: "/about" },
          ],
          locale,
        )}
      />
    </>
  );
}
