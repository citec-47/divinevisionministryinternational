import { toggleHandled } from "@/app/admin/actions";
import { AdminCard, AdminEmpty, AdminHeader, StatusPill } from "@/components/admin/ui";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function when(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** A plain server-action form — no client JavaScript needed to tick something off. */
function HandledToggle({
  kind,
  id,
  handled,
}: {
  kind: string;
  id: string;
  handled: boolean;
}) {
  return (
    <form action={toggleHandled}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      {/* Submitting flips the current value. */}
      {!handled ? <input type="hidden" name="handled" value="on" /> : null}
      <button
        type="submit"
        className="rounded-full border border-line px-3 py-1 text-xs font-medium transition-colors hover:bg-surface-2"
      >
        {handled ? "Mark as not done" : "Mark as done"}
      </button>
    </form>
  );
}

export default async function AdminInboxPage() {
  const [prayers, messages, registrations] = await Promise.all([
    prisma.prayerRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.eventRegistration.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  const empty = !prayers.length && !messages.length && !registrations.length;

  return (
    <div className="space-y-10">
      <AdminHeader
        title="Inbox"
        description="Prayer requests, messages, and event registrations from the website."
      />

      {empty ? (
        <AdminEmpty
          title="Nothing has come in yet"
          description="When someone submits a prayer request, a message, or an event registration, it will appear here."
        />
      ) : null}

      {prayers.length ? (
        <section>
          <h2 className="font-display text-2xl tracking-tight">Prayer requests</h2>
          <div className="mt-4 space-y-3">
            {prayers.map((prayer) => (
              <AdminCard key={prayer.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{prayer.name ?? "Anonymous"}</p>
                    <p className="text-xs text-ink-faint">{when(prayer.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill ok={!prayer.isPrivate}>
                      {prayer.isPrivate ? "Pastoral team only" : "Prayer team"}
                    </StatusPill>
                    <StatusPill ok={prayer.handled}>
                      {prayer.handled ? "Done" : "Open"}
                    </StatusPill>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm text-ink-muted">
                  {prayer.request}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-ink-faint">
                    {prayer.wantsContact ? "Asked to be contacted · " : ""}
                    {[prayer.email, prayer.phone].filter(Boolean).join(" · ") ||
                      "No contact details"}
                  </p>
                  <HandledToggle kind="prayerRequest" id={prayer.id} handled={prayer.handled} />
                </div>
              </AdminCard>
            ))}
          </div>
        </section>
      ) : null}

      {messages.length ? (
        <section>
          <h2 className="font-display text-2xl tracking-tight">Messages</h2>
          <div className="mt-4 space-y-3">
            {messages.map((message) => (
              <AdminCard key={message.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {message.name}
                      {message.subject ? (
                        <span className="text-ink-muted"> — {message.subject}</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-ink-faint">{when(message.createdAt)}</p>
                  </div>
                  <StatusPill ok={message.handled}>
                    {message.handled ? "Done" : "Open"}
                  </StatusPill>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm text-ink-muted">
                  {message.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-ink-faint">
                    <a
                      href={`mailto:${message.email}`}
                      className="underline underline-offset-4"
                    >
                      {message.email}
                    </a>
                    {message.phone ? ` · ${message.phone}` : ""}
                  </p>
                  <HandledToggle
                    kind="contactMessage"
                    id={message.id}
                    handled={message.handled}
                  />
                </div>
              </AdminCard>
            ))}
          </div>
        </section>
      ) : null}

      {registrations.length ? (
        <section>
          <h2 className="font-display text-2xl tracking-tight">Event registrations</h2>
          <div className="mt-4 space-y-3">
            {registrations.map((registration) => (
              <AdminCard key={registration.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {registration.name}
                      <span className="text-ink-muted"> — {registration.eventTitle}</span>
                    </p>
                    <p className="text-xs text-ink-faint">
                      {when(registration.createdAt)} · {registration.guests} attending
                    </p>
                  </div>
                  <StatusPill ok={registration.handled}>
                    {registration.handled ? "Done" : "Open"}
                  </StatusPill>
                </div>

                {registration.notes ? (
                  <p className="mt-3 text-sm text-ink-muted">{registration.notes}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-ink-faint">
                    {[registration.email, registration.phone].filter(Boolean).join(" · ")}
                  </p>
                  <HandledToggle
                    kind="eventRegistration"
                    id={registration.id}
                    handled={registration.handled}
                  />
                </div>
              </AdminCard>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
