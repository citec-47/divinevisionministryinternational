import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { verifyTransaction } from "@/lib/flutterwave";

/**
 * Flutterwave webhook.
 *
 * Two layers of trust, because a webhook endpoint is public:
 *   1. The `verif-hash` header must match our configured secret.
 *   2. The transaction is then re-verified against Flutterwave's own API, and
 *      the amount and currency are checked against what we recorded before the
 *      redirect. A body claiming "successful" is never enough on its own.
 */
function hashMatches(received: string | null): boolean {
  const expected = process.env.FLUTTERWAVE_WEBHOOK_HASH;
  if (!expected || !received) return false;

  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, so check that first.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!hashMatches(request.headers.get("verif-hash"))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: { data?: { id?: number; tx_ref?: string } };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const transactionId = payload.data?.id;
  const reference = payload.data?.tx_ref;
  if (!transactionId || !reference) {
    return NextResponse.json({ error: "Missing transaction details." }, { status: 400 });
  }

  const donation = await prisma.donation.findUnique({ where: { reference } });
  if (!donation) {
    // Not ours, or already cleaned up. Acknowledge so Flutterwave stops retrying.
    return NextResponse.json({ received: true });
  }

  try {
    const verified = await verifyTransaction(String(transactionId));

    const legitimate =
      verified.status === "successful" &&
      verified.reference === donation.reference &&
      verified.currency === donation.currency &&
      verified.amount >= donation.amount;

    await prisma.donation.update({
      where: { reference },
      data: {
        status: legitimate ? "SUCCESSFUL" : "FAILED",
        providerRef: verified.providerRef,
        channel: verified.channel ?? null,
      },
    });

    if (!legitimate) {
      console.warn(
        `[giving] transaction ${transactionId} did not match donation ${reference}`,
        verified,
      );
    }
  } catch (error) {
    console.error("[giving] webhook verification failed:", error);
    // 500 asks Flutterwave to retry, which is what we want for a transient fault.
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
