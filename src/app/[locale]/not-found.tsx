import { ButtonLink, Card, Section } from "@/components/ui";
import { getDictionary } from "@/lib/dictionaries";
import { DEFAULT_LOCALE, localePath } from "@/lib/i18n";

/**
 * A not-found page cannot read route params, so it renders in the default
 * locale. The header and footer around it stay in the visitor's language.
 */
export default function NotFound() {
  const locale = DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <Section>
      <Card className="mx-auto max-w-xl p-8 text-center sm:p-12">
        <p className="font-display text-6xl tracking-tight text-accent">404</p>
        <h1 className="mt-4 font-display text-3xl tracking-tight">{dict.notFound.title}</h1>
        <p className="mt-3 text-ink-muted">{dict.notFound.body}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={localePath(locale, "/")}>{dict.common.backToHome}</ButtonLink>
          <ButtonLink href={localePath(locale, "/sermons")} variant="outline">
            {dict.notFound.browseSermons}
          </ButtonLink>
          <ButtonLink href={localePath(locale, "/contact")} variant="outline">
            {dict.nav.contact}
          </ButtonLink>
        </div>
      </Card>
    </Section>
  );
}
