import Link from "next/link";

import { AdminCard, AdminHeader, PrimaryLink } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** A number and a label, linking to wherever you would act on it. */
function Stat({
  label,
  value,
  href,
  urgent,
}: {
  label: string;
  value: number;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-card border border-line bg-surface p-5 transition-colors hover:border-ink-faint"
    >
      <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
      <p
        className={
          urgent && value > 0
            ? "mt-1 font-display text-4xl tracking-tight text-accent"
            : "mt-1 font-display text-4xl tracking-tight"
        }
      >
        {value}
      </p>
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
  ] = await Promise.all([
    prisma.sermon.count(),
    prisma.event.count({ where: { published: true } }),
    prisma.ministry.count(),
    prisma.serviceTime.count(),
    prisma.prayerRequest.count({ where: { handled: false } }),
    prisma.contactMessage.count({ where: { handled: false } }),
    prisma.eventRegistration.count({ where: { handled: false } }),
    prisma.donation.count({ where: { status: "SUCCESSFUL" } }),
  ]);

  const settings = await prisma.siteSetting.findFirst();

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
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard"
        description="What is on the site right now, and what still needs your attention."
        action={<PrimaryLink href="/admin/sermons/new">Add a sermon</PrimaryLink>}
      />

      {warnings.length ? (
        <div className="space-y-3">
          {warnings.map((warning) => (
            <div
              key={warning.href + warning.text}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-accent/40 bg-accent/10 px-5 py-4"
            >
              <p className="text-sm">{warning.text}</p>
              <Link
                href={warning.href}
                className="shrink-0 rounded-full border border-accent px-4 py-1.5 text-sm font-medium text-accent"
              >
                {warning.label}
              </Link>
            </div>
          ))}
        </div>
      ) : null}

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Needs a reply
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Prayer requests"
            value={unhandledPrayer}
            href="/admin/inbox"
            urgent
          />
          <Stat label="Messages" value={unhandledMessages} href="/admin/inbox" urgent />
          <Stat
            label="Registrations"
            value={unhandledRegistrations}
            href="/admin/inbox"
            urgent
          />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
          On the site
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Sermons" value={sermons} href="/admin/sermons" />
          <Stat label="Upcoming events" value={events} href="/admin/events" />
          <Stat label="Ministries" value={ministries} href="/admin/ministries" />
          <Stat label="Gifts received" value={gifts} href="/admin/giving" />
        </div>
      </section>

      <AdminCard>
        <h2 className="font-display text-xl tracking-tight">A quick guide</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
          <li>
            <strong className="text-ink">Every Monday:</strong> add Sunday&apos;s sermon under
            Sermons. Paste the YouTube link — it becomes a player automatically.
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
