import { redirect } from "next/navigation";

import { signOut } from "@/app/admin/actions";
import { AdminSidebar, type NavGroup } from "@/components/admin/sidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * The authentication gate and shell for every admin page.
 *
 * Server-side and non-negotiable: an unauthenticated request never renders a
 * child page at all. The server actions repeat the check independently, because
 * a layout guard protects pages, not endpoints.
 */
export const dynamic = "force-dynamic";

/** Anything waiting on a human, counted for the Inbox badge. */
async function unhandledCount(): Promise<number> {
  try {
    const [prayer, messages, registrations] = await Promise.all([
      prisma.prayerRequest.count({ where: { handled: false } }),
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.eventRegistration.count({ where: { handled: false } }),
    ]);
    return prayer + messages + registrations;
  } catch {
    // A badge is not worth failing the whole shell over.
    return 0;
  }
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const waiting = await unhandledCount();

  const groups: NavGroup[] = [
    {
      heading: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }],
    },
    {
      heading: "Content",
      items: [
        { href: "/admin/sermons", label: "Sermons", icon: "sermons" },
        { href: "/admin/series", label: "Series", icon: "series" },
        { href: "/admin/events", label: "Events", icon: "events" },
        { href: "/admin/ministries", label: "Ministries", icon: "ministries" },
      ],
    },
    {
      heading: "The church",
      items: [
        { href: "/admin/service-times", label: "Service times", icon: "clock" },
        { href: "/admin/settings", label: "Church details", icon: "church" },
      ],
    },
    {
      heading: "People",
      items: [
        { href: "/admin/inbox", label: "Inbox", icon: "inbox", count: waiting },
        { href: "/admin/giving", label: "Giving", icon: "giving" },
      ],
    },
  ];

  return (
    <div className="min-h-dvh bg-ground lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <AdminSidebar groups={groups} email={session.email} signOut={signOut} />

      <div className="min-w-0">
        <main className="mx-auto max-w-5xl px-5 py-8 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
