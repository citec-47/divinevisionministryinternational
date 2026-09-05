/**
 * The localized view of the content.
 *
 * Database rows carry both languages (`titleEn` / `titleFr`); these types carry
 * one. `src/lib/content.ts` does the resolving, so no page or component ever
 * has to know a second language exists.
 */

export type ImageRef = {
  url: string;
  /** Empty string means decorative; every content image should have real text. */
  alt: string;
};

export type ServiceTime = {
  id: string;
  label: string;
  /** 0 = Sunday, matching `Date.prototype.getDay()`. */
  dayOfWeek: number;
  /** 24h "HH:MM" in the church's timezone. */
  startTime: string;
  endTime?: string;
  note?: string;
  location?: string;
};

export type GivingDetails = {
  blurb?: string;
  currency: string;
  momoMtn?: string;
  momoOrange?: string;
  momoAccountName?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
};

export type SiteSettings = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  logo?: ImageRef;
  address: {
    line: string;
    city: string;
    region?: string;
    country: string;
    note?: string;
    latitude?: number;
    longitude?: number;
  };
  phone?: string;
  /** Digits only, no "+", for building wa.me links. */
  whatsapp?: string;
  email?: string;
  timezone: string;
  serviceTimes: ServiceTime[];
  socials: { platform: string; url: string }[];
  livestream: {
    embedUrl?: string;
    channelUrl?: string;
    forceLive: boolean;
  };
  giving: GivingDetails;
};

export type Speaker = {
  id: string;
  name: string;
  slug: string;
  role?: string;
  bio?: string;
  photo?: ImageRef;
};

export type Series = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image?: ImageRef;
  startDate?: string;
  endDate?: string;
  sermonCount?: number;
};

export type Sermon = {
  id: string;
  title: string;
  slug: string;
  /** ISO date. */
  date: string;
  summary?: string;
  speaker?: Speaker;
  series?: Pick<Series, "id" | "title" | "slug">;
  scriptures: string[];
  videoUrl?: string;
  audioUrl?: string;
  durationSeconds?: number;
  audioByteLength?: number;
  image?: ImageRef;
  transcript?: string;
};

export type ChurchEvent = {
  id: string;
  title: string;
  slug: string;
  /** ISO datetime. */
  start: string;
  end?: string;
  /** Human-readable recurrence, e.g. "Every Wednesday". Empty for one-offs. */
  recurrence?: string;
  location?: string;
  address?: string;
  summary?: string;
  description?: string;
  image?: ImageRef;
  category?: string;
  registration: {
    enabled: boolean;
    capacity?: number;
    closesAt?: string;
    externalUrl?: string;
  };
};

export type Ministry = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  image?: ImageRef;
  audience?: string;
  meetingTime?: string;
  leader?: Pick<Speaker, "name" | "role" | "photo">;
};

export type StaffMember = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: ImageRef;
  email?: string;
};

export type Belief = {
  id: string;
  title: string;
  body: string;
};

export type VisitFaq = {
  id: string;
  question: string;
  answer: string;
};
