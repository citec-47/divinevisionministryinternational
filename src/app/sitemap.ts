import type { MetadataRoute } from "next";

import { getEventSlugs, getMinistrySlugs, getSeriesSlugs, getSermonSlugs } from "@/lib/content";
import { LOCALES } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

type Freq = "daily" | "weekly" | "monthly" | "yearly";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: Freq }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/visit", priority: 0.9, changeFrequency: "monthly" },
  { path: "/sermons", priority: 0.9, changeFrequency: "weekly" },
  { path: "/events", priority: 0.8, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/ministries", priority: 0.7, changeFrequency: "monthly" },
  { path: "/give", priority: 0.7, changeFrequency: "yearly" },
  { path: "/live", priority: 0.6, changeFrequency: "weekly" },
  { path: "/prayer", priority: 0.6, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/accessibility", priority: 0.2, changeFrequency: "yearly" },
];

/**
 * Every URL is listed once per language, and each entry declares the other
 * language as an alternate — that is what stops search engines treating the
 * English and French versions as duplicate content.
 */
function alternates(path: string) {
  return {
    languages: Object.fromEntries(
      LOCALES.map((locale) => [locale, absoluteUrl(`/${locale}${path}`)]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sermons, series, events, ministries] = await Promise.all([
    getSermonSlugs(),
    getSeriesSlugs(),
    getEventSlugs(),
    getMinistrySlugs(),
  ]);

  const lastModified = new Date();

  const dynamicRoutes: { path: string; priority: number; changeFrequency: Freq }[] = [
    ...sermons.map((slug) => ({
      path: `/sermons/${slug}`,
      priority: 0.6,
      changeFrequency: "yearly" as const,
    })),
    ...series.map((slug) => ({
      path: `/series/${slug}`,
      priority: 0.5,
      changeFrequency: "monthly" as const,
    })),
    ...events.map((slug) => ({
      path: `/events/${slug}`,
      priority: 0.5,
      changeFrequency: "weekly" as const,
    })),
    ...ministries.map((slug) => ({
      path: `/ministries/${slug}`,
      priority: 0.5,
      changeFrequency: "monthly" as const,
    })),
  ];

  return [...STATIC_ROUTES, ...dynamicRoutes].flatMap((route) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(`/${locale}${route.path}`),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: alternates(route.path),
    })),
  );
}
