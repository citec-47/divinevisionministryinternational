"use client";

import { useMemo, useState } from "react";

import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { Sermon, Series } from "@/lib/types";
import { SermonCard } from "./cards";
import { EmptyState } from "./ui";

const PAGE_SIZE = 12;

/**
 * Filtering happens in the browser over the full library. That is the right
 * trade-off up to a few hundred sermons: instant results, no round-trip, and
 * the page still renders every sermon server-side for crawlers.
 */
export function SermonBrowser({
  sermons,
  series,
  locale,
  dict,
}: {
  sermons: Sermon[];
  series: Series[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const [seriesSlug, setSeriesSlug] = useState("all");
  const [speaker, setSpeaker] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const speakers = useMemo(() => {
    const names = new Set<string>();
    for (const sermon of sermons) if (sermon.speaker?.name) names.add(sermon.speaker.name);
    return [...names].sort();
  }, [sermons]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return sermons.filter((sermon) => {
      if (seriesSlug !== "all" && sermon.series?.slug !== seriesSlug) return false;
      if (speaker !== "all" && sermon.speaker?.name !== speaker) return false;
      if (!needle) return true;

      // Transcripts are searched too, so a half-remembered phrase finds it.
      return [
        sermon.title,
        sermon.summary,
        sermon.speaker?.name,
        sermon.series?.title,
        sermon.scriptures.join(" "),
        sermon.transcript,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [sermons, query, seriesSlug, speaker]);

  const shown = filtered.slice(0, visible);
  const selectClass = "h-11 rounded-full border border-line bg-surface px-4 text-sm text-ink";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="sermon-search" className="sr-only">
            {dict.sermons.search}
          </label>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="sermon-search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder={dict.sermons.searchPlaceholder}
            className="h-11 w-full rounded-full border border-line bg-surface pl-11 pr-4 text-sm placeholder:text-ink-faint"
          />
        </div>

        {series.length ? (
          <div>
            <label htmlFor="sermon-series" className="sr-only">
              {dict.sermons.filterSeries}
            </label>
            <select
              id="sermon-series"
              value={seriesSlug}
              onChange={(event) => {
                setSeriesSlug(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              className={selectClass}
            >
              <option value="all">{dict.sermons.allSeries}</option>
              {series.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {speakers.length > 1 ? (
          <div>
            <label htmlFor="sermon-speaker" className="sr-only">
              {dict.sermons.filterSpeaker}
            </label>
            <select
              id="sermon-speaker"
              value={speaker}
              onChange={(event) => {
                setSpeaker(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              className={selectClass}
            >
              <option value="all">{dict.sermons.allSpeakers}</option>
              {speakers.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="mt-4 text-sm text-ink-faint">
        {filtered.length}{" "}
        {filtered.length === 1 ? dict.sermons.message : dict.sermons.messages}
      </p>

      {shown.length ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((sermon, index) => (
            <SermonCard
              key={sermon.id}
              sermon={sermon}
              locale={locale}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState title={dict.sermons.noMatch} description={dict.sermons.noMatchBody} />
        </div>
      )}

      {visible < filtered.length ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex h-11 items-center rounded-full border border-line px-6 text-sm font-medium transition-colors hover:bg-surface-2"
          >
            {dict.sermons.loadMore}
          </button>
        </div>
      ) : null}
    </div>
  );
}
