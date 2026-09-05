import Link from "next/link";
import { redirect } from "next/navigation";

import { signOut } from "@/app/admin/actions";
import { getSession } from "@/lib/auth";

/**
 * The authentication gate for every admin page.
 *
 * Server-side and non-negotiable: an unauthenticated request never renders a
 * child page at all. The server actions repeat the check independently, because
 * a layout guard protects pages, not endpoints.
 */
export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sermons", label: "Sermons" },
  { href: "/admin/series", label: "Series" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/ministries", label: "Ministries" },
  { href: "/admin/service-times", label: "Service times" },
  { href: "/admin/settings", label: "Church details" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/giving", label: "Giving" },
];

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-ground">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-full bg-brand font-display text-brand-contrast"
            >
              DV
            </span>
            <span className="font-display text-lg tracking-tight">Church admin</span>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/en"
              target="_blank"
              className="text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              View site
            </Link>
            <span className="hidden text-ink-faint sm:inline">{session.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-1.5 transition-colors hover:bg-surface-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Admin" className="mx-auto max-w-6xl px-5">
          <ul className="-mb-px flex gap-1 overflow-x-auto pb-0 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block whitespace-nowrap px-3 py-2.5 text-ink-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
