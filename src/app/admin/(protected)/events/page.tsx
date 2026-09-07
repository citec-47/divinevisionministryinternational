import Link from "next/link";

import {
  AdminEmpty,
  AdminHeader,
  AdminTable,
  PrimaryLink,
  StatusPill,
} from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { start: "asc" },
    include: { _count: { select: { registrations: true } } },
  });

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Events"
        description="Everything on the calendar, soonest first."
        action={<PrimaryLink href="/admin/events/new">Add an event</PrimaryLink>}
      />

      {events.length ? (
        <AdminTable headings={["Event", "When", "Registrations", "Status", ""]}>
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-5 py-3">
                <p className="font-medium">{event.titleEn}</p>
                {event.location ? (
                  <p className="text-xs text-ink-faint">{event.location}</p>
                ) : null}
              </td>
              <td className="px-5 py-3 text-ink-muted">
                {event.recurrenceEn ??
                  event.start.toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
              </td>
              <td className="px-5 py-3">
                {event.registrationEnabled ? (
                  <Link
                    href="/admin/inbox"
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    {event._count.registrations}
                  </Link>
                ) : (
                  <span className="text-ink-faint">-</span>
                )}
              </td>
              <td className="px-5 py-3">
                <StatusPill ok={event.published}>
                  {event.published ? "Published" : "Draft"}
                </StatusPill>
              </td>
              <td className="px-5 py-3 text-right">
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="underline underline-offset-4 hover:no-underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <AdminEmpty
          title="Nothing on the calendar"
          description="Add your prayer meetings, youth nights and outreach days so visitors can see what happens during the week."
          action={<PrimaryLink href="/admin/events/new">Add the first event</PrimaryLink>}
        />
      )}
    </div>
  );
}
