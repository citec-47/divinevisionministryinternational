"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, destroySession, getSession, verifyCredentials } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/form-state";

/**
 * Admin server actions.
 *
 * Every mutating action calls `requireSession` first. The layout also gates the
 * pages, but a server action is a public endpoint in its own right, an
 * attacker can POST to it without ever loading the page, so the check belongs
 * here too, not only in the UI.
 */
async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

const requiredText = z.string().trim().min(1, "Required");

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function nullable(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value === "" ? null : value;
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function int(formData: FormData, key: string): number | null {
  const value = str(formData, key);
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function date(formData: FormData, key: string): Date | null {
  const value = str(formData, key);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Turns a title into a URL-safe slug, keeping accented French words readable. */
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Refreshes the public pages a change could affect. */
function revalidateSite(paths: string[] = []) {
  for (const locale of ["en", "fr"]) {
    revalidatePath(`/${locale}`, "page");
    for (const path of paths) revalidatePath(`/${locale}${path}`, "page");
  }
  revalidatePath("/api/podcast.xml");
  revalidatePath("/sitemap.xml");
}

// --- Authentication ---------------------------------------------------------

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = str(formData, "email");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    // Deliberately vague: never reveal whether the address exists.
    return { status: "error", message: "That email and password do not match." };
  }

  await createSession(user.id, user.email);
  redirect("/admin");
}

export async function signOut() {
  await destroySession();
  redirect("/admin/login");
}

// --- Church details ---------------------------------------------------------

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const parsed = z
    .object({ name: requiredText, shortName: requiredText, taglineEn: requiredText })
    .safeParse({
      name: str(formData, "name"),
      shortName: str(formData, "shortName"),
      taglineEn: str(formData, "taglineEn"),
    });

  if (!parsed.success) {
    return { status: "error", message: "The church name and tagline are required." };
  }

  const data = {
    name: str(formData, "name"),
    shortName: str(formData, "shortName"),
    taglineEn: str(formData, "taglineEn"),
    taglineFr: nullable(formData, "taglineFr"),
    descriptionEn: str(formData, "descriptionEn"),
    descriptionFr: nullable(formData, "descriptionFr"),
    logoUrl: nullable(formData, "logoUrl"),
    addressLine: str(formData, "addressLine"),
    city: str(formData, "city"),
    region: nullable(formData, "region"),
    country: str(formData, "country"),
    addressNoteEn: nullable(formData, "addressNoteEn"),
    addressNoteFr: nullable(formData, "addressNoteFr"),
    phone: nullable(formData, "phone"),
    whatsapp: nullable(formData, "whatsapp"),
    email: nullable(formData, "email"),
    timezone: str(formData, "timezone") || "Africa/Douala",
    currency: str(formData, "currency") || "XAF",
    livestreamEmbedUrl: nullable(formData, "livestreamEmbedUrl"),
    livestreamChannelUrl: nullable(formData, "livestreamChannelUrl"),
    forceLive: bool(formData, "forceLive"),
    givingBlurbEn: nullable(formData, "givingBlurbEn"),
    givingBlurbFr: nullable(formData, "givingBlurbFr"),
    momoMtn: nullable(formData, "momoMtn"),
    momoOrange: nullable(formData, "momoOrange"),
    momoAccountName: nullable(formData, "momoAccountName"),
    bankName: nullable(formData, "bankName"),
    bankAccountName: nullable(formData, "bankAccountName"),
    bankAccountNumber: nullable(formData, "bankAccountNumber"),
    facebookUrl: nullable(formData, "facebookUrl"),
    youtubeUrl: nullable(formData, "youtubeUrl"),
    instagramUrl: nullable(formData, "instagramUrl"),
    tiktokUrl: nullable(formData, "tiktokUrl"),
  };

  await prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  revalidateSite(["/visit", "/contact", "/give", "/live", "/about"]);
  return { status: "success", message: "Church details saved." };
}

// --- Service times ----------------------------------------------------------

export async function saveServiceTime(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const id = nullable(formData, "id");
  const labelEn = str(formData, "labelEn");
  const startTime = str(formData, "startTime");

  if (!labelEn || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
    return { status: "error", message: "Give it a name and a start time like 09:00." };
  }

  const data = {
    labelEn,
    labelFr: nullable(formData, "labelFr"),
    dayOfWeek: int(formData, "dayOfWeek") ?? 0,
    startTime,
    endTime: nullable(formData, "endTime"),
    noteEn: nullable(formData, "noteEn"),
    noteFr: nullable(formData, "noteFr"),
    location: nullable(formData, "location"),
    sortOrder: int(formData, "sortOrder") ?? 0,
  };

  if (id) {
    await prisma.serviceTime.update({ where: { id }, data });
  } else {
    await prisma.serviceTime.create({ data });
  }

  revalidateSite(["/visit", "/contact", "/live"]);
  return { status: "success", message: "Service time saved." };
}

export async function deleteServiceTime(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.serviceTime.delete({ where: { id } });
  revalidateSite(["/visit", "/contact", "/live"]);
  redirect("/admin/service-times");
}

// --- Sermons ----------------------------------------------------------------

export async function saveSermon(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const id = nullable(formData, "id");
  const titleEn = str(formData, "titleEn");
  const preachedOn = date(formData, "date");

  if (!titleEn) return { status: "error", message: "The sermon needs an English title." };
  if (!preachedOn) return { status: "error", message: "Pick the date it was preached." };

  const slug = str(formData, "slug") || slugify(titleEn);

  const data = {
    titleEn,
    titleFr: nullable(formData, "titleFr"),
    summaryEn: nullable(formData, "summaryEn"),
    summaryFr: nullable(formData, "summaryFr"),
    date: preachedOn,
    speakerId: nullable(formData, "speakerId"),
    seriesId: nullable(formData, "seriesId"),
    scriptures: str(formData, "scriptures")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    imageUrl: nullable(formData, "imageUrl"),
    imageAltEn: nullable(formData, "imageAltEn"),
    imageAltFr: nullable(formData, "imageAltFr"),
    videoUrl: nullable(formData, "videoUrl"),
    audioUrl: nullable(formData, "audioUrl"),
    durationSeconds: int(formData, "durationMinutes")
      ? (int(formData, "durationMinutes") as number) * 60
      : null,
    audioByteLength: int(formData, "audioByteLength"),
    transcriptEn: nullable(formData, "transcriptEn"),
    transcriptFr: nullable(formData, "transcriptFr"),
    published: bool(formData, "published"),
  };

  try {
    if (id) {
      await prisma.sermon.update({ where: { id }, data: { ...data, slug } });
    } else {
      await prisma.sermon.create({ data: { ...data, slug } });
    }
  } catch (error) {
    console.error("[admin] could not save sermon:", error);
    return {
      status: "error",
      message: "Could not save. Another sermon may already use that web address.",
    };
  }

  revalidateSite(["/sermons", `/sermons/${slug}`]);
  redirect("/admin/sermons");
}

export async function deleteSermon(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.sermon.delete({ where: { id } });
  revalidateSite(["/sermons"]);
  redirect("/admin/sermons");
}

// --- Series -----------------------------------------------------------------

export async function saveSeries(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const id = nullable(formData, "id");
  const titleEn = str(formData, "titleEn");
  if (!titleEn) return { status: "error", message: "The series needs an English title." };

  const slug = str(formData, "slug") || slugify(titleEn);

  const data = {
    titleEn,
    titleFr: nullable(formData, "titleFr"),
    descriptionEn: nullable(formData, "descriptionEn"),
    descriptionFr: nullable(formData, "descriptionFr"),
    imageUrl: nullable(formData, "imageUrl"),
    imageAltEn: nullable(formData, "imageAltEn"),
    imageAltFr: nullable(formData, "imageAltFr"),
    startDate: date(formData, "startDate"),
    endDate: date(formData, "endDate"),
  };

  try {
    if (id) {
      await prisma.series.update({ where: { id }, data: { ...data, slug } });
    } else {
      await prisma.series.create({ data: { ...data, slug } });
    }
  } catch (error) {
    console.error("[admin] could not save series:", error);
    return { status: "error", message: "Could not save. That web address may be taken." };
  }

  revalidateSite(["/sermons", `/series/${slug}`]);
  redirect("/admin/series");
}

export async function deleteSeries(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  // Sermons survive: the relation is SetNull, so deleting a series never
  // deletes the teaching inside it.
  if (id) await prisma.series.delete({ where: { id } });
  revalidateSite(["/sermons"]);
  redirect("/admin/series");
}

// --- Events -----------------------------------------------------------------

export async function saveEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const id = nullable(formData, "id");
  const titleEn = str(formData, "titleEn");
  const start = date(formData, "start");

  if (!titleEn) return { status: "error", message: "The event needs an English title." };
  if (!start) return { status: "error", message: "Pick a start date and time." };

  const slug = str(formData, "slug") || slugify(titleEn);

  const data = {
    titleEn,
    titleFr: nullable(formData, "titleFr"),
    summaryEn: nullable(formData, "summaryEn"),
    summaryFr: nullable(formData, "summaryFr"),
    descriptionEn: nullable(formData, "descriptionEn"),
    descriptionFr: nullable(formData, "descriptionFr"),
    start,
    end: date(formData, "end"),
    recurrenceEn: nullable(formData, "recurrenceEn"),
    recurrenceFr: nullable(formData, "recurrenceFr"),
    category: nullable(formData, "category"),
    location: nullable(formData, "location"),
    address: nullable(formData, "address"),
    imageUrl: nullable(formData, "imageUrl"),
    imageAltEn: nullable(formData, "imageAltEn"),
    imageAltFr: nullable(formData, "imageAltFr"),
    registrationEnabled: bool(formData, "registrationEnabled"),
    capacity: int(formData, "capacity"),
    registrationClosesAt: date(formData, "registrationClosesAt"),
    externalUrl: nullable(formData, "externalUrl"),
    published: bool(formData, "published"),
  };

  try {
    if (id) {
      await prisma.event.update({ where: { id }, data: { ...data, slug } });
    } else {
      await prisma.event.create({ data: { ...data, slug } });
    }
  } catch (error) {
    console.error("[admin] could not save event:", error);
    return { status: "error", message: "Could not save. That web address may be taken." };
  }

  revalidateSite(["/events", `/events/${slug}`]);
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.event.delete({ where: { id } });
  revalidateSite(["/events"]);
  redirect("/admin/events");
}

// --- Ministries -------------------------------------------------------------

export async function saveMinistry(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireSession();

  const id = nullable(formData, "id");
  const titleEn = str(formData, "titleEn");
  const summaryEn = str(formData, "summaryEn");

  if (!titleEn || !summaryEn) {
    return { status: "error", message: "A ministry needs an English name and summary." };
  }

  const slug = str(formData, "slug") || slugify(titleEn);

  const data = {
    titleEn,
    titleFr: nullable(formData, "titleFr"),
    summaryEn,
    summaryFr: nullable(formData, "summaryFr"),
    descriptionEn: nullable(formData, "descriptionEn"),
    descriptionFr: nullable(formData, "descriptionFr"),
    audienceEn: nullable(formData, "audienceEn"),
    audienceFr: nullable(formData, "audienceFr"),
    meetingTimeEn: nullable(formData, "meetingTimeEn"),
    meetingTimeFr: nullable(formData, "meetingTimeFr"),
    imageUrl: nullable(formData, "imageUrl"),
    imageAltEn: nullable(formData, "imageAltEn"),
    imageAltFr: nullable(formData, "imageAltFr"),
    leaderId: nullable(formData, "leaderId"),
    sortOrder: int(formData, "sortOrder") ?? 0,
  };

  try {
    if (id) {
      await prisma.ministry.update({ where: { id }, data: { ...data, slug } });
    } else {
      await prisma.ministry.create({ data: { ...data, slug } });
    }
  } catch (error) {
    console.error("[admin] could not save ministry:", error);
    return { status: "error", message: "Could not save. That web address may be taken." };
  }

  revalidateSite(["/ministries", `/ministries/${slug}`]);
  redirect("/admin/ministries");
}

export async function deleteMinistry(formData: FormData) {
  await requireSession();
  const id = str(formData, "id");
  if (id) await prisma.ministry.delete({ where: { id } });
  revalidateSite(["/ministries"]);
  redirect("/admin/ministries");
}

// --- Inbox ------------------------------------------------------------------

const INBOX_KINDS = ["prayerRequest", "contactMessage", "eventRegistration"] as const;
type InboxKind = (typeof INBOX_KINDS)[number];

/** Ticks an inbox item as dealt with. */
export async function toggleHandled(formData: FormData) {
  await requireSession();

  const kind = str(formData, "kind") as InboxKind;
  const id = str(formData, "id");
  const handled = bool(formData, "handled");

  if (!INBOX_KINDS.includes(kind) || !id) return;

  if (kind === "prayerRequest") {
    await prisma.prayerRequest.update({ where: { id }, data: { handled } });
  } else if (kind === "contactMessage") {
    await prisma.contactMessage.update({ where: { id }, data: { handled } });
  } else {
    await prisma.eventRegistration.update({ where: { id }, data: { handled } });
  }

  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}
