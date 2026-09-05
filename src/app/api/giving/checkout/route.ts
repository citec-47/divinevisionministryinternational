import { randomBytes } from "node:crypto";

import { NextResponse } from "next/server";

import { getSettings } from "@/lib/content";
import { prisma } from "@/lib/db";
import { createPaymentLink, isFlutterwaveConfigured } from "@/lib/flutterwave";
import { isLocale } from "@/lib/i18n";
import { siteUrl } from "@/lib/utils";

/**
 * Starts a gift.
 *
 * The Donation row is written before the redirect so that a gift is never
 * invisible to the church: if the giver closes the tab mid-payment, the record
 * still exists as PENDING and the webhook can complete it later.
 */

// Guards against fat fingers, not fraud. XAF is unsubdivided, so 500 francs is
// a realistic floor and a million is comfortably above any single gift.
const MIN_XAF = 100;
const MAX_XAF = 5_000_000;

export async function POST(request: Request) {
  const settings = await getSettings("en");

  if (!isFlutterwaveConfigured()) {
    return NextResponse.json(
      { error: "Online giving is not switched on yet." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < MIN_XAF || amount > MAX_XAF) {
    return NextResponse.json(
      { error: `Enter an amount between ${MIN_XAF} and ${MAX_XAF.toLocaleString()}.` },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" && body.email.includes("@") ? body.email : null;
  if (!email) {
    // Flutterwave requires an email to open a checkout session.
    return NextResponse.json({ error: "An email address is required." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.slice(0, 120) : undefined;
  const phone = typeof body.phone === "string" ? body.phone.slice(0, 40) : undefined;
  const recurring = body.recurring === true;
  const locale = isLocale(String(body.locale)) ? String(body.locale) : "en";

  // Only funds we define are accepted, so nothing attacker-supplied is stored.
  const allowedFunds = ["general", "missions", "building", "benevolence"];
  const fund = allowedFunds.includes(String(body.fund)) ? String(body.fund) : "general";

  const reference = `DVMI-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const currency = settings.giving.currency || "XAF";

  try {
    await prisma.donation.create({
      data: {
        reference,
        amount: Math.round(amount),
        currency,
        fund,
        donorName: name ?? null,
        donorEmail: email,
        donorPhone: phone ?? null,
        recurring,
        status: "PENDING",
        provider: "flutterwave",
      },
    });

    const link = await createPaymentLink({
      reference,
      amount: Math.round(amount),
      currency,
      redirectUrl: `${siteUrl()}/${locale}/give/thank-you`,
      customer: { email, name, phone },
      title: settings.name,
      description: recurring ? "Monthly gift" : "Gift",
      ...(recurring && process.env.FLUTTERWAVE_PAYMENT_PLAN_ID
        ? { paymentPlanId: process.env.FLUTTERWAVE_PAYMENT_PLAN_ID }
        : {}),
    });

    return NextResponse.json({ url: link });
  } catch (error) {
    console.error("[giving] could not start checkout:", error);
    await prisma.donation
      .update({ where: { reference }, data: { status: "FAILED" } })
      .catch(() => undefined);

    return NextResponse.json(
      { error: "We could not start the payment. Please use the Mobile Money details instead." },
      { status: 502 },
    );
  }
}
