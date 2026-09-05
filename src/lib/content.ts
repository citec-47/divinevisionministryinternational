/**
 * The content layer.
 *
 * Every page reads content through this module and nothing else. It does two
 * jobs the pages should never have to think about:
 *
 *   1. Resolves the bilingual database columns down to one language.
 *   2. Survives a database outage. Settings fall back to real church details so
 *      the header, footer, and WhatsApp link keep working; lists fall back to
 *      empty, because showing nothing beats showing stale service times.
 */
import "server-only";

import { cache } from "react";

import { prisma } from "./db";
import { fallbackSettings } from "./fallback";
import { localize, localizeOptional, type Locale } from "./i18n";
import type {
  Belief,
  ChurchEvent,
  ImageRef,
  Ministry,
  Sermon,
  Series,
  ServiceTime,
  SiteSettings,
  Speaker,
  StaffMember,
  VisitFaq,
} from "./types";

/** Runs a query, logging and degrading rather than throwing at a visitor. */
async function safely<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[content] ${label} failed:`, error);
    return fallback;
  }
}

function image(
  url: string | null,
  altEn: string | null,
  altFr: string | null,
  locale: Locale,
): ImageRef | undefined {
  if (!url) return undefined;
  return { url, alt: localize(locale, altEn, altFr) };
}

function iso(date: Date | null): string | undefined {
  return date ? date.toISOString() : undefined;
}

// --- Settings ---------------------------------------------------------------

export const getSettings = cache(async function getSettings(
  locale: Locale,
): Promise<SiteSettings> {
  return safely(
    "getSettings",
    async () => {
      const [row, times] = await Promise.all([
        prisma.siteSetting.findFirst(),
        prisma.serviceTime.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] }),
      ]);

      if (!row) return fallbackSettings(locale);

      const socials = (
        [
          ["YouTube", row.youtubeUrl],
          ["Facebook", row.facebookUrl],
          ["Instagram", row.instagramUrl],
          ["TikTok", row.tiktokUrl],
        ] as const
      )
        .filter(([, url]) => Boolean(url))
        .map(([platform, url]) => ({ platform, url: url as string }));

      const serviceTimes: ServiceTime[] = times.map((time) => ({
        id: time.id,
        label: localize(locale, time.labelEn, time.labelFr),
        dayOfWeek: time.dayOfWeek,
        startTime: time.startTime,
        endTime: time.endTime ?? undefined,
        note: localizeOptional(locale, time.noteEn, time.noteFr),
        location: time.location ?? undefined,
      }));

      return {
        name: row.name,
        shortName: row.shortName,
        tagline: localize(locale, row.taglineEn, row.taglineFr),
        description: localize(locale, row.descriptionEn, row.descriptionFr),
        logo: row.logoUrl ? { url: row.logoUrl, alt: row.name } : undefined,
        address: {
          line: row.addressLine,
          city: row.city,
          region: row.region ?? undefined,
          country: row.country,
          note: localizeOptional(locale, row.addressNoteEn, row.addressNoteFr),
          latitude: row.latitude ?? undefined,
          longitude: row.longitude ?? undefined,
        },
        phone: row.phone ?? undefined,
        whatsapp: row.whatsapp ?? undefined,
        email: row.email ?? undefined,
        timezone: row.timezone,
        serviceTimes,
        socials,
        livestream: {
          embedUrl: row.livestreamEmbedUrl ?? undefined,
          channelUrl: row.livestreamChannelUrl ?? undefined,
          forceLive: row.forceLive,
        },
        giving: {
          blurb: localizeOptional(locale, row.givingBlurbEn, row.givingBlurbFr),
          currency: row.currency,
          momoMtn: row.momoMtn ?? undefined,
          momoOrange: row.momoOrange ?? undefined,
          momoAccountName: row.momoAccountName ?? undefined,
          bankName: row.bankName ?? undefined,
          bankAccountName: row.bankAccountName ?? undefined,
          bankAccountNumber: row.bankAccountNumber ?? undefined,
        },
      };
    },
    fallbackSettings(locale),
  );
});

// --- Teaching ---------------------------------------------------------------

type SpeakerRow = {
  id: string;
  slug: string;
  name: string;
  roleEn: string | null;
  roleFr: string | null;
  bioEn: string | null;
  bioFr: string | null;
  photoUrl: string | null;
};

function toSpeaker(row: SpeakerRow, locale: Locale): Speaker {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: localizeOptional(locale, row.roleEn, row.roleFr),
    bio: localizeOptional(locale, row.bioEn, row.bioFr),
    // A portrait's alt text is the person's name in any language.
    photo: row.photoUrl ? { url: row.photoUrl, alt: row.name } : undefined,
  };
}

const sermonInclude = { speaker: true, series: true } as const;

type SermonRow = Awaited<
  ReturnType<typeof prisma.sermon.findMany<{ include: typeof sermonInclude }>>
>[number];

function toSermon(row: SermonRow, locale: Locale): Sermon {
  return {
    id: row.id,
    title: localize(locale, row.titleEn, row.titleFr),
    slug: row.slug,
    date: row.date.toISOString(),
    summary: localizeOptional(locale, row.summaryEn, row.summaryFr),
    speaker: row.speaker ? toSpeaker(row.speaker, locale) : undefined,
    series: row.series
      ? {
          id: row.series.id,
          title: localize(locale, row.series.titleEn, row.series.titleFr),
          slug: row.series.slug,
        }
      : undefined,
    scriptures: row.scriptures,
    videoUrl: row.videoUrl ?? undefined,
    audioUrl: row.audioUrl ?? undefined,
    durationSeconds: row.durationSeconds ?? undefined,
    audioByteLength: row.audioByteLength ?? undefined,
    // Falls back to the series artwork so a sermon card is never bare.
    image:
      image(row.imageUrl, row.imageAltEn, row.imageAltFr, locale) ??
      (row.series
        ? image(row.series.imageUrl, row.series.imageAltEn, row.series.imageAltFr, locale)
        : undefined),
    transcript: localizeOptional(locale, row.transcriptEn, row.transcriptFr),
  };
}

export async function getSermons(locale: Locale): Promise<Sermon[]> {
  return safely(
    "getSermons",
    async () => {
      const rows = await prisma.sermon.findMany({
        where: { published: true },
        include: sermonInclude,
        orderBy: { date: "desc" },
      });
      return rows.map((row) => toSermon(row, locale));
    },
    [],
  );
}

export async function getLatestSermon(locale: Locale): Promise<Sermon | null> {
  return safely(
    "getLatestSermon",
    async () => {
      const row = await prisma.sermon.findFirst({
        where: { published: true },
        include: sermonInclude,
        orderBy: { date: "desc" },
      });
      return row ? toSermon(row, locale) : null;
    },
    null,
  );
}

export async function getSermonBySlug(slug: string, locale: Locale): Promise<Sermon | null> {
  return safely(
    "getSermonBySlug",
    async () => {
      const row = await prisma.sermon.findFirst({
        where: { slug, published: true },
        include: sermonInclude,
      });
      return row ? toSermon(row, locale) : null;
    },
    null,
  );
}

export async function getSermonSlugs(): Promise<string[]> {
  return safely(
    "getSermonSlugs",
    async () => {
      const rows = await prisma.sermon.findMany({
        where: { published: true },
        select: { slug: true },
      });
      return rows.map((row) => row.slug);
    },
    [],
  );
}

export async function getSeriesList(locale: Locale): Promise<Series[]> {
  return safely(
    "getSeriesList",
    async () => {
      const rows = await prisma.series.findMany({
        orderBy: [{ startDate: "desc" }],
        include: { _count: { select: { sermons: true } } },
      });

      return rows.map((row) => ({
        id: row.id,
        title: localize(locale, row.titleEn, row.titleFr),
        slug: row.slug,
        description: localizeOptional(locale, row.descriptionEn, row.descriptionFr),
        image: image(row.imageUrl, row.imageAltEn, row.imageAltFr, locale),
        startDate: iso(row.startDate),
        endDate: iso(row.endDate),
        sermonCount: row._count.sermons,
      }));
    },
    [],
  );
}

export async function getSeriesBySlug(slug: string, locale: Locale): Promise<Series | null> {
  return safely(
    "getSeriesBySlug",
    async () => {
      const row = await prisma.series.findUnique({
        where: { slug },
        include: { _count: { select: { sermons: true } } },
      });
      if (!row) return null;

      return {
        id: row.id,
        title: localize(locale, row.titleEn, row.titleFr),
        slug: row.slug,
        description: localizeOptional(locale, row.descriptionEn, row.descriptionFr),
        image: image(row.imageUrl, row.imageAltEn, row.imageAltFr, locale),
        startDate: iso(row.startDate),
        endDate: iso(row.endDate),
        sermonCount: row._count.sermons,
      };
    },
    null,
  );
}

export async function getSermonsInSeries(slug: string, locale: Locale): Promise<Sermon[]> {
  return safely(
    "getSermonsInSeries",
    async () => {
      const rows = await prisma.sermon.findMany({
        where: { published: true, series: { slug } },
        include: sermonInclude,
        orderBy: { date: "asc" },
      });
      return rows.map((row) => toSermon(row, locale));
    },
    [],
  );
}

export async function getSeriesSlugs(): Promise<string[]> {
  return safely(
    "getSeriesSlugs",
    async () => {
      const rows = await prisma.series.findMany({ select: { slug: true } });
      return rows.map((row) => row.slug);
    },
    [],
  );
}

// --- Events -----------------------------------------------------------------

type EventRow = Awaited<ReturnType<typeof prisma.event.findMany>>[number];

function toEvent(row: EventRow, locale: Locale): ChurchEvent {
  return {
    id: row.id,
    title: localize(locale, row.titleEn, row.titleFr),
    slug: row.slug,
    start: row.start.toISOString(),
    end: iso(row.end),
    recurrence: localizeOptional(locale, row.recurrenceEn, row.recurrenceFr),
    location: row.location ?? undefined,
    address: row.address ?? undefined,
    summary: localizeOptional(locale, row.summaryEn, row.summaryFr),
    description: localizeOptional(locale, row.descriptionEn, row.descriptionFr),
    image: image(row.imageUrl, row.imageAltEn, row.imageAltFr, locale),
    category: row.category ?? undefined,
    registration: {
      enabled: row.registrationEnabled,
      capacity: row.capacity ?? undefined,
      closesAt: iso(row.registrationClosesAt),
      externalUrl: row.externalUrl ?? undefined,
    },
  };
}

export async function getUpcomingEvents(locale: Locale): Promise<ChurchEvent[]> {
  return safely(
    "getUpcomingEvents",
    async () => {
      const now = new Date();
      const rows = await prisma.event.findMany({
        where: {
          published: true,
          // Recurring events never "finish", so they always stay listed.
          OR: [
            { recurrenceEn: { not: null } },
            { end: { gte: now } },
            { end: null, start: { gte: now } },
          ],
        },
        orderBy: { start: "asc" },
      });
      return rows.map((row) => toEvent(row, locale));
    },
    [],
  );
}

export async function getEventBySlug(slug: string, locale: Locale): Promise<ChurchEvent | null> {
  return safely(
    "getEventBySlug",
    async () => {
      const row = await prisma.event.findFirst({ where: { slug, published: true } });
      return row ? toEvent(row, locale) : null;
    },
    null,
  );
}

export async function getEventSlugs(): Promise<string[]> {
  return safely(
    "getEventSlugs",
    async () => {
      const rows = await prisma.event.findMany({
        where: { published: true },
        select: { slug: true },
      });
      return rows.map((row) => row.slug);
    },
    [],
  );
}

// --- Ministries, people, and the about page ---------------------------------

export async function getMinistries(locale: Locale): Promise<Ministry[]> {
  return safely(
    "getMinistries",
    async () => {
      const rows = await prisma.ministry.findMany({
        orderBy: { sortOrder: "asc" },
        include: { leader: true },
      });

      return rows.map((row) => ({
        id: row.id,
        title: localize(locale, row.titleEn, row.titleFr),
        slug: row.slug,
        summary: localize(locale, row.summaryEn, row.summaryFr),
        description: localizeOptional(locale, row.descriptionEn, row.descriptionFr),
        image: image(row.imageUrl, row.imageAltEn, row.imageAltFr, locale),
        audience: localizeOptional(locale, row.audienceEn, row.audienceFr),
        meetingTime: localizeOptional(locale, row.meetingTimeEn, row.meetingTimeFr),
        leader: row.leader
          ? {
              name: row.leader.name,
              role: localizeOptional(locale, row.leader.roleEn, row.leader.roleFr),
              photo: row.leader.photoUrl
                ? { url: row.leader.photoUrl, alt: row.leader.name }
                : undefined,
            }
          : undefined,
      }));
    },
    [],
  );
}

export async function getMinistryBySlug(slug: string, locale: Locale): Promise<Ministry | null> {
  const all = await getMinistries(locale);
  return all.find((ministry) => ministry.slug === slug) ?? null;
}

export async function getMinistrySlugs(): Promise<string[]> {
  return safely(
    "getMinistrySlugs",
    async () => {
      const rows = await prisma.ministry.findMany({ select: { slug: true } });
      return rows.map((row) => row.slug);
    },
    [],
  );
}

export async function getStaff(locale: Locale): Promise<StaffMember[]> {
  return safely(
    "getStaff",
    async () => {
      const rows = await prisma.staffMember.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        role: localize(locale, row.roleEn, row.roleFr),
        bio: localizeOptional(locale, row.bioEn, row.bioFr),
        photo: row.photoUrl ? { url: row.photoUrl, alt: row.name } : undefined,
        email: row.email ?? undefined,
      }));
    },
    [],
  );
}

export async function getBeliefs(locale: Locale): Promise<Belief[]> {
  return safely(
    "getBeliefs",
    async () => {
      const rows = await prisma.belief.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        title: localize(locale, row.titleEn, row.titleFr),
        body: localize(locale, row.bodyEn, row.bodyFr),
      }));
    },
    [],
  );
}

export async function getVisitFaqs(locale: Locale): Promise<VisitFaq[]> {
  return safely(
    "getVisitFaqs",
    async () => {
      const rows = await prisma.visitFaq.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((row) => ({
        id: row.id,
        question: localize(locale, row.questionEn, row.questionFr),
        answer: localize(locale, row.answerEn, row.answerFr),
      }));
    },
    [],
  );
}
