import type { Metadata } from "next";

import { ButtonLink, Card, Section } from "@/components/ui";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/dictionaries";
import { verifyTransaction } from "@/lib/flutterwave";
import { localePath, type Locale } from "@/lib/i18n";

/** Depends on the redirect's query string, so it can never be prerendered. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // A payment outcome page should never appear in search results.
  robots: { index: false, follow: false },
};

/**
 * Confirms the outcome of a gift.
 *
 * The redirect parameters are a hint, never proof — anyone can type them into
 * the address bar. The transaction is re-verified against Flutterwave, and the
 * amount and currency are checked against the Donation row we wrote before the
 * redirect, before this page will say "thank you".
 *
 * The webhook is the authoritative path; this is the giver-facing one, and both
 * converge on the same row.
 */
async function confirmGift(searchParams: Record<string, string | string[] | undefined>) {
  const status = String(searchParams.status ?? "");
  const reference = String(searchParams.tx_ref ?? "");
  const transactionId = String(searchParams.transaction_id ?? "");

  if (status !== "successful" || !reference || !transactionId) return false;

  const donation = await prisma.donation.findUnique({ where: { reference } });
  if (!donation) return false;

  // The webhook may have already settled it.
  if (donation.status === "SUCCESSFUL") return true;

  try {
    const verified = await verifyTransaction(transactionId);

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

    return legitimate;
  } catch (error) {
    console.error("[giving] could not verify on return:", error);
    // Leave the row PENDING: the webhook still gets a chance to settle it, and
    // we would rather under-claim than tell someone a failed gift succeeded.
    return false;
  }
}

export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  const dict = getDictionary(locale);
  const succeeded = await confirmGift(query);

  return (
    <Section>
      <Card className="mx-auto max-w-xl p-8 text-center sm:p-12">
        <span
          aria-hidden="true"
          className={
            succeeded
              ? "mx-auto grid size-14 place-items-center rounded-full bg-accent text-accent-contrast"
              : "mx-auto grid size-14 place-items-center rounded-full bg-surface-2 text-ink-muted"
          }
        >
          {succeeded ? (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
          ) : (
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 8v5M12 16.5v.5" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
        </span>

        <h1 className="mt-6 font-display text-3xl tracking-tight">
          {succeeded ? dict.give.thankYouTitle : dict.give.thankYouFailed}
        </h1>
        <p className="mt-3 text-ink-muted">
          {succeeded ? dict.give.thankYouBody : dict.give.thankYouFailedBody}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {succeeded ? (
            <>
              <ButtonLink href={localePath(locale, "/")}>{dict.common.backToHome}</ButtonLink>
              <ButtonLink href={localePath(locale, "/sermons")} variant="outline">
                {dict.give.listenToMessage}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href={localePath(locale, "/give")}>{dict.give.tryAgain}</ButtonLink>
              <ButtonLink href={localePath(locale, "/")} variant="outline">
                {dict.common.backToHome}
              </ButtonLink>
            </>
          )}
        </div>
      </Card>
    </Section>
  );
}
