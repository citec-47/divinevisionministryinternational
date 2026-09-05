"use server";

import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import type { FormState } from "@/lib/form-state";
import { isLocale, type Locale } from "@/lib/i18n";
import { notifyOffice } from "@/lib/notify";

/**
 * Server actions for the site's three forms.
 *
 * Submissions are written to the database first — that is the record the
 * pastoral team works from in /admin — and an email notification is attempted
 * afterwards. A failed email never loses the message.
 *
 * Spam handling is a honeypot field plus a minimum fill time. That stops the
 * naive bots that find a church site; if this ever takes real volume, put
 * Turnstile or a rate limiter in front of it.
 */

/** Bots fill hidden fields and submit instantly; humans do neither. */
function looksAutomated(formData: FormData): boolean {
  if (String(formData.get("website") ?? "").trim() !== "") return true;

  const startedAt = Number(formData.get("startedAt"));
  if (Number.isFinite(startedAt) && startedAt > 0) {
    return Date.now() - startedAt < 2500;
  }
  return false;
}

function text(formData: FormData, key: string, max = 5000): string {
  return String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);
}

function localeOf(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "");
  return isLocale(value) ? value : "en";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitPrayerRequest(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = localeOf(formData);
  const t = getDictionary(locale).forms;

  if (looksAutomated(formData)) {
    // Give a bot a plausible success rather than a signal to retry.
    return { status: "success", message: t.prayerSuccess };
  }

  const name = text(formData, "name", 120);
  const email = text(formData, "email", 200);
  const phone = text(formData, "phone", 60);
  const request = text(formData, "request", 4000);
  const isPrivate = formData.get("private") === "on";
  const wantsContact = formData.get("contactMe") === "on";

  const fieldErrors: Record<string, string> = {};
  if (request.length < 5) fieldErrors.request = t.prayerRequired;
  if (email && !EMAIL_PATTERN.test(email)) fieldErrors.email = t.emailInvalid;
  if (wantsContact && !email && !phone) fieldErrors.email = t.contactRequired;

  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: t.checkFields, fieldErrors };
  }

  try {
    await prisma.prayerRequest.create({
      data: {
        name: name || null,
        email: email || null,
        phone: phone || null,
        request,
        isPrivate,
        wantsContact,
      },
    });
  } catch (error) {
    console.error("[actions] prayer request failed to save:", error);
    return { status: "error", message: t.deliveryFailed };
  }

  await notifyOffice("New prayer request", {
    From: name || "Anonymous",
    Email: email,
    Phone: phone,
    Private: isPrivate ? "yes — pastoral team only" : "no",
    "Wants contact": wantsContact ? "yes" : "no",
    Request: request,
  });

  return { status: "success", message: t.prayerSuccess };
}

export async function submitContactMessage(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = localeOf(formData);
  const t = getDictionary(locale).forms;

  if (looksAutomated(formData)) {
    return { status: "success", message: t.contactSuccess };
  }

  const name = text(formData, "name", 120);
  const email = text(formData, "email", 200);
  const phone = text(formData, "phone", 60);
  const subject = text(formData, "subject", 160);
  const message = text(formData, "message", 4000);

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = t.nameRequired;
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = t.emailInvalid;
  if (message.length < 5) fieldErrors.message = t.messageRequired;

  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: t.checkFields, fieldErrors };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    });
  } catch (error) {
    console.error("[actions] contact message failed to save:", error);
    return { status: "error", message: t.deliveryFailed };
  }

  await notifyOffice("New message from the website", {
    Name: name,
    Email: email,
    Phone: phone,
    Subject: subject || "General enquiry",
    Message: message,
  });

  return { status: "success", message: t.contactSuccess };
}

export async function submitEventRegistration(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const locale = localeOf(formData);
  const t = getDictionary(locale).forms;

  if (looksAutomated(formData)) {
    return { status: "success", message: t.registrationSuccess };
  }

  const name = text(formData, "name", 120);
  const email = text(formData, "email", 200);
  const phone = text(formData, "phone", 60);
  const notes = text(formData, "notes", 1000);
  const eventTitle = text(formData, "eventTitle", 200);
  const eventId = text(formData, "eventId", 60);
  const guests = Number(formData.get("guests") ?? 1);

  const fieldErrors: Record<string, string> = {};
  if (name.length < 2) fieldErrors.name = t.nameRequired;
  if (!EMAIL_PATTERN.test(email)) fieldErrors.email = t.emailInvalid;
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    fieldErrors.guests = t.guestsRange;
  }

  if (Object.keys(fieldErrors).length) {
    return { status: "error", message: t.checkFields, fieldErrors };
  }

  try {
    await prisma.eventRegistration.create({
      data: {
        eventId: eventId || null,
        eventTitle,
        name,
        email,
        phone: phone || null,
        guests,
        notes: notes || null,
      },
    });
  } catch (error) {
    console.error("[actions] event registration failed to save:", error);
    return { status: "error", message: t.deliveryFailed };
  }

  await notifyOffice(`New registration — ${eventTitle}`, {
    Event: eventTitle,
    Name: name,
    Email: email,
    Phone: phone,
    Attending: String(guests),
    Notes: notes,
  });

  return { status: "success", message: t.registrationSuccess };
}
