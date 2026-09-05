"use client";

import { useMemo, useState } from "react";

import type { Dictionary } from "@/lib/dictionaries";
import { INTL_LOCALE, type Locale } from "@/lib/i18n";
import type { ChurchEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EventCard } from "./cards";
import { EmptyState } from "./ui";

/** Groups events under a "September 2026" style heading, in date order. */
function groupByMonth(events: ChurchEvent[], locale: Locale) {
  const groups = new Map<string, { label: string; items: ChurchEvent[] }>();

  for (const event of events) {
    const date = new Date(event.start);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
      month: "long",
      year: "numeric",
    }).format(date);

    const group = groups.get(key) ?? { label, items: [] };
    group.items.push(event);
    groups.set(key, group);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, g]) => g);
}

export function EventBrowser({
  events,
  locale,
  dict,
}: {
  events: ChurchEvent[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [category, setCategory] = useState("all");

  const categories = useMemo(() => {
    const found = new Set<string>();
    for (const event of events) if (event.category) found.add(event.category);
    return [...found].sort();
  }, [events]);

  const filtered = useMemo(
    () => (category === "all" ? events : events.filter((e) => e.category === category)),
    [events, category],
  );

  const groups = useMemo(() => groupByMonth(filtered, locale), [filtered, locale]);

  if (!events.length) {
    return (
      <EmptyState title={dict.events.nothingYet} description={dict.events.nothingYetBody} />
    );
  }

  return (
    <div>
      {categories.length > 1 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label={dict.nav.events}>
          {["all", ...categories].map((value) => {
            const active = category === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                aria-pressed={active}
                className={cn(
                  "h-9 rounded-full border px-4 text-sm transition-colors",
                  active
                    ? "border-brand bg-brand text-brand-contrast"
                    : "border-line text-ink-muted hover:bg-surface-2",
                )}
              >
                {value === "all" ? dict.events.everything : value}
              </button>
            );
          })}
        </div>
      ) : null}

      {groups.length ? (
        <div className="mt-8 space-y-12">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="font-display text-2xl tracking-tight capitalize">{group.label}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {group.items.map((event) => (
                  <EventCard key={event.id} event={event} locale={locale} dict={dict} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title={dict.events.nothingInCategory}
            description={dict.events.nothingInCategoryBody}
          />
        </div>
      )}
    </div>
  );
}
