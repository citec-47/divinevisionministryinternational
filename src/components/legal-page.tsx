import { Eyebrow, Section } from "@/components/ui";
import type { LegalPage } from "@/lib/legal";

/** Shared renderer for the privacy and accessibility pages. */
export function LegalPageBody({ eyebrow, page }: { eyebrow: string; page: LegalPage }) {
  return (
    <Section>
      <div className="mx-auto max-w-2xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-4xl leading-tight tracking-tight">{page.title}</h1>

        {page.notice ? (
          <p className="mt-4 rounded-card border border-accent/40 bg-accent/10 p-4 text-sm">
            {page.notice}
          </p>
        ) : null}

        <div className="mt-8 space-y-8 leading-relaxed text-ink-muted">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl tracking-tight text-ink">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
