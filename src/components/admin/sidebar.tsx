"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
  /** Rendered as a badge. Omitted or 0 shows nothing. */
  count?: number;
};

export type NavGroup = { heading: string; items: NavItem[] };

type IconName =
  | "dashboard"
  | "sermons"
  | "series"
  | "events"
  | "ministries"
  | "clock"
  | "church"
  | "inbox"
  | "giving";

/**
 * Single-path icons, drawn inline.
 *
 * A church admin used by three people does not need an icon package pulled over
 * a slow Cameroonian connection; nine paths cost nothing.
 */
const ICONS: Record<IconName, string> = {
  dashboard: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z",
  sermons: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5ZM8 7h8M8 11h6",
  series: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  events: "M8 2v4m8-4v4M3.5 9.5h17M4 6h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z",
  ministries:
    "M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  church: "M12 2v6m-3-3h6M6 22V11l6-4 6 4v11M4 22h16M10 22v-5h4v5",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2m20 0-3.5-7A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6Z",
  giving:
    "M20.8 5.6a5 5 0 0 0-7.1 0l-1.7 1.7-1.7-1.7a5 5 0 1 0-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 0 0 0-7.1Z",
};

function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-brand text-brand-contrast font-medium"
          : "text-ink-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon name={item.icon} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.count ? (
        <span
          className={cn(
            "min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums",
            active ? "bg-brand-contrast/20 text-brand-contrast" : "bg-accent text-accent-contrast",
          )}
        >
          {item.count > 99 ? "99+" : item.count}
        </span>
      ) : null}
    </Link>
  );
}

export function AdminSidebar({
  groups,
  email,
  signOut,
}: {
  groups: NavGroup[];
  email: string;
  /** The sign-out server action, passed down so the aside stays a client component. */
  signOut: () => Promise<void>;
}) {
  const pathname = usePathname();

  // Keyed on the path so navigating always closes the drawer, without an effect
  // that has to chase the route.
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenForPath(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /** /admin must match exactly, or every page would light up the dashboard. */
  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const currentLabel =
    groups.flatMap((group) => group.items).find((item) => isActive(item.href))?.label ?? "Admin";

  const brand = (
    <Link href="/admin" className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-display text-brand-contrast"
      >
        DV
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-display text-base tracking-tight">Divine Vision</span>
        <span className="text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint">
          Church admin
        </span>
      </span>
    </Link>
  );

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.heading}>
          <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            {group.heading}
          </p>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} active={isActive(item.href)} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const account = (
    <div className="border-t border-line p-3">
      <p className="truncate px-3 pb-2 text-xs text-ink-faint" title={email}>
        {email}
      </p>
      <div className="flex flex-col gap-1">
        <Link
          href="/en"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
          View the site
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile bar. Sticky so the menu is reachable however far you scroll. */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-ground/90 px-4 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setOpenForPath(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-line text-ink transition-colors hover:bg-surface-2"
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
        <span className="truncate font-display text-lg tracking-tight">{currentLabel}</span>
      </div>

      {/* Drawer backdrop. Hidden from assistive tech; Escape and the X also close. */}
      {open ? (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpenForPath(null)}
          className="fixed inset-0 z-40 cursor-default bg-black/50 lg:hidden"
        />
      ) : null}

      <aside
        id="admin-drawer"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-200",
          "lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-full lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          {brand}
          <button
            type="button"
            onClick={() => setOpenForPath(null)}
            className="grid size-9 place-items-center rounded-xl text-ink-muted transition-colors hover:bg-surface-2 lg:hidden"
          >
            <span className="sr-only">Close menu</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {nav}
        {account}
      </aside>
    </>
  );
}
