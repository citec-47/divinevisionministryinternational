import Link from "next/link";

import { AdminCard, AdminHeader, PrimaryLink } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * A number, a label, and somewhere to act on it.
 *
 * `tone="attention"` is reserved for counts that mean a person is waiting on a
 * reply, so the colour on this page always means the same thing.
 */
function Stat({
  label,
  value,
  href,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: number;
  href: string;
  hint?: string;
  tone?: "neutral" | "attention";
}) {
  const highlight = tone === "attention" && value > 0;

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-card border bg-surface p-5 transition-colors",
        highlight ? "border-accent/50 hover:border-accent" : "border-line hover:border-ink-faint",
      )}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
      <span
        className={cn(
          "mt-2 font-display text-4xl leading-none tracking-tight tabular-nums",
          highlight && "text-accent",
        )}
      >
        {value}
      </span>
      <span className="mt-auto pt-3 text-xs text-ink-faint">{hint ?? " "}</span>
    </Link>
  );
}

export default async function AdminDashboard() {
  const [
    sermons,
    events,
    ministries,
    serviceTimes,
    unhandledPrayer,
    unhandledMessages,
    unhandledRegistrations,
    gifts,
    settings,
  ] = await Promise.all([
    prisma.sermon.count(),
    prisma.event.count({ where: { published: true } }),
    prisma.ministry.count(),
    prisma.serviceTime.count(),
    prisma.prayerRequest.count({ where: { handled: false } }),
    prisma.contactMessage.count({ where: { handled: false } }),
    prisma.eventRegistration.count({ where: { handled: false } }),
    prisma.donation.count({ where: { status: "SUCCESSFUL" } }),
    prisma.siteSetting.findFirst(),
  ]);

  const waiting = unhandledPrayer + unhandledMessages + unhandledRegistrations;

  // Things that would make the public site look unfinished or wrong. Surfaced
  // here rather than left for someone to notice after launch.
  const warnings: { text: string; href: string; label: string }[] = [];

  if (serviceTimes === 0) {
    warnings.push({
      text: "No service times are published. The homepage cannot tell anyone when you meet.",
      href: "/admin/service-times",
      label: "Add service times",
    });
  }

  if (settings && settings.addressLine.trim().toLowerCase() === "yaoundé") {
    warnings.push({
      text: "The address is still just “Yaoundé”. Add the street and a landmark so visitors can find you.",
      href: "/admin/settings",
      label: "Edit the address",
    });
  }

  if (sermons === 0) {
    warnings.push({
      text: "No sermons yet. Adding one unlocks the sermon library and the podcast feed.",
      href: "/admin/sermons/new",
      label: "Add a sermon",
    });
  }

  if (!settings?.livestreamChannelUrl && !settings?.livestreamEmbedUrl) {
    warnings.push({
      text: "No livestream link is set, so the Watch live page has nothing to show.",
      href: "/admin/settings",
      label: "Add the link",
    });
  }

  return (
    <div className="space-y-10">
      <AdminHeader
        title="Dashboard"
        description="What is on the site right now, and what still needs your attention."
        action={<PrimaryLink href="/admin/sermons/new">Add a sermon</PrimaryLink>}
      />

      {warnings.length ? (
        <section aria-labelledby="needs-doing" className="space-y-3">
          <h2
            id="needs-doing"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint"
          >
            Before you launch
          </h2>
          {warnings.map((warning) => (
            <div
              key={warning.href + warning.text}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-accent/40 bg-accent/10 px-5 py-4"
            >
              <p className="text-sm">{warning.text}</p>
              <Link
                href={warning.href}
                className="shrink-0 rounded-full border border-accent px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-accent-contrast"
              >
                {warning.label}
              </Link>
            </div>
          ))}
        </section>
      ) : null}

      <section aria-labelledby="needs-reply">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="needs-reply"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint"
          >
            Waiting on a reply
          </h2>
          {waiting > 0 ? (
            <Link
              href="/admin/inbox"
              className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              Open the inbox
            </Link>
          ) : (
            <span className="text-sm text-ink-faint">Nothing outstanding</span>
          )}
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Prayer requests"
            value={unhandledPrayer}
            href="/admin/inbox"
            hint="Unanswered"
            tone="attention"
          />
          <Stat
            label="Messages"
            value={unhandledMessages}
            href="/admin/inbox"
            hint="From the contact form"
            tone="attention"
          />
          <Stat
            label="Registrations"
            value={unhandledRegistrations}
            href="/admin/inbox"
            hint="Event sign-ups"
            tone="attention"
          />
        </div>
      </section>

      <section aria-labelledby="on-the-site">
        <h2
          id="on-the-site"
          className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint"
        >
          On the site
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Sermons" value={sermons} href="/admin/sermons" hint="Published" />
          <Stat label="Events" value={events} href="/admin/events" hint="Upcoming" />
          <Stat label="Ministries" value={ministries} href="/admin/ministries" hint="Groups" />
          <Stat label="Gifts" value={gifts} href="/admin/giving" hint="Online, completed" />
        </div>
      </section>

      <AdminCard>
        <h2 className="font-display text-xl tracking-tight">A quick guide</h2>
        <ul className="mt-4 space-y-3 text-sm text-ink-muted">
          <li>
            <strong className="text-ink">Every Monday:</strong> add Sunday&apos;s sermon under
            Sermons. Paste the YouTube link and it becomes a player automatically.
          </li>
          <li>
            <strong className="text-ink">French is always optional.</strong> Leave a French box
            empty and the site shows the English text instead. Nothing breaks.
          </li>
          <li>
            <strong className="text-ink">Nothing goes live half-finished.</strong> Untick
            &ldquo;Published&rdquo; while you are still working on a sermon or event.
          </li>
          <li>
            <strong className="text-ink">Special service?</strong> Turn on &ldquo;Force the live
            banner&rdquo; in Church details, and remember to turn it off afterwards.
          </li>
        </ul>
      </AdminCard>
    </div>
  );
}
