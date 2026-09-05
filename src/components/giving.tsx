"use client";

import { useId, useState } from "react";

import type { Dictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { cn, formatCurrency, whatsappUrl } from "@/lib/utils";
import { Card } from "./ui";

/** Sensible suggested amounts per currency. XAF has no subunit. */
const PRESETS: Record<string, number[]> = {
  XAF: [1000, 2000, 5000, 10000],
  NGN: [1000, 2000, 5000, 10000],
  USD: [10, 25, 50, 100],
  EUR: [10, 25, 50, 100],
};

const FUNDS = [
  { id: "general", en: "Where it is needed most", fr: "Là où le besoin est le plus grand" },
  { id: "missions", en: "Missions & outreach", fr: "Missions et action sociale" },
  { id: "benevolence", en: "Helping families in need", fr: "Aide aux familles en difficulté" },
  { id: "building", en: "Building fund", fr: "Fonds de construction" },
] as const;

export function GivingForm({
  settings,
  locale,
  dict,
  configured,
}: {
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
  /** False when Flutterwave keys are missing, so we say so plainly. */
  configured: boolean;
}) {
  const currency = settings.giving.currency || "XAF";
  const presets = PRESETS[currency] ?? PRESETS.XAF;

  const [amount, setAmount] = useState<number | null>(presets[1] ?? presets[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [fund, setFund] = useState<string>("general");
  const [recurring, setRecurring] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customId = useId();
  const emailId = useId();
  const nameId = useId();
  const fundId = useId();

  const effectiveAmount = customAmount ? Number(customAmount) : amount;
  const canSubmit =
    configured &&
    !pending &&
    Number.isFinite(effectiveAmount) &&
    (effectiveAmount ?? 0) > 0 &&
    email.includes("@");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/giving/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effectiveAmount,
          fund,
          recurring,
          email,
          name: name || undefined,
          locale,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setPending(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setError(dict.forms.deliveryFailed);
      setPending(false);
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      {!configured ? (
        <p
          role="status"
          className="mb-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
        >
          {dict.give.notConfigured}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <fieldset>
          <legend className="text-sm font-medium">{dict.give.howOften}</legend>
          <div className="mt-2 inline-flex rounded-full border border-line p-1">
            {[
              { value: false, label: dict.give.giveOnce },
              { value: true, label: dict.give.giveMonthly },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setRecurring(option.value)}
                aria-pressed={recurring === option.value}
                className={cn(
                  "h-10 rounded-full px-5 text-sm font-medium transition-colors",
                  recurring === option.value
                    ? "bg-brand text-brand-contrast"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium">{dict.give.amount}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((preset) => {
              const active = !customAmount && amount === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setAmount(preset);
                    setCustomAmount("");
                  }}
                  aria-pressed={active}
                  className={cn(
                    "h-12 rounded-xl border px-4 font-display text-lg transition-colors",
                    active
                      ? "border-brand bg-brand text-brand-contrast"
                      : "border-line hover:bg-surface-2",
                  )}
                >
                  {formatCurrency(preset, currency, locale)}
                </button>
              );
            })}
          </div>

          <div className="mt-3">
            <label htmlFor={customId} className="text-sm text-ink-muted">
              {dict.give.otherAmount}
            </label>
            <input
              id={customId}
              type="number"
              inputMode="numeric"
              min={100}
              step={currency === "XAF" ? 100 : 1}
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder={currency}
              className="mt-1.5 w-full rounded-xl border border-line bg-ground px-4 py-3 text-[0.95rem] placeholder:text-ink-faint sm:max-w-56"
            />
          </div>
        </fieldset>

        <div>
          <label htmlFor={fundId} className="text-sm font-medium">
            {dict.give.whereShouldItGo}
          </label>
          <select
            id={fundId}
            value={fund}
            onChange={(event) => setFund(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-line bg-ground px-4 py-3 text-[0.95rem]"
          >
            {FUNDS.map((item) => (
              <option key={item.id} value={item.id}>
                {locale === "fr" ? item.fr : item.en}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={nameId} className="text-sm font-medium">
              {dict.forms.yourName}
              <span className="ml-1 text-xs font-normal text-ink-faint">
                ({dict.common.optional})
              </span>
            </label>
            <input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="mt-1.5 w-full rounded-xl border border-line bg-ground px-4 py-3 text-[0.95rem]"
            />
          </div>

          <div>
            <label htmlFor={emailId} className="text-sm font-medium">
              {dict.forms.email}
              <span className="ml-1 text-xs font-normal text-ink-faint">
                ({dict.give.emailForReceipt})
              </span>
            </label>
            <input
              id={emailId}
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-xl border border-line bg-ground px-4 py-3 text-[0.95rem] placeholder:text-ink-faint"
            />
          </div>
        </div>

        {error ? (
          <p role="alert" className="rounded-xl border border-live/40 bg-live/10 px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        <div>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-13 w-full items-center justify-center rounded-full bg-accent px-7 font-medium text-accent-contrast transition-colors hover:bg-accent-soft disabled:opacity-50 sm:w-auto"
          >
            {pending
              ? dict.give.takingYouToCheckout
              : effectiveAmount
                ? `${dict.give.give} ${formatCurrency(effectiveAmount, currency, locale)}${
                    recurring ? ` ${dict.give.monthly}` : ""
                  }`
                : dict.give.chooseAmount}
          </button>

          <p className="mt-3 text-xs text-ink-faint">{dict.give.securedBy}</p>
        </div>
      </form>
    </Card>
  );
}

/** One number, one tap to copy. */
function CopyRow({
  label,
  value,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context, or the user declined). The number
      // is still on screen and selectable, so there is nothing to recover from.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
        <p className="mt-0.5 truncate font-display text-lg tracking-tight">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-2"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

/**
 * Mobile Money and bank details.
 *
 * For most givers in Yaoundé this is the whole giving page — a MoMo transfer
 * costs them nothing in card fees and takes ten seconds. The card checkout
 * above is the secondary path, not the primary one.
 */
export function DirectGivingDetails({
  settings,
  locale,
  dict,
}: {
  settings: SiteSettings;
  locale: Locale;
  dict: Dictionary;
}) {
  const { giving } = settings;
  const hasMomo = Boolean(giving.momoMtn || giving.momoOrange);
  const hasBank = Boolean(giving.bankAccountNumber);

  if (!hasMomo && !hasBank) return null;

  const whatsapp = whatsappUrl(
    settings,
    locale === "fr"
      ? "Bonjour, je viens d’envoyer un don à Divine Vision. Voici la capture d’écran :"
      : "Hello, I have just sent a gift to Divine Vision. Here is the screenshot:",
  );

  return (
    <Card className="p-6">
      <h2 className="font-display text-xl tracking-tight">{dict.give.directTitle}</h2>
      <p className="mt-2 text-sm text-ink-muted">{dict.give.directIntro}</p>

      <div className="mt-5">
        {giving.momoMtn ? (
          <CopyRow
            label={dict.give.mtnMomo}
            value={giving.momoMtn}
            copyLabel={dict.common.copy}
            copiedLabel={dict.common.copied}
          />
        ) : null}
        {giving.momoOrange ? (
          <CopyRow
            label={dict.give.orangeMoney}
            value={giving.momoOrange}
            copyLabel={dict.common.copy}
            copiedLabel={dict.common.copied}
          />
        ) : null}
        {giving.momoAccountName ? (
          <CopyRow
            label={dict.give.accountName}
            value={giving.momoAccountName}
            copyLabel={dict.common.copy}
            copiedLabel={dict.common.copied}
          />
        ) : null}
        {giving.bankName ? (
          <CopyRow
            label={dict.give.bankNameLabel}
            value={giving.bankName}
            copyLabel={dict.common.copy}
            copiedLabel={dict.common.copied}
          />
        ) : null}
        {giving.bankAccountNumber ? (
          <CopyRow
            label={dict.give.accountNumber}
            value={giving.bankAccountNumber}
            copyLabel={dict.common.copy}
            copiedLabel={dict.common.copied}
          />
        ) : null}
      </div>

      {whatsapp ? (
        <div className="mt-5">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-medium text-brand-contrast transition-colors hover:bg-brand-soft"
          >
            {dict.give.confirmOnWhatsApp}
          </a>
          <p className="mt-2 text-xs text-ink-faint">{dict.give.confirmBody}</p>
        </div>
      ) : null}
    </Card>
  );
}
